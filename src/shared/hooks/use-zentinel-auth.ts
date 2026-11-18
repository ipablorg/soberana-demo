/**
 * Zentinel auth state — the JWT required by every authenticated call.
 *
 * Storage contract (FRONTEND_PRODUCTION_CHECKLIST.md §9.1):
 *   The Zentinel JWT lives ONLY in memory (module-level closure). We
 *   deliberately do NOT touch `localStorage`, `sessionStorage`, cookies,
 *   or the URL. Closing/refreshing the tab drops the Zentinel session;
 *   Phase 7 (`loginZentinelWith`, called from Soberana `useSignIn`) is
 *   what reconstructs it on the next Soberana login — we do NOT rely on
 *   browser storage to survive a reload.
 *
 *   The `X-Soberana-Token` is never persisted here either; it is read
 *   on every request from `useAuthStore` by the client's factory.
 *
 * Refresh policy (guide §2.2):
 *   Zentinel has no refresh-token. `/auth/refresh` requires the current
 *   Bearer JWT and returns a new one. So:
 *     - If the JWT is still live → call `refresh_session()` to rotate.
 *     - If the JWT expired or `/auth/refresh` returns 401 → fall back to
 *       `loginZentinelWith(email, password)` if credentials are known
 *       (dev env vars), otherwise emit an `unauthenticated` state and
 *       let the UI surface "Zentinel offline".
 *
 * Dev auto-login:
 *   `VITE_ZENTINEL_DEV_EMAIL` + `VITE_ZENTINEL_DEV_PASSWORD` trigger a
 *   background login on first mount so local flows "just work" without
 *   a manual step. These vars are blank in `.env.production` — prod
 *   always goes through the Phase 7 login chain.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getZentinelClient,
  configureZentinelClient,
  ZentinelApiError,
  type ZentinelLoginResponse,
} from '@/shared/lib/zentinel-client';
import { registerLogoutHook, useAuthStore } from '@/shared/stores/auth-store';

/** Refresh preemptively once the remaining TTL drops below this. */
const REFRESH_BUFFER_MS = 2 * 60 * 1000;

interface InMemorySession {
  access_token: string;
  token_type: 'Bearer';
  expires_at: number;
  user: ZentinelLoginResponse['user'];
}

interface ZentinelAuthState {
  session: InMemorySession | null;
  is_authenticating: boolean;
  error: string | null;
}

// ──────────────────────────────────────────────────────────────────────
// Module-level state — shared by every consumer of the hook so they
// observe the same login/logout transitions without prop drilling.
// This object holds the JWT; it NEVER touches window.localStorage or
// window.sessionStorage. See the storage contract at the top.
// ──────────────────────────────────────────────────────────────────────

type Listener = () => void;
const listeners = new Set<Listener>();
let state: ZentinelAuthState = {
  session: null,
  is_authenticating: false,
  error: null,
};

/**
 * Credentials captured from the Soberana login flow (Phase 7). Held in
 * memory only, alongside the JWT. These let the preemptive refresh
 * cycle keep working even when `/auth/refresh` itself fails (e.g. TTL
 * elapsed while the tab was backgrounded). Cleared by `logoutZentinel`.
 */
let cached_credentials: { email: string; password: string } | null = null;

