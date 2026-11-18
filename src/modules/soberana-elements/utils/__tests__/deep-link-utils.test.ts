import { describe, it, expect } from 'vitest';
import {
  validateJsonPayload,
  buildDeepLinkUrl,
  isCryptoAvailable,
  encodeDeepLinkPayload,
} from '../deep-link-utils';

// ─── validateJsonPayload ──────────────────────────────────────
describe('validateJsonPayload — valid JSON', () => {
  it('accepts a valid flat object', () => {
    const result = validateJsonPayload('{"invoice_id": "INV-001", "amount": 1500}');
    expect(result.valid).toBe(true);
    expect(result.parsed).toEqual({ invoice_id: 'INV-001', amount: 1500 });
    expect(result.error).toBeUndefined();
  });

  it('accepts a nested object', () => {
    const result = validateJsonPayload('{"meta": {"currency": "USD"}}');
    expect(result.valid).toBe(true);
    expect(result.parsed?.meta).toEqual({ currency: 'USD' });
  });

  it('accepts an object with numeric values', () => {
    const result = validateJsonPayload('{"amount": 0}');
    expect(result.valid).toBe(true);
    expect((result.parsed as Record<string, unknown>)?.amount).toBe(0);
  });
});

describe('validateJsonPayload — invalid JSON', () => {
  it('rejects malformed JSON', () => {
    const result = validateJsonPayload('{not valid}');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
    expect(result.parsed).toBeUndefined();
  });

  it('rejects a JSON array', () => {
    const result = validateJsonPayload('[1, 2, 3]');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('rejects a JSON string primitive', () => {
    const result = validateJsonPayload('"just a string"');
    expect(result.valid).toBe(false);
  });

  it('rejects null JSON value', () => {
    const result = validateJsonPayload('null');
    expect(result.valid).toBe(false);
  });

  it('rejects empty string', () => {
    const result = validateJsonPayload('');
    expect(result.valid).toBe(false);
  });
});

// ─── buildDeepLinkUrl ─────────────────────────────────────────
describe('buildDeepLinkUrl', () => {
  it('builds a URL with widgetId and encoded payload', () => {
    const url = buildDeepLinkUrl('wgt_abc123', 'abc123encoded');
    expect(url).toContain('wgt_abc123');
    expect(url).toContain('abc123encoded');
    expect(url).toMatch(/^https?:\/\//);
  });

  it('uses the ?p= query parameter for the encoded payload', () => {
    const url = buildDeepLinkUrl('wgt_test', 'PAYLOAD');
    expect(url).toContain('?p=PAYLOAD');
  });
});

// ─── isCryptoAvailable ────────────────────────────────────────
describe('isCryptoAvailable', () => {
  it('returns a boolean', () => {
    expect(typeof isCryptoAvailable()).toBe('boolean');
  });

  it('returns true in Node 20+ test environment (crypto.subtle is available)', () => {
    // Node 20+ ships WebCrypto API — Vitest runs on Node
    expect(isCryptoAvailable()).toBe(true);
  });
});

// ─── encodeDeepLinkPayload — error guards ─────────────────────
describe('encodeDeepLinkPayload — error guards', () => {
  it('throws DEEP_LINK_SECRET_TOO_SHORT when secret is < 16 chars', async () => {
    await expect(
      encodeDeepLinkPayload({ amount: 100 }, 'short'),
    ).rejects.toThrow('DEEP_LINK_SECRET_TOO_SHORT');
  });

  it('throws DEEP_LINK_SECRET_TOO_SHORT for exactly 15 chars', async () => {
    await expect(
      encodeDeepLinkPayload({ amount: 100 }, 'a'.repeat(15)),
    ).rejects.toThrow('DEEP_LINK_SECRET_TOO_SHORT');
  });

  it('does NOT throw for a 16-char secret when crypto is available', async () => {
    if (!isCryptoAvailable()) return;
    await expect(
      encodeDeepLinkPayload({ amount: 100 }, 'a'.repeat(16)),
    ).resolves.toBeTruthy();
  });

  it('encodes to a non-empty base64url string', async () => {
    if (!isCryptoAvailable()) return;
    const encoded = await encodeDeepLinkPayload(
      { invoice_id: 'INV-001', amount: 1500 },
      'soberana-demo-secret-v1',
    );
    expect(encoded).toBeTruthy();
    expect(encoded).not.toContain('+');
    expect(encoded).not.toContain('/');
    expect(encoded).not.toContain('=');
  });

  it('produces different output on each call (random IV)', async () => {
    if (!isCryptoAvailable()) return;
    const secret = 'soberana-demo-secret-v1';
    const payload = { amount: 42 };
    const [a, b] = await Promise.all([
      encodeDeepLinkPayload(payload, secret),
      encodeDeepLinkPayload(payload, secret),
    ]);
    expect(a).not.toBe(b);
  });
});
