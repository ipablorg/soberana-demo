/**
 * Why did the `auth_me` round-trip fail?
 *
 * While a session is being restored (or already live), the answer decides
 * whether the user is signed out:
 *
 *   - `definitive`: the backend rejected the credentials (401/403, an
 *     `UNAUTHENTICATED`/`INVALID_TOKEN`/... code) or the failure is not one we
 *     can call temporary. The session ends, as it always did.
 *   - `transient`: the request never got a real answer (network, abort,
 *     timeout) or the backend/gateway is struggling (5xx, 408, 429,
 *     `INTERNAL_SERVER_ERROR`...). The session must be kept: signing someone out
 *     because their connection blinked is the abrupt behaviour we avoid.
 *
 * An explicit authentication signal always wins, and anything unrecognised
 * fails closed to `definitive`.
 */

export type AuthMeErrorKind = 'definitive' | 'transient';

/* eslint-disable @typescript-eslint/no-explicit-any */

const AUTH_CODES = new Set([
  'UNAUTHENTICATED',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'INVALID_TOKEN',
  'TOKEN_EXPIRED',
  'ACCOUNT_DISABLED',
  'ACCOUNT_LOCKED',
]);

const TRANSIENT_CODES = new Set([
  'INTERNAL_SERVER_ERROR',
  'SERVICE_UNAVAILABLE',
  'DATABASE_ERROR',
  'TIMEOUT_ERROR',
  'NETWORK_ERROR',
  'RATE_LIMIT_EXCEEDED',
]);

const TRANSIENT_ERROR_NAMES = new Set(['AbortError', 'TimeoutError']);

/** Payload objects that may carry a code or status, most specific first. */
function payloads(error: any): any[] {
  const graphQLErrors: any[] = Array.isArray(error?.response?.errors) ? error.response.errors : [];
  const fromExtensions = (ext: any) => (ext ? [ext.originalError, ext] : []);

  return [
    ...fromExtensions(error?.extensions),
    ...graphQLErrors.flatMap((gqlError) => fromExtensions(gqlError?.extensions)),
    error?.response?.data,
  ].filter((candidate) => candidate && typeof candidate === 'object');
}

function codesOf(payload: any): string[] {
  return [payload.code, payload.error_code].filter((v): v is string => typeof v === 'string');
}

function statusesOf(error: any, payload: any[]): number[] {
  const fromPayloads = payload.flatMap((p) => [p.statusCode, p.status_code]);
  // graphql-request reports GraphQL errors over HTTP 200; that status says
  // nothing about the failure, so only a non-200 transport status counts.
  const transport = error?.response?.status ?? error?.status;
  return [...fromPayloads, transport]
    .map((value) => (typeof value === 'string' ? Number(value) : value))
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
}

function messageMentionsAuthCode(error: any): boolean {
  const message = typeof error === 'string' ? error : error?.message;
  if (typeof message !== 'string') return false;
  const upper = message.toUpperCase();
  return [...AUTH_CODES].some((code) => upper.includes(code));
}

export function classifyAuthMeError(error: unknown): AuthMeErrorKind {
  if (!error || (typeof error !== 'object' && typeof error !== 'string')) return 'definitive';
  const err = error as any;

  const candidates = payloads(err);
  const codes = candidates.flatMap(codesOf);
  const statuses = statusesOf(err, candidates);

  // An explicit authentication signal beats anything else in the same failure.
  if (
    codes.some((code) => AUTH_CODES.has(code)) ||
    statuses.some((status) => status === 401 || status === 403) ||
    messageMentionsAuthCode(err)
  ) {
    return 'definitive';
  }

  if (
    codes.some((code) => TRANSIENT_CODES.has(code)) ||
    statuses.some((status) => status >= 500 || status === 408 || status === 429)
  ) {
    return 'transient';
  }

  // No `response` at all means the request never got an answer: graphql-request
  // only throws a bare error (TypeError, AbortError...) for transport failures.
  if (typeof err === 'object' && !err.response) {
    return 'transient';
  }

  if (TRANSIENT_ERROR_NAMES.has(err?.name)) return 'transient';

  return 'definitive';
}
