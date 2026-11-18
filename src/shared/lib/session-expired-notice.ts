/**
 * The single "your session expired" notice.
 *
 * Whenever a session ends because its credentials are definitively gone (the
 * `auth_me` request was rejected, Firebase says the user no longer exists, the
 * token simply ran out), the user lands on the login page. Without a message
 * that looks like a random logout, so every such path calls
 * `notifySessionExpired()` right before `clearAuth()`.
 *
 * It is deliberately NOT called when the user chose to leave (manual logout,
 * "Volver a ingresar" on the recovery screen) or when nothing was ever signed
 * in (no persisted Firebase user at boot): none of those is an expiry.
 *
 * Several paths can report one expiry (a retry that finds Firebase empty while
 * `auth_me` also fails, React StrictMode running an effect twice...), so the
 * notice is shown once and only re-armed by the next successful sign-in. The
 * toast lives in the app-level `Toaster`, above the router, so it survives the
 * redirect to /login.
 */

import { t } from '@lingui/core/macro';
import { toast } from 'sonner';
import { useAuthStore } from '@/shared/stores/auth-store';

/** Stable id: sonner also collapses a same-id toast that is still on screen. */
export const SESSION_EXPIRED_TOAST_ID = 'session-expired';

let announced = false;

/**
 * Shows "Tu sesión venció. Vuelve a ingresar." unless it was already shown for
 * this expiry. Returns whether it actually showed it.
 */
export function notifySessionExpired(): boolean {
  if (announced) return false;
  announced = true;

  try {
    toast.error(t`Tu sesión venció. Vuelve a ingresar.`, { id: SESSION_EXPIRED_TOAST_ID });
  } catch {
    // Best effort: a failed toast (i18n not ready, toaster gone) must never keep
    // the caller from ending the session it is about to clear.
  }
  return true;
}

/** Re-arms the notice. Runs on every new sign-in; exported for tests. */
export function resetSessionExpiredNotice(): void {
  announced = false;
}

// A signed-in user has a fresh session that can expire again later.
useAuthStore.subscribe((state, previous) => {
  if (state.isAuthenticated && !previous.isAuthenticated) resetSessionExpiredNotice();
});
