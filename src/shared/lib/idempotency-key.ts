/**
 * Idempotency keys for money-moving mutations.
 *
 * The backend REQUIRES `client_reference_id` on `transactions_createDispersion`,
 * `transactions_createOffRamp` and `transactions_createTransfer` (suite-loopay-back#730/#732):
 *   - missing key              -> 400 IDEMPOTENCY_KEY_REQUIRED
 *   - same key + same payload  -> the original result is replayed (no second debit)
 *   - same key + other payload -> 409 IDEMPOTENCY_KEY_REUSED
 *
 * Pattern (one key per user INTENT, not per click):
 *   1. The key is generated ONCE when the user reaches the confirm step.
 *   2. It is REUSED on every retry of the same intent: network error,
 *      503 PROVIDER_OUTCOME_UNKNOWN, or the user pressing confirm again.
 *   3. A NEW key is used only when the payload fingerprint changes
 *      (amount / beneficiary / wallet / currency), after a success, or after a
 *      409 IDEMPOTENCY_KEY_REUSED.
 *
 * Use `useConfirmIntentKey(fingerprint)` in confirm components; `getKey()` is
 * stable across retries and `rotate()` forces a fresh key.
 */

import { useCallback, useRef } from 'react';

type CryptoWithUuid = { randomUUID?: () => string; getRandomValues?: (a: Uint8Array) => Uint8Array };

/** RFC 4122 v4 UUID. Falls back to getRandomValues, then Math.random, when randomUUID is unavailable. */
export function createIdempotencyKey(): string {
  const c = (globalThis as { crypto?: CryptoWithUuid }).crypto;
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (c && typeof c.getRandomValues === 'function') {
    c.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export interface IntentKeyState {
  fingerprint: string;
  key: string;
}

/** Returns the current state when the fingerprint is unchanged, otherwise a state with a fresh key. */
export function resolveIntentKey(
  state: IntentKeyState | null,
  fingerprint: string,
  generate: () => string = createIdempotencyKey,
): IntentKeyState {
  if (state && state.fingerprint === fingerprint) {
    return state;
  }
  return { fingerprint, key: generate() };
}

export type IdempotencyErrorKind = 'KEY_REUSED' | 'OUTCOME_UNKNOWN' | null;

/**
 * Classifies a backend error by its idempotency-relevant code. Looks at
 * GraphQL `extensions.code` / `error_code` and falls back to the message text.
 */
export function getIdempotencyErrorKind(error: unknown): IdempotencyErrorKind {
  if (!error || typeof error !== 'object') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as any;
  const gqlErrors: unknown[] = Array.isArray(err.response?.errors) ? err.response.errors : [];
  const candidates: unknown[] = [err.code, err.extensions?.code, err.extensions?.error_code, err.message];
  for (const g of gqlErrors) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ge = g as any;
    candidates.push(ge?.extensions?.code, ge?.extensions?.error_code, ge?.message);
  }
  const text = candidates.filter((c): c is string => typeof c === 'string').join(' ');
  if (text.includes('IDEMPOTENCY_KEY_REUSED')) return 'KEY_REUSED';
  if (text.includes('PROVIDER_OUTCOME_UNKNOWN')) return 'OUTCOME_UNKNOWN';
  return null;
}

/**
 * Stable per-intent key. `fingerprint` must encode every field that defines the
 * intent (e.g. `[walletId, beneficiaryId, currency, amount].join('|')`).
 */
export function useConfirmIntentKey(fingerprint: string): {
  getKey: () => string;
  rotate: () => void;
} {
  const ref = useRef<IntentKeyState | null>(null);

  const getKey = useCallback(() => {
    ref.current = resolveIntentKey(ref.current, fingerprint);
    return ref.current.key;
  }, [fingerprint]);

  const rotate = useCallback(() => {
    ref.current = null;
  }, []);

  return { getKey, rotate };
}
