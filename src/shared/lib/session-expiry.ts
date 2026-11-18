/**
 * Session expiry helpers
 *
 * Pure functions behind the "keep your session?" prompt. The session token is
 * a Firebase ID token (about one hour). Its expiry is read from the JWT `exp`
 * claim purely for UX timing: the signature is NOT verified here and nothing in
 * this module is a security decision — the backend remains the authority.
 */

/** Seconds before expiry at which the prompt is shown. */
export const DEFAULT_SESSION_WARNING_LEAD_SECONDS = 300;

/** Announcements to assistive tech only change at this granularity. */
const ANNOUNCEMENT_STEP_SECONDS = 30;

/** Largest delay `setTimeout` accepts (about 24.8 days). */
export const MAX_TIMEOUT_MS = 2_147_483_647;

function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return atob(padded);
}

/**
 * Reads the `exp` claim of a JWT.
 *
 * @returns the expiry as epoch milliseconds, or `null` for anything that is not
 * a decodable JWT with a positive numeric `exp` (never throws).
 */
export function decodeJwtExpiry(token: string | null | undefined): number | null {
  if (typeof token !== 'string') return null;

  const segments = token.split('.');
  if (segments.length !== 3) return null;

  try {
    const claims: unknown = JSON.parse(decodeBase64Url(segments[1] as string));
    if (typeof claims !== 'object' || claims === null) return null;

    const exp = (claims as { exp?: unknown }).exp;
    if (typeof exp !== 'number' || !Number.isFinite(exp) || exp <= 0) return null;

    return exp * 1000;
  } catch {
    return null;
  }
}

/**
 * Reads `VITE_SESSION_WARNING_LEAD_SECONDS` (a positive number of seconds).
 * Anything invalid falls back to the default.
 */
export function resolveWarningLeadSeconds(raw: string | undefined): number {
  const parsed = Number(raw);
  return raw && Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_SESSION_WARNING_LEAD_SECONDS;
}

/** Milliseconds until the prompt is due; `0` when it is due already. */
export function getMsUntilWarning(
  expiresAtMs: number,
  leadSeconds: number,
  nowMs: number,
): number {
  return Math.max(0, expiresAtMs - leadSeconds * 1000 - nowMs);
}

/** Whole seconds left, rounded up so `00:00` only shows once expired. */
export function getRemainingSeconds(expiresAtMs: number, nowMs: number): number {
  return Math.max(0, Math.ceil((expiresAtMs - nowMs) / 1000));
}

/** `mm:ss` (minutes are not wrapped at 60). */
export function formatCountdown(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Remaining time rounded up to a 30 second step, used for the screen reader
 * announcement so it changes twice a minute instead of every second.
 */
export function getAnnouncementSeconds(remainingSeconds: number): number {
  if (remainingSeconds <= 0) return 0;
  return Math.ceil(remainingSeconds / ANNOUNCEMENT_STEP_SECONDS) * ANNOUNCEMENT_STEP_SECONDS;
}
