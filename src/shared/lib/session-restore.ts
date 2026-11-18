/**
 * Session restoration on page load.
 *
 * The Firebase ID token lives only in memory (`useAuthStore`), so a full reload
 * empties the store even though the Firebase SDK still has the user persisted
 * in IndexedDB. `startSessionRestore` bridges that gap without storing anything
 * new: it asks the SDK for the signed-in user, takes a fresh ID token and hands
 * it to `restoreToken`. From there the existing `auth_me` flow in
 * `AuthInitializer` finishes the sign-in (`setAuth`).
 *
 * `isRestoringSession` (store) is true throughout, so `ProtectedRoute` shows
 * the loading screen instead of redirecting to /login. It ends when:
 *   - Firebase has no (restorable) user            -> `endSessionRestore` (never
 *                                                     signed in: no notice)
 *   - Firebase says the user is gone for good      -> expiry notice + `clearAuth`
 *   - `auth_me` succeeded                          -> `setAuth`
 *   - `auth_me` was definitively rejected          -> expiry notice + `clearAuth`
 *                                                     (see `AuthInitializer`)
 *   - no token exists after the wait               -> give up, back to login
 *
 * Slow is not the same as failed. When a token WAS restored but `auth_me` has
 * not answered after `SESSION_RESTORE_SLOW_AFTER_MS`, nothing is torn down:
 * `sessionRecovery` flips to `'slow'` and `ProtectedRoute` shows a screen where
 * the user picks "Intentar nuevamente" (`retrySessionRestore`) or "Volver a
 * ingresar" (an explicit `clearAuth`, no expiry notice: the user chose to
 * leave). This module never signs anyone out on a timer while a token exists.
 *
 * Every definitive end shows the same one-time "session expired" notice
 * (`notifySessionExpired`) so the user understands why /login appeared.
 *
 * The mirror image is `registerFirebaseSignOutHook`: every `clearAuth` also
 * signs Firebase out, otherwise a manual logout, an expired session or a
 * rejected token would be silently undone by the next reload.
 */

import type { Auth, User } from 'firebase/auth';
import { getAuth, signOutFirebase } from '@/shared/lib/loopayx/firebase-client';
import { isDevMockMode } from '@/shared/lib/dev-config';
import { queryClient } from '@/shared/lib/query-client';
import { notifySessionExpired } from '@/shared/lib/session-expired-notice';
import { registerLogoutHook, useAuthStore } from '@/shared/stores/auth-store';
import { usePostLoginTransitionStore } from '@/shared/stores/use-post-login-transition';

/**
 * How long to wait for the restoration (Firebase read + token + `auth_me`)
 * before acting: with a token it offers recovery, without one it gives up and
 * falls back to the login redirect.
 */
export const SESSION_RESTORE_SLOW_AFTER_MS = 15_000;

/** Upper bound for one "Reintentar" attempt before control goes back to the user. */
export const SESSION_RETRY_TIMEOUT_MS = 15_000;

/** TanStack Query key of the `auth_me` request that completes a restore. */
export const AUTH_ME_QUERY_KEY = ['auth', 'me'] as const;

/**
 * Firebase errors that mean the persisted user is gone for good (revoked,
 * disabled, deleted). Anything else (offline, quota, ...) is treated as
 * temporary during a retry.
 */
const DEFINITIVE_FIREBASE_ERROR_CODES = new Set([
  'auth/user-token-expired',
  'auth/user-disabled',
  'auth/user-not-found',
  'auth/invalid-user-token',
  'auth/id-token-revoked',
]);

type CanRestore = (user: User) => boolean | Promise<boolean>;

export interface SessionRestoreOptions {
  /** Overrides the wait before acting on a slow restoration. Mostly for tests. */
  slowAfterMs?: number;
  /**
   * Extra policy a persisted Firebase user must pass to be restored (e.g. the
   * same enforcement a fresh sign-in applies). A throw counts as "no".
   */
  canRestore?: CanRestore;
}

export interface SessionRetryOptions {
  /** Same policy as boot. */
  canRestore?: CanRestore;
  /** Overrides `SESSION_RETRY_TIMEOUT_MS`. Mostly for tests. */
  timeoutMs?: number;
}

/**
 * Resolves once the SDK has loaded its persisted state. Reading
 * `auth.currentUser` earlier can be `null` while persistence is still loading.
 */
async function waitForAuthState(auth: Auth): Promise<void> {
  if (typeof auth.authStateReady === 'function') {
    await auth.authStateReady();
    return;
  }

  // Older SDKs: the first `onAuthStateChanged` emission means "settled".
  const { onAuthStateChanged } = await import('firebase/auth');
  await new Promise<void>((resolve) => {
    // The SDK always emits asynchronously, so `unsubscribe` is assigned by then.
    const unsubscribe = onAuthStateChanged(auth, () => {
      unsubscribe();
      resolve();
    });
  });
}

type RestorableToken =
  | { status: 'token'; token: string }
  /** Firebase answered: nobody to restore (or the policy refuses them). */
  | { status: 'none' }
  /** Firebase (or the policy) threw. `definitive` = the user is gone for good. */
  | { status: 'error'; definitive: boolean };

function isDefinitiveFirebaseError(error: unknown): boolean {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === 'string' && DEFINITIVE_FIREBASE_ERROR_CODES.has(code);
}

