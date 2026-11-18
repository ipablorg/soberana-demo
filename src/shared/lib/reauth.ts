/**
 * Re-authentication bridge
 *
 * The backend answers privileged operations with HTTP 403 and a
 * `REAUTH_REQUIRED` code (plus `max_age_seconds`) when the Firebase session is
 * older than the operation allows. This module turns that wire signal into a
 * UI prompt and a single retry.
 *
 * Split in two halves so non-React code (query/mutation functions) can trigger
 * the prompt:
 *   - `extractReauthChallenge` / `withRecentAuth` are pure and importable
 *     anywhere.
 *   - `registerReauthHandler` is called once by `ReauthProvider`, which owns
 *     the modal. Without a mounted provider the wrapper simply rethrows.
 */

export const REAUTH_REQUIRED_CODE = 'REAUTH_REQUIRED';

export interface ReauthChallenge {
  /** Max session age the backend will accept, when it reported one. */
  maxAgeSeconds: number | null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Candidate payloads that may carry the rejection code, in priority order.
 *
 * NestJS serializes an HttpException thrown from a GraphQL resolver as
 * `extensions.code = 'FORBIDDEN'` and keeps the exception body (our
 * `code: 'REAUTH_REQUIRED'`, `max_age_seconds`, `statusCode`) under
 * `extensions.originalError`; the backend's global filter instead flattens it
 * into `extensions.error_code` / `max_age_seconds` / `status_code`.
 * graphql-request wraps it in a ClientError whose
 * `response.errors` holds every GraphQL error of the operation.
 */
function candidates(error: any): any[] {
  const graphQLErrors: any[] = Array.isArray(error?.response?.errors)
    ? error.response.errors
    : [];
  const fromExtensions = (ext: any) =>
    ext ? [ext.originalError, ext] : [];
  return [
    ...fromExtensions(error?.extensions),
    ...graphQLErrors.flatMap((gqlError) => fromExtensions(gqlError?.extensions)),
    error?.response?.data,
    error?.response,
    error?.body,
    error,
  ].filter((candidate) => candidate && typeof candidate === 'object');
}

/**
 * The backend's `AllExceptionsFilter` keeps Apollo's `extensions.code`
 * (`FORBIDDEN`) and moves the exception body code to `extensions.error_code`,
 * so the reauth code can live in either field depending on the transport.
 */
function findReauthPayload(error: any): any | undefined {
  return candidates(error).find(
    (candidate) =>
      candidate.code === REAUTH_REQUIRED_CODE ||
      candidate.error_code === REAUTH_REQUIRED_CODE,
  );
}

function readStatus(error: any, payload: any): number | undefined {
  // GraphQL errors travel over HTTP 200: the transport status is meaningless
  // there, so only the exception body's statusCode counts.
  if (payload?.statusCode !== undefined) return Number(payload.statusCode);
  if (Array.isArray(error?.response?.errors)) return undefined;
  return error?.response?.status ?? error?.status;
}

function readMaxAge(payload: any): number | null {
  const raw = payload?.max_age_seconds;
  const parsed = typeof raw === 'string' ? Number(raw) : raw;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : null;
}

/**
 * Returns the challenge when the error is a `REAUTH_REQUIRED` rejection,
 * otherwise `null`. The code is authoritative; a reported status must be 403.
 */
export function extractReauthChallenge(error: unknown): ReauthChallenge | null {
  const err = error as any;
  if (!err || typeof err !== 'object') return null;
  const payload = findReauthPayload(err);
  if (!payload) return null;

  const status = readStatus(err, payload);
  if (status !== undefined && status !== 403) return null;

  return { maxAgeSeconds: readMaxAge(payload) };
}

/* eslint-enable @typescript-eslint/no-explicit-any */

type ReauthHandler = (challenge: ReauthChallenge) => Promise<boolean>;

let activeHandler: ReauthHandler | null = null;

/** Called by `ReauthProvider`. Returns an unregister function. */
export function registerReauthHandler(handler: ReauthHandler): () => void {
  activeHandler = handler;
  return () => {
    if (activeHandler === handler) activeHandler = null;
  };
}

/** Opens the re-auth modal. Resolves `false` when no provider is mounted. */
export async function requestReauth(challenge: ReauthChallenge): Promise<boolean> {
  if (!activeHandler) return false;
  return activeHandler(challenge);
}

/**
 * Wraps any async call (GraphQL or REST). On a `REAUTH_REQUIRED` rejection it
 * prompts for re-authentication and, once the user succeeds, retries the
 * original call exactly once. Every other error propagates untouched, and a
 * second `REAUTH_REQUIRED` on the retry is thrown rather than re-prompting.
 */
export function withRecentAuth<TArgs extends unknown[], TResult>(
  operation: (...args: TArgs) => Promise<TResult>,
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    try {
      return await operation(...args);
    } catch (error) {
      const challenge = extractReauthChallenge(error);
      if (!challenge) throw error;

      const reauthenticated = await requestReauth(challenge);
      if (!reauthenticated) throw error;

      return operation(...args);
    }
  };
}
