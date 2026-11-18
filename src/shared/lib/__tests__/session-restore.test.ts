// @vitest-environment jsdom

/**
 * Boot-time session restoration.
 *
 * The Firebase ID token lives only in memory, so a full reload empties the
 * auth store. `startSessionRestore` asks the Firebase SDK (which keeps its own
 * persisted session) for the signed-in user and hands the fresh token to the
 * store, so the existing `auth_me` flow can finish the sign-in. Every failure
 * mode must degrade to "no user": end restoring, redirect to login as before.
 */

import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

interface FakeFirebaseUser {
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
}

interface FakeAuth {
  currentUser: FakeFirebaseUser | null;
  authStateReady?: () => Promise<void>;
}

const mocks = vi.hoisted(() => ({
  setAuthToken: vi.fn(),
  clearHeaders: vi.fn(),
  isDevMockMode: vi.fn(() => false),
  getAuth: vi.fn(),
  signOutFirebase: vi.fn(async () => {}),
  onAuthStateChanged: vi.fn(),
  notifySessionExpired: vi.fn(() => true),
}));

vi.mock('@/shared/lib/graphql-client', () => ({
  setAuthToken: mocks.setAuthToken,
  clearHeaders: mocks.clearHeaders,
}));
vi.mock('@/shared/hooks/useKYC', () => ({ clearKycLink: vi.fn() }));
vi.mock('@/shared/lib/dev-config', () => ({ isDevMockMode: mocks.isDevMockMode }));
vi.mock('@/shared/lib/loopayx/firebase-client', () => ({
  getAuth: mocks.getAuth,
  signOutFirebase: mocks.signOutFirebase,
}));
vi.mock('firebase/auth', () => ({ onAuthStateChanged: mocks.onAuthStateChanged }));
vi.mock('@/shared/lib/session-expired-notice', () => ({
  notifySessionExpired: mocks.notifySessionExpired,
}));

import type { AuthUser } from '@/shared/types/auth.types';
import { useAuthStore } from '@/shared/stores/auth-store';
import { usePostLoginTransitionStore } from '@/shared/stores/use-post-login-transition';
import { decodeJwtExpiry } from '@/shared/lib/session-expiry';
import { queryClient } from '@/shared/lib/query-client';
import { memoryStorage } from '@/test/memory-storage';
import {
  AUTH_ME_QUERY_KEY,
  retrySessionRestore,
  SESSION_RESTORE_SLOW_AFTER_MS,
  SESSION_RETRY_TIMEOUT_MS,
  startSessionRestore,
} from '../session-restore';

const user = { id: 'u-1', company_name: null, roles: [], staff_roles: [] } as unknown as AuthUser;

