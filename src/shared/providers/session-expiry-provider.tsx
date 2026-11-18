/**
 * SessionExpiryProvider
 *
 * Warns the user shortly before the session token expires and lets them keep
 * the session going instead of being kicked out.
 *
 * Everything is derived from `useAuthStore.token`: its JWT `exp` claim decides
 * when the prompt appears, so a token rotated elsewhere (login, the reauth
 * modal, this provider) reschedules everything by itself. Remaining time is
 * always computed from `Date.now()` against `exp`, never by decrementing a
 * counter, so throttled background tabs stay accurate.
 *
 * - "Keep the session": force-refreshes the Firebase ID token and swaps it in
 *   the store and the GraphQL header (`setToken`).
 * - "Sign out" / countdown reaching zero: `clearAuth()`, the normal logout
 *   path. Redirecting to login is the route guards' job (`ProtectedRoute`
 *   reacts to `isAuthenticated`), so there is deliberately no second
 *   redirect here — this provider lives above the router and could not do it.
 *
 * QA: set `VITE_SESSION_WARNING_LEAD_SECONDS` (seconds before expiry at which
 * the prompt shows; must be lower than the token lifetime, ~3600) to test
 * without waiting ~55 minutes. Defaults to 300.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { useLingui } from '@lingui/react/macro';
import { SessionExpiryModal } from '@/shared/components/common/session-expiry-modal';
import { notifySessionExpired } from '@/shared/lib/session-expired-notice';
import { selectIsAuthenticated, selectToken, useAuthStore } from '@/shared/stores/auth-store';
import {
  MAX_TIMEOUT_MS,
  decodeJwtExpiry,
  getMsUntilWarning,
  getRemainingSeconds,
  resolveWarningLeadSeconds,
} from '@/shared/lib/session-expiry';

export interface SessionExpiryProviderProps {
  children: ReactNode;
  /** Overrides the lead time (seconds before expiry). Mostly for tests. */
  warningLeadSeconds?: number;
}

export function SessionExpiryProvider({ children, warningLeadSeconds }: SessionExpiryProviderProps) {
  const { t } = useLingui();
  const token = useAuthStore(selectToken);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  const leadSeconds =
    warningLeadSeconds ??
    resolveWarningLeadSeconds(import.meta.env.VITE_SESSION_WARNING_LEAD_SECONDS);

  // Not verified client-side: this is only used for UX timing.
  const expiresAt = useMemo(
    () => (isAuthenticated ? decodeJwtExpiry(token) : null),
    [isAuthenticated, token],
  );

  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const refreshingRef = useRef(false);

  const renewedMessage = t`Tu sesión se renovó.`;

  /**
   * Ends the session because time ran out. Idempotent. The expiry notice is the
   * shared one (`notifySessionExpired`), so it is never doubled with another path.
   */
  const expire = useCallback(() => {
    const { isAuthenticated: signedIn, clearAuth } = useAuthStore.getState();
    if (!signedIn) return;

    notifySessionExpired();
    clearAuth();
  }, []);

  // Schedule the prompt for `exp - lead`, following every new token.
  useEffect(() => {
    setOpen(false);
    setRefreshFailed(false);
    if (expiresAt === null) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const check = () => {
      clearTimeout(timeoutId);
      const current = Date.now();

      if (current >= expiresAt) {
        expire();
        return;
      }

      const wait = getMsUntilWarning(expiresAt, leadSeconds, current);
      if (wait === 0) {
        setNow(current);
        setOpen(true);
        return;
      }

      timeoutId = setTimeout(check, Math.min(wait, MAX_TIMEOUT_MS));
    };

    // A background tab may have throttled the timeout: re-evaluate on return.
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') check();
    };

    check();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [expiresAt, leadSeconds, expire]);

  // Live countdown while the prompt is open.
  useEffect(() => {
    if (!open || expiresAt === null) return;

    const tick = () => {
      const current = Date.now();
      setNow(current);
      if (current >= expiresAt) expire();
    };

    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [open, expiresAt, expire]);

  const handleContinue = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    setRefreshFailed(false);

    const tokenAtStart = useAuthStore.getState().token;

    try {
      const { getAuth } = await import('@/shared/lib/loopayx/firebase-client');
      const auth = await getAuth();
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('No Firebase session to refresh');

      const freshToken = await firebaseUser.getIdToken(true);

      // Logged out (or the token rotated elsewhere) while waiting: do not
      // revive or overwrite that state.
      const state = useAuthStore.getState();
      if (!state.isAuthenticated || state.token !== tokenAtStart) return;

      state.setToken(freshToken);
      setOpen(false);
      toast.success(renewedMessage);
    } catch {
      setRefreshFailed(true);
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, [renewedMessage]);

  const handleLogout = useCallback(() => {
    useAuthStore.getState().clearAuth();
  }, []);

  return (
    <>
      {children}
      <SessionExpiryModal
        open={open && expiresAt !== null}
        remainingSeconds={expiresAt === null ? 0 : getRemainingSeconds(expiresAt, now)}
        refreshing={refreshing}
        refreshFailed={refreshFailed}
        onContinue={() => void handleContinue()}
        onLogout={handleLogout}
      />
    </>
  );
}
