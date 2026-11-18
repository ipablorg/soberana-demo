import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createIdempotencyKey,
  getIdempotencyErrorKind,
  resolveIntentKey,
} from '../idempotency-key';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createIdempotencyKey', () => {
  it('returns a v4 UUID', () => {
    expect(createIdempotencyKey()).toMatch(UUID_V4);
  });

  it('returns unique keys', () => {
    const keys = new Set(Array.from({ length: 200 }, () => createIdempotencyKey()));
    expect(keys.size).toBe(200);
  });

  it('falls back to getRandomValues when randomUUID is unavailable', () => {
    vi.stubGlobal('crypto', {
      getRandomValues: (a: Uint8Array) => {
        a.fill(7);
        return a;
      },
    });
    expect(createIdempotencyKey()).toMatch(UUID_V4);
  });

  it('falls back to Math.random when crypto is unavailable', () => {
    vi.stubGlobal('crypto', undefined);
    expect(createIdempotencyKey()).toMatch(UUID_V4);
  });
});

describe('resolveIntentKey', () => {
  it('reuses the key while the fingerprint is unchanged', () => {
    const gen = vi.fn(() => 'k1');
    const first = resolveIntentKey(null, 'a', gen);
    const second = resolveIntentKey(first, 'a', gen);
    expect(second.key).toBe('k1');
    expect(gen).toHaveBeenCalledTimes(1);
  });

  it('generates a new key when the fingerprint changes', () => {
    const gen = vi.fn().mockReturnValueOnce('k1').mockReturnValueOnce('k2');
    const first = resolveIntentKey(null, 'a', gen);
    expect(resolveIntentKey(first, 'b', gen).key).toBe('k2');
  });
});

describe('getIdempotencyErrorKind', () => {
  it('detects IDEMPOTENCY_KEY_REUSED from extensions.code', () => {
    const err = { response: { errors: [{ message: 'x', extensions: { code: 'IDEMPOTENCY_KEY_REUSED' } }] } };
    expect(getIdempotencyErrorKind(err)).toBe('KEY_REUSED');
  });

  it('detects PROVIDER_OUTCOME_UNKNOWN from the message', () => {
    expect(getIdempotencyErrorKind(new Error('PROVIDER_OUTCOME_UNKNOWN: retry'))).toBe('OUTCOME_UNKNOWN');
  });

  it('returns null for unrelated errors', () => {
    expect(getIdempotencyErrorKind(new Error('INSUFFICIENT_FUNDS'))).toBeNull();
    expect(getIdempotencyErrorKind(undefined)).toBeNull();
  });
});