function makeJwt(expSeconds: number): string {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'RS256' })}.${encode({ exp: expSeconds })}.sig`;
}

function firebaseUser(token: string): FakeFirebaseUser {
  return { getIdToken: vi.fn(async () => token) };
}

function useFirebase(auth: FakeAuth) {
  mocks.getAuth.mockResolvedValue(auth);
}

/** Lets the dynamic import + mocked Firebase promises resolve under fake timers. */
async function settle() {
  await vi.advanceTimersByTimeAsync(0);
  await vi.advanceTimersByTimeAsync(0);
  await vi.advanceTimersByTimeAsync(0);
}

let stop: (() => void) | null = null;

function boot(options?: Parameters<typeof startSessionRestore>[0]) {
  stop = startSessionRestore(options);
}

const state = () => useAuthStore.getState();

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('localStorage', memoryStorage());
  vi.stubGlobal('sessionStorage', memoryStorage());
  mocks.setAuthToken.mockClear();
  mocks.clearHeaders.mockClear();
  mocks.signOutFirebase.mockClear();
  mocks.onAuthStateChanged.mockReset();
  mocks.notifySessionExpired.mockClear();
  mocks.getAuth.mockReset();
  mocks.isDevMockMode.mockReturnValue(false);
  usePostLoginTransitionStore.setState({ hasPlayed: false });
  useAuthStore.setState({
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    isRestoringSession: true,
    sessionRecovery: 'idle',
  });
});

afterEach(() => {
  stop?.();
  stop = null;
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('startSessionRestore — no Firebase user', () => {
  it('ends restoring without a token so the guard can redirect to login', async () => {
    useFirebase({ currentUser: null, authStateReady: async () => {} });

    boot();
    expect(state().isRestoringSession).toBe(true);

    await settle();

    expect(state().isRestoringSession).toBe(false);
    expect(state().token).toBeNull();
    expect(state().isAuthenticated).toBe(false);
    expect(mocks.setAuthToken).not.toHaveBeenCalled();
    // Never logged in: nothing expired, so no notice.
    expect(mocks.notifySessionExpired).not.toHaveBeenCalled();
  });
});

describe('startSessionRestore — Firebase user present', () => {
  it('puts the fresh (non-forced) ID token in the store and the GraphQL header', async () => {
    const fbUser = firebaseUser('restored-token');
    useFirebase({ currentUser: fbUser, authStateReady: async () => {} });

    boot();
    await settle();

    expect(fbUser.getIdToken).toHaveBeenCalledWith();
    expect(state().token).toBe('restored-token');
    expect(mocks.setAuthToken).toHaveBeenCalledWith('restored-token');
    // Still restoring: the auth_me round-trip has not completed yet.
    expect(state().isRestoringSession).toBe(true);
    expect(state().isAuthenticated).toBe(false);
  });

  it('waits for authStateReady before reading currentUser', async () => {
    const fbUser = firebaseUser('restored-token');
    const auth: FakeAuth = { currentUser: null };
    auth.authStateReady = async () => {
      // Persistence finishes loading only now.
      auth.currentUser = fbUser;
    };
    useFirebase(auth);

    boot();
    await settle();

    expect(state().token).toBe('restored-token');
  });

  it('falls back to a one-shot onAuthStateChanged when authStateReady is unavailable', async () => {
    const unsubscribe = vi.fn();
    const fbUser = firebaseUser('fallback-token');
    const auth: FakeAuth = { currentUser: null };
    useFirebase(auth);
    mocks.onAuthStateChanged.mockImplementation(
      (_auth: unknown, callback: (u: FakeFirebaseUser | null) => void) => {
        auth.currentUser = fbUser;
        queueMicrotask(() => callback(fbUser));
        return unsubscribe;
      },
    );

    boot();
    await settle();

    expect(mocks.onAuthStateChanged).toHaveBeenCalledTimes(1);
    expect(unsubscribe).toHaveBeenCalled();
    expect(state().token).toBe('fallback-token');
  });

  it('does not play the post-login welcome for a restored session', async () => {
    useFirebase({ currentUser: firebaseUser('restored-token'), authStateReady: async () => {} });
    expect(usePostLoginTransitionStore.getState().hasPlayed).toBe(false);

    boot();
    await settle();

    expect(usePostLoginTransitionStore.getState().hasPlayed).toBe(true);
  });

  it('leaves the welcome untouched when there is nothing to restore', async () => {
    useFirebase({ currentUser: null, authStateReady: async () => {} });

    boot();
    await settle();

    expect(usePostLoginTransitionStore.getState().hasPlayed).toBe(false);
  });

  it('keeps the restored token readable for the session-expiry prompt', async () => {
    const expSeconds = Math.floor(Date.now() / 1000) + 3600;
    useFirebase({
      currentUser: firebaseUser(makeJwt(expSeconds)),
      authStateReady: async () => {},
    });

    boot();
    await settle();
    // What useSyncAuthMe does once auth_me answers.
    state().setAuth(user, state().token as string);

    expect(state().isAuthenticated).toBe(true);
    expect(decodeJwtExpiry(state().token)).toBe(expSeconds * 1000);
  });

  it('only restores a user the policy accepts', async () => {
    const fbUser = firebaseUser('restored-token');
    useFirebase({ currentUser: fbUser, authStateReady: async () => {} });
    const canRestore = vi.fn(async () => false);

    boot({ canRestore });
    await settle();

    expect(canRestore).toHaveBeenCalledWith(fbUser);
    expect(fbUser.getIdToken).not.toHaveBeenCalled();
    expect(state().token).toBeNull();
    expect(state().isRestoringSession).toBe(false);
    expect(mocks.notifySessionExpired).not.toHaveBeenCalled();
  });
});

describe('startSessionRestore — races with a live session', () => {
  it('does not overwrite a token that appeared while Firebase was answering', async () => {
    useFirebase({ currentUser: firebaseUser('stale-firebase-token'), authStateReady: async () => {} });

    boot();
    // The user signs in on /login before Firebase answers.
    state().setAuth(user, 'fresh-login-token');
    mocks.setAuthToken.mockClear();

    await settle();

    expect(state().token).toBe('fresh-login-token');
    expect(state().isAuthenticated).toBe(true);
    expect(mocks.setAuthToken).not.toHaveBeenCalled();
  });

  it('is a no-op when the store already holds a session at boot', async () => {
    state().setAuth(user, 'existing');
    mocks.setAuthToken.mockClear();

    boot();
    await settle();

    expect(mocks.getAuth).not.toHaveBeenCalled();
    expect(state().token).toBe('existing');
  });

  it('a stopped restoration (unmount / StrictMode) never touches the store', async () => {
    useFirebase({ currentUser: firebaseUser('restored-token'), authStateReady: async () => {} });

    boot();
    stop?.();
    await settle();

    expect(state().token).toBeNull();
    expect(state().isRestoringSession).toBe(true);
  });
});

describe('startSessionRestore — fails closed', () => {
  it('treats a throwing getAuth (missing Firebase config) as "no user"', async () => {
    mocks.getAuth.mockRejectedValue(new Error('Loopay X Firebase config missing.'));

    boot();
    await settle();

    expect(state().isRestoringSession).toBe(false);
    expect(state().token).toBeNull();
  });

  it('treats a rejecting authStateReady as "no user"', async () => {
    useFirebase({
      currentUser: firebaseUser('restored-token'),
      authStateReady: async () => {
        throw new Error('persistence failed');
      },
    });

    boot();
    await settle();

    expect(state().isRestoringSession).toBe(false);
    expect(state().token).toBeNull();
  });

  it('treats a failing getIdToken (offline / revoked) as "no user"', async () => {
    useFirebase({
      currentUser: {
        getIdToken: vi.fn(async () => {
          throw new Error('auth/network-request-failed');
        }),
      },
      authStateReady: async () => {},
    });

    boot();
    await settle();

    expect(state().isRestoringSession).toBe(false);
    expect(state().token).toBeNull();
    // Offline / unknown failure: we cannot say the session expired.
    expect(mocks.notifySessionExpired).not.toHaveBeenCalled();
  });

  it.each(['auth/user-token-expired', 'auth/user-disabled', 'auth/id-token-revoked'])(
    'announces the expiry once and signs out when Firebase reports %s at boot (definitive)',
    async (code) => {
      useFirebase({
        currentUser: {
          getIdToken: vi.fn(async () => {
            throw Object.assign(new Error(code), { code });
          }),
        },
        authStateReady: async () => {},
      });

      boot();
      await settle();

      expect(mocks.notifySessionExpired).toHaveBeenCalledTimes(1);
      expect(state().isRestoringSession).toBe(false);
      expect(state().token).toBeNull();
      expect(mocks.clearHeaders).toHaveBeenCalled();
    },
  );

  it('treats a throwing restore policy as "no user"', async () => {
    useFirebase({ currentUser: firebaseUser('restored-token'), authStateReady: async () => {} });

    boot({
      canRestore: async () => {
        throw new Error('boom');
      },
    });
    await settle();

    expect(state().isRestoringSession).toBe(false);
    expect(state().token).toBeNull();
  });

  it('skips Firebase entirely in dev mock mode', async () => {
    mocks.isDevMockMode.mockReturnValue(true);

    boot();
    await settle();

    expect(mocks.getAuth).not.toHaveBeenCalled();
    expect(state().isRestoringSession).toBe(false);
  });
});

describe('startSessionRestore — slow restoration (no abrupt sign-out)', () => {
  it('waits 15 seconds before it gives up on a session that cannot be restored', () => {
    expect(SESSION_RESTORE_SLOW_AFTER_MS).toBe(15_000);
  });

  it("with no token yet, fails closed to login once the wait is over and ignores Firebase's late answer", async () => {
    let release: (auth: FakeAuth) => void = () => {};
    mocks.getAuth.mockReturnValue(new Promise<FakeAuth>((resolve) => (release = resolve)));

    boot();
    await vi.advanceTimersByTimeAsync(SESSION_RESTORE_SLOW_AFTER_MS - 1);
    expect(state().isRestoringSession).toBe(true);

    await vi.advanceTimersByTimeAsync(1);
    expect(state().isRestoringSession).toBe(false);
    expect(state().sessionRecovery).toBe('idle');

    release({ currentUser: firebaseUser('too-late'), authStateReady: async () => {} });
    await settle();

    expect(state().token).toBeNull();
    expect(state().isAuthenticated).toBe(false);
  });

  it('with a restored token whose auth_me is slow, keeps the session and flags it as recovering', async () => {
    useFirebase({ currentUser: firebaseUser('restored-token'), authStateReady: async () => {} });

    boot();
    await settle();
    expect(state().token).toBe('restored-token');

    await vi.advanceTimersByTimeAsync(SESSION_RESTORE_SLOW_AFTER_MS);

    expect(state().sessionRecovery).toBe('slow');
    expect(state().token).toBe('restored-token');
    expect(state().isRestoringSession).toBe(true);
    expect(state().isAuthenticated).toBe(false);
  });

  it('never signs the user out on its own while a token exists, however long it waits', async () => {
    useFirebase({ currentUser: firebaseUser('restored-token'), authStateReady: async () => {} });

    boot();
    await settle();
    await vi.advanceTimersByTimeAsync(SESSION_RESTORE_SLOW_AFTER_MS * 10);

    expect(state().token).toBe('restored-token');
    expect(mocks.clearHeaders).not.toHaveBeenCalled();
    expect(mocks.signOutFirebase).not.toHaveBeenCalled();
  });

  it('lets a late auth_me answer finish the sign-in and drop the recovery state', async () => {
    useFirebase({ currentUser: firebaseUser('restored-token'), authStateReady: async () => {} });

    boot();
    await settle();
    await vi.advanceTimersByTimeAsync(SESSION_RESTORE_SLOW_AFTER_MS);
    expect(state().sessionRecovery).toBe('slow');

    state().setAuth(user, 'restored-token');

    expect(state().isAuthenticated).toBe(true);
    expect(state().sessionRecovery).toBe('idle');
    expect(state().isRestoringSession).toBe(false);
  });

  it('does nothing at the deadline once restoration completed normally', async () => {
    useFirebase({ currentUser: firebaseUser('restored-token'), authStateReady: async () => {} });

    boot();
    await settle();
    state().setAuth(user, 'restored-token');
    mocks.clearHeaders.mockClear();

    await vi.advanceTimersByTimeAsync(SESSION_RESTORE_SLOW_AFTER_MS * 2);

    expect(state().isAuthenticated).toBe(true);
    expect(state().token).toBe('restored-token');
    expect(state().sessionRecovery).toBe('idle');
    expect(mocks.clearHeaders).not.toHaveBeenCalled();
  });

  it('honours a custom wait', async () => {
    mocks.getAuth.mockReturnValue(new Promise(() => {}));

    boot({ slowAfterMs: 50 });
    await vi.advanceTimersByTimeAsync(50);

    expect(state().isRestoringSession).toBe(false);
  });
});

describe('retrySessionRestore', () => {
  let refetch: MockInstance<typeof queryClient.refetchQueries>;

  /** A restored token that `auth_me` has not confirmed, past the slow deadline. */
  function slowState() {
    useAuthStore.setState({
      token: 'restored-token',
      isAuthenticated: false,
      isRestoringSession: true,
      sessionRecovery: 'slow',
    });
  }

  beforeEach(() => {
    refetch = vi.spyOn(queryClient, 'refetchQueries').mockResolvedValue(undefined);
    slowState();
  });

  afterEach(() => {
    refetch.mockRestore();
  });

  it('takes a fresh token from Firebase and refetches auth_me', async () => {
    const fbUser = firebaseUser('refreshed-token');
    useFirebase({ currentUser: fbUser, authStateReady: async () => {} });

    const done = retrySessionRestore();
    await settle();
    await done;

    expect(fbUser.getIdToken).toHaveBeenCalledWith();
    expect(state().token).toBe('refreshed-token');
    expect(mocks.setAuthToken).toHaveBeenCalledWith('refreshed-token');
    expect(refetch).toHaveBeenCalledWith({ queryKey: AUTH_ME_QUERY_KEY });
    expect(mocks.clearHeaders).not.toHaveBeenCalled();
  });

  it('stays in recovery, keeping the session, until auth_me actually answers', async () => {
    useFirebase({ currentUser: firebaseUser('refreshed-token'), authStateReady: async () => {} });

    const done = retrySessionRestore();
    await settle();
    await done;

    expect(state().sessionRecovery).toBe('slow');
    expect(state().isAuthenticated).toBe(false);
    expect(state().token).toBe('refreshed-token');
  });

  it('only restores a user the policy accepts', async () => {
    const fbUser = firebaseUser('refreshed-token');
    useFirebase({ currentUser: fbUser, authStateReady: async () => {} });
    const canRestore = vi.fn(async () => false);

    const done = retrySessionRestore({ canRestore });
    await settle();
    await done;

    expect(canRestore).toHaveBeenCalledWith(fbUser);
    expect(fbUser.getIdToken).not.toHaveBeenCalled();
    // Firebase's user no longer passes the bar: that is definitive.
    expect(state().token).toBeNull();
    expect(state().sessionRecovery).toBe('idle');
    expect(state().isRestoringSession).toBe(false);
    expect(mocks.notifySessionExpired).toHaveBeenCalledTimes(1);
  });

  it('clears the session when Firebase no longer has a user (signed out elsewhere)', async () => {
    useFirebase({ currentUser: null, authStateReady: async () => {} });

    const done = retrySessionRestore();
    await settle();
    await done;

    expect(state().token).toBeNull();
    expect(state().isRestoringSession).toBe(false);
    expect(mocks.clearHeaders).toHaveBeenCalled();
    expect(refetch).not.toHaveBeenCalled();
    expect(mocks.notifySessionExpired).toHaveBeenCalledTimes(1);
  });

  it.each(['auth/user-token-expired', 'auth/user-disabled', 'auth/user-not-found'])(
    'clears the session when Firebase reports %s (definitive)',
    async (code) => {
      useFirebase({
        currentUser: {
          getIdToken: vi.fn(async () => {
            throw Object.assign(new Error(code), { code });
          }),
        },
        authStateReady: async () => {},
      });

      const done = retrySessionRestore();
      await settle();
      await done;

      expect(state().token).toBeNull();
      expect(state().isRestoringSession).toBe(false);
      expect(mocks.notifySessionExpired).toHaveBeenCalledTimes(1);
    },
  );

  it('keeps the session when Firebase only fails transiently (offline)', async () => {
    useFirebase({
      currentUser: {
        getIdToken: vi.fn(async () => {
          throw Object.assign(new Error('offline'), { code: 'auth/network-request-failed' });
        }),
      },
      authStateReady: async () => {},
    });

    const done = retrySessionRestore();
    await settle();
    await done;

    expect(state().token).toBe('restored-token');
    expect(state().sessionRecovery).toBe('slow');
    expect(mocks.clearHeaders).not.toHaveBeenCalled();
    expect(refetch).not.toHaveBeenCalled();
    expect(mocks.notifySessionExpired).not.toHaveBeenCalled();
  });

  it('keeps the session when Firebase itself hangs, and gives control back after the retry timeout', async () => {
    mocks.getAuth.mockReturnValue(new Promise(() => {}));

    let finished = false;
    const done = retrySessionRestore().then(() => {
      finished = true;
    });
    await vi.advanceTimersByTimeAsync(SESSION_RETRY_TIMEOUT_MS - 1);
    expect(finished).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await done;

    expect(finished).toBe(true);
    expect(state().token).toBe('restored-token');
    expect(state().sessionRecovery).toBe('slow');
    expect(mocks.clearHeaders).not.toHaveBeenCalled();
    expect(mocks.notifySessionExpired).not.toHaveBeenCalled();
  });

  it('gives control back after the retry timeout when auth_me itself hangs', async () => {
    useFirebase({ currentUser: firebaseUser('refreshed-token'), authStateReady: async () => {} });
    refetch.mockReturnValue(new Promise(() => {}));

    const done = retrySessionRestore();
    await vi.advanceTimersByTimeAsync(SESSION_RETRY_TIMEOUT_MS);
    await done;

    expect(state().token).toBe('refreshed-token');
    expect(state().sessionRecovery).toBe('slow');
  });

  it('is a no-op for a session that is already authenticated', async () => {
    state().setAuth(user, 'live-token');
    mocks.setAuthToken.mockClear();

    await retrySessionRestore();

    expect(mocks.getAuth).not.toHaveBeenCalled();
    expect(state().token).toBe('live-token');
  });

  it('is a no-op once restoration has ended (the user chose to go to login)', async () => {
    state().clearAuth();

    await retrySessionRestore();

    expect(mocks.getAuth).not.toHaveBeenCalled();
    expect(state().token).toBeNull();
  });

  it('never overwrites a sign-in that landed while Firebase was answering', async () => {
    useFirebase({ currentUser: firebaseUser('stale-token'), authStateReady: async () => {} });

    const done = retrySessionRestore();
    state().setAuth(user, 'fresh-login-token');
    mocks.setAuthToken.mockClear();
    await settle();
    await done;

    expect(state().token).toBe('fresh-login-token');
    expect(mocks.setAuthToken).not.toHaveBeenCalled();
    expect(refetch).not.toHaveBeenCalled();
    expect(mocks.notifySessionExpired).not.toHaveBeenCalled();
  });

  it('does not announce anything when the user already left (retry after "Volver a ingresar")', async () => {
    state().clearAuth();

    await retrySessionRestore();

    expect(mocks.notifySessionExpired).not.toHaveBeenCalled();
  });
});