function setState(patch: Partial<ZentinelAuthState>): void {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

configureZentinelClient({
  jwt_provider: () => state.session?.access_token ?? null,
});

// Chain Zentinel logout into the Soberana logout path. Registered at
// module import time so every `clearAuth()` (topbar logout, auth-guard
// bounce, token expiry, etc.) also drops the Zentinel session.
registerLogoutHook(() => {
  performLogout();
});

let in_flight_login: Promise<InMemorySession | null> | null = null;
let in_flight_soberana_login: Promise<InMemorySession | null> | null = null;

/**
 * Read the Soberana (Firebase) token outside the React tree. This is the
 * same token the client forwards as `X-Soberana-Token`; it is persisted by
 * `auth-store` and restored on reload, which is why it — not the in-memory
 * Zentinel JWT — is what lets us re-establish the Zentinel session.
 */
function getSoberanaToken(): string | null {
  try {
    return useAuthStore.getState().token ?? null;
  } catch {
    return null;
  }
}

function toSession(res: ZentinelLoginResponse): InMemorySession {
  return {
    access_token: res.access_token,
    token_type: res.token_type,
    expires_at: Date.now() + res.expires_in * 1000,
    user: res.user,
  };
}

async function performLogin(
  email: string,
  password: string,
  { remember_credentials = true }: { remember_credentials?: boolean } = {},
): Promise<InMemorySession | null> {
  if (in_flight_login) return in_flight_login;
  setState({ is_authenticating: true, error: null });
  const client = getZentinelClient();
  in_flight_login = (async () => {
    try {
      const res = await client.login(email, password);
      const session = toSession(res);
      if (remember_credentials) {
        cached_credentials = { email, password };
      }
      setState({ session, is_authenticating: false, error: null });
      return session;
    } catch (err) {
      const msg =
        err instanceof ZentinelApiError
          ? err.detail.kind === 'auth'
            ? 'Invalid credentials'
            : err.message
          : 'Login failed';
      setState({ is_authenticating: false, error: msg });
      return null;
    } finally {
      in_flight_login = null;
    }
  })();
  return in_flight_login;
}

/**
 * Production auth path: exchange the Soberana session for a Zentinel JWT
 * via `/auth/soberana` (no email/password). Non-throwing — if Zentinel
 * rejects the token the rest of the app keeps working and the UI surfaces
 * "Zentinel offline". Does NOT cache credentials (there are none).
 */
async function performSoberanaLogin(): Promise<InMemorySession | null> {
  if (in_flight_soberana_login) return in_flight_soberana_login;
  setState({ is_authenticating: true, error: null });
  const client = getZentinelClient();
  in_flight_soberana_login = (async () => {
    try {
      const res = await client.login_with_soberana();
      const session = toSession(res);
      setState({ session, is_authenticating: false, error: null });
      return session;
    } catch (err) {
      const msg =
        err instanceof ZentinelApiError
          ? err.detail.kind === 'auth'
            ? 'Soberana session not accepted by Zentinel'
            : err.message
          : 'Zentinel login failed';
      setState({ is_authenticating: false, error: msg });
      return null;
    } finally {
      in_flight_soberana_login = null;
    }
  })();
  return in_flight_soberana_login;
}

/**
 * Rotate the JWT via `/auth/refresh` using the current Bearer. Falls
 * back to re-establishing the session if refresh fails (e.g. JWT already
 * expired): the Soberana token exchange first (production), then cached
 * dev credentials (local). Returns the refreshed session, or `null` if we
 * cannot recover silently (UI must surface a re-auth).
 */
async function performRefresh(): Promise<InMemorySession | null> {
  if (!state.session && !cached_credentials && !getSoberanaToken()) return null;
  setState({ is_authenticating: true, error: null });
  const client = getZentinelClient();
  try {
    if (state.session) {
      const res = await client.refresh_session();
      const session = toSession(res);
      setState({ session, is_authenticating: false, error: null });
      return session;
    }
  } catch {
    // Fall through to re-establishing the session below.
  }
  setState({ is_authenticating: false });
  if (getSoberanaToken()) {
    return performSoberanaLogin();
  }
  if (cached_credentials) {
    return performLogin(cached_credentials.email, cached_credentials.password);
  }
  return null;
}

function performLogout(): void {
  cached_credentials = null;
  setState({ session: null, error: null });
}

function getDevCredentials(): { email: string; password: string } | null {
  // Exact `import.meta.env.X` form so Vite does its static substitution.
  // Guard the object itself — not `import.meta` — or the replacement
  // silently no-ops and the dev auto-login never fires.
  const env = import.meta.env as Record<string, string | undefined>;
  if (!env) return null;
  const email = env.VITE_ZENTINEL_DEV_EMAIL?.trim();
  const password = env.VITE_ZENTINEL_DEV_PASSWORD?.trim();
  if (!email || !password) return null;
  return { email, password };
}

// ──────────────────────────────────────────────────────────────────────
// Top-level imperative API — used by the Soberana auth-chain wiring
// (see `use-sign-in.ts` for login and `auth-store.ts` for logout).
// Exposed outside the React tree because both call sites fire before
// (or outside of) a component render and therefore cannot use hooks.
// ──────────────────────────────────────────────────────────────────────

/**
 * Log into Zentinel in the background after a successful Soberana
 * login, using the same credentials. Intentionally non-throwing: if
 * Zentinel is unreachable the rest of the app still works; the UI
 * surfaces "Zentinel offline" via `useZentinelAuth().is_authenticated`.
 */
export async function loginZentinelWith(
  email: string,
  password: string,
): Promise<boolean> {
  const session = await performLogin(email, password);
  return session !== null;
}

/**
 * Production auth path: establish a Zentinel session from the current
 * Soberana (Firebase) token via `/auth/soberana`. Called from the Soberana
 * sign-in chain (`use-sign-in.ts`) right after `setAuth` populates the
 * token. Soberana users have no Zentinel password, so this — not
 * `loginZentinelWith` — is what connects them. Non-throwing.
 */
export async function loginZentinelFromSoberana(): Promise<boolean> {
  const session = await performSoberanaLogin();
  return session !== null;
}

/**
 * Wipe Zentinel auth state. Called by `authStore.clearAuth` so a
 * Soberana logout also drops the Zentinel session.
 */
export function logoutZentinel(): void {
  performLogout();
}

// ──────────────────────────────────────────────────────────────────────
// Public hook
// ──────────────────────────────────────────────────────────────────────

export interface UseZentinelAuthResult {
  is_authenticated: boolean;
  is_authenticating: boolean;
  user: ZentinelLoginResponse['user'] | null;
  error: string | null;
  /** Raw JWT — needed by the streaming hook to forward to fetch. */
  access_token: string | null;
  /** Called by the streaming hook after a 401 to regain a valid JWT. */
  refresh: () => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export function useZentinelAuth(): UseZentinelAuthResult {
  const [snapshot, setSnapshot] = useState<ZentinelAuthState>(state);
  const auto_login_tried = useRef(false);
  // Last Soberana token we attempted a token-exchange for. Guards the
  // auto-login below so a failure does not loop — we only retry when the
  // token value itself changes (new login / refreshed Firebase token).
  const soberana_login_attempted_for = useRef<string | null>(null);

  // Subscribe to the Soberana token so the effect below re-runs both on a
  // fresh login AND on session restore after reload (the token is
  // rehydrated from localStorage by `AuthInitializer`).
  const soberanaToken = useAuthStore((s) => s.token);

  useEffect(() => {
    const l: Listener = () => setSnapshot(state);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  // Production auto-login: exchange the Soberana token for a Zentinel JWT
  // whenever we have a Soberana session but no Zentinel one. This is what
  // makes the chat already say "Conectado" on entry, without a click —
  // covering both fresh login and reload (restored token).
  useEffect(() => {
    if (!soberanaToken) return;
    if (state.session || state.is_authenticating) return;
    if (soberana_login_attempted_for.current === soberanaToken) return;
    soberana_login_attempted_for.current = soberanaToken;
    void performSoberanaLogin();
  }, [soberanaToken, snapshot.session, snapshot.is_authenticating]);

  // Dev-only auto-login (email/password). Only a fallback for local envs
  // with NO Soberana session — when a Soberana token exists the
  // token-exchange path above owns auth. Attempted once per app lifecycle
  // so a failure does not loop. Real auth bugs must surface; we don't mask.
  useEffect(() => {
    if (auto_login_tried.current) return;
    if (state.session || state.is_authenticating) return;
    if (getSoberanaToken()) return;
    const creds = getDevCredentials();
    if (!creds) return;
    auto_login_tried.current = true;
    void performLogin(creds.email, creds.password);
  }, [snapshot.session, snapshot.is_authenticating]);

  // Preemptive refresh. We try `/auth/refresh` (cheap — rotates TTL on
  // the existing JWT) and only drop to full re-login as a fallback.
  useEffect(() => {
    const s = snapshot.session;
    if (!s) return;
    const remaining = s.expires_at - Date.now();
    if (remaining <= 0) {
      void performRefresh();
      return;
    }
    const timeout = Math.max(remaining - REFRESH_BUFFER_MS, 1000);
    const id = window.setTimeout(() => {
      void performRefresh();
    }, timeout);
    return () => window.clearTimeout(id);
  }, [snapshot.session]);

  const login = useCallback(
    async (email: string, password: string) => loginZentinelWith(email, password),
    [],
  );

  const refresh = useCallback(async () => {
    const res = await performRefresh();
    return res !== null;
  }, []);

  const logout = useCallback(() => {
    performLogout();
  }, []);

  return useMemo(
    () => ({
      is_authenticated: !!snapshot.session,
      is_authenticating: snapshot.is_authenticating,
      user: snapshot.session?.user ?? null,
      error: snapshot.error,
      access_token: snapshot.session?.access_token ?? null,
      refresh,
      login,
      logout,
    }),
    [snapshot, refresh, login, logout],
  );
}