/**
 * The persisted user's fresh ID token. Never throws: every failure is reported
 * in the result so callers can tell "nobody there" from "could not ask".
 */
async function readRestorableToken(canRestore: CanRestore | undefined): Promise<RestorableToken> {
  try {
    const auth = await getAuth();
    await waitForAuthState(auth);

    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return { status: 'none' };
    if (canRestore && !(await canRestore(firebaseUser))) return { status: 'none' };

    // No force refresh: the SDK returns the cached token while it is valid and
    // refreshes it itself when it is about to expire.
    return { status: 'token', token: await firebaseUser.getIdToken() };
  } catch (error) {
    return { status: 'error', definitive: isDefinitiveFirebaseError(error) };
  }
}

/**
 * Starts restoring the session. Call once on app mount; the returned function
 * cancels a still-pending attempt (unmount, StrictMode double-invoke) so a late
 * answer never touches the store.
 */
export function startSessionRestore(options: SessionRestoreOptions = {}): () => void {
  const { slowAfterMs = SESSION_RESTORE_SLOW_AFTER_MS, canRestore } = options;
  const noop = () => {};

  const initial = useAuthStore.getState();
  // Dev mock mode has no Firebase session; a live session needs no restoring.
  if (isDevMockMode() || initial.token || !initial.isRestoringSession) {
    initial.endSessionRestore();
    return noop;
  }

  let cancelled = false;

  const timer = setTimeout(() => {
    const state = useAuthStore.getState();
    if (!state.isRestoringSession) return;

    if (state.token && !state.isAuthenticated) {
      // Token restored but `auth_me` has not answered: slow, not failed. Keep
      // the session and let the user choose (retry / go to login).
      state.markSessionRecoverySlow();
      return;
    }

    // Still no token after the wait (Firebase hung or has nobody): fail closed
    // to login and ignore whatever Firebase answers later.
    cancelled = true;
    state.endSessionRestore();
  }, slowAfterMs);

  void (async () => {
    const result = await readRestorableToken(canRestore);
    if (cancelled) return;

    const store = useAuthStore.getState();
    if (result.status === 'error' && result.definitive) {
      // A persisted user existed but Firebase says it is gone for good
      // (revoked, disabled, deleted): a real expiry. Sign it out (this also
      // drops the persisted Firebase user, so the next reload does not repeat
      // it) and say why.
      notifySessionExpired();
      store.clearAuth();
      return;
    }
    if (result.status !== 'token') {
      // No user, refused by the policy, or Firebase failed transiently before
      // any token existed: nothing was signed in (or we cannot tell), so fail
      // closed to login quietly, as always.
      store.endSessionRestore();
      return;
    }

    if (!store.restoreToken(result.token)) {
      // A sign-in got there first (or restoration already ended).
      store.endSessionRestore();
      return;
    }

    // The user was already welcomed in an earlier visit: no splash on reload.
    usePostLoginTransitionStore.getState().markPlayed();
    // Stays restoring until auth_me resolves: `setAuth` / `clearAuth` end it,
    // and the timer above flags it as slow if it never does.
  })();

  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}

/**
 * "Intentar nuevamente" on the recovery screen. Asks Firebase for a fresh token (the
 * SDK refreshes it if it is about to expire), swaps it in and refetches
 * `auth_me`; the existing sync then finishes the sign-in (`setAuth`) or
 * `AuthInitializer` handles a definitive rejection.
 *
 * Only a definitive answer ends the session here: Firebase has no user any
 * more, the policy refuses them, or the SDK reports a revoked/disabled user.
 * The session is then over for real, so the user gets the expiry notice and
 * lands on login. Being offline, Firebase hanging or `auth_me` still failing
 * leaves everything as it was; an `auth_me` that now answers 401 is handled by
 * `AuthInitializer` (same notice). Always resolves, at the latest after
 * `timeoutMs`, so the button gets its turn back.
 */
export async function retrySessionRestore(options: SessionRetryOptions = {}): Promise<void> {
  const { canRestore, timeoutMs = SESSION_RETRY_TIMEOUT_MS } = options;
  // Open = a restored token is still waiting to be confirmed.
  const isOpen = () => {
    const { isRestoringSession, isAuthenticated } = useAuthStore.getState();
    return isRestoringSession && !isAuthenticated;
  };

  if (!isOpen()) return;

  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, timeoutMs);
  });

  const attempt = (async () => {
    const result = await readRestorableToken(canRestore);
    // A sign-in, a logout or another retry settled things while we waited.
    if (!isOpen()) return;

    if (result.status === 'none' || (result.status === 'error' && result.definitive)) {
      // The session we were recovering is gone: tell the user, then leave.
      notifySessionExpired();
      useAuthStore.getState().clearAuth();
      return;
    }
    if (result.status === 'error') return;

    if (!useAuthStore.getState().restoreToken(result.token)) return;
    await queryClient.refetchQueries({ queryKey: AUTH_ME_QUERY_KEY });
  })().catch(() => {
    // Transient by definition: the user can retry again.
  });

  try {
    await Promise.race([attempt, deadline]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Signs the Firebase user out on every `clearAuth` (manual logout, session
 * expiry, rejected `auth_me`). Hooks run synchronously and swallow errors, so
 * the async sign-out is fire-and-forget; `signOutFirebase` never rejects.
 */
export function registerFirebaseSignOutHook(): () => void {
  return registerLogoutHook(() => {
    void signOutFirebase();
  });
}
