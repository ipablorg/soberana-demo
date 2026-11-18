/**
 * mfa-enroll-dismissal
 *
 * Persistence for the optional post-registration 2FA enrollment
 * invitation. The invitation is dismissible by spec (TOTP enrollment is
 * optional for non-staff customers) and the dismissal must survive
 * reloads so the banner never nags on every visit.
 *
 * Stored in localStorage under the key the dashboard suggestion banner
 * has used since it shipped, so existing users who already dismissed
 * the invitation keep their dismissal.
 */

const DISMISSAL_KEY = 'mfa_suggestion_dismissed';

export function isMfaEnrollInviteDismissed(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(DISMISSAL_KEY) === '1';
  } catch {
    // Private-browsing / blocked storage: treat as dismissed so a
    // broken localStorage never turns the invitation into a nag.
    return true;
  }
}

export function dismissMfaEnrollInvite(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DISMISSAL_KEY, '1');
  } catch {
    // Best-effort persistence; the in-memory hide still applies for
    // the current session.
  }
}
