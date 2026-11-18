import { describe, expect, it } from 'vitest';

import {
  DEFAULT_SESSION_WARNING_LEAD_SECONDS,
  decodeJwtExpiry,
  formatCountdown,
  getAnnouncementSeconds,
  getMsUntilWarning,
  getRemainingSeconds,
  resolveWarningLeadSeconds,
} from '../session-expiry';

function base64Url(value: string): string {
  return Buffer.from(value).toString('base64url');
}

function makeToken(claims: Record<string, unknown>): string {
  return `${base64Url('{"alg":"RS256"}')}.${base64Url(JSON.stringify(claims))}.signature`;
}

describe('decodeJwtExpiry', () => {
  it('returns the exp claim in epoch milliseconds', () => {
    expect(decodeJwtExpiry(makeToken({ exp: 1_800_000_000 }))).toBe(1_800_000_000_000);
  });

  it('decodes base64url payloads that need padding and url-safe characters', () => {
    // The `?>` sequence encodes to `-`/`_` in base64url and forces padding.
    const token = makeToken({ exp: 1_800_000_123, name: '???>>>' });

    expect(decodeJwtExpiry(token)).toBe(1_800_000_123_000);
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['empty string', ''],
    ['not a jwt', 'not-a-jwt'],
    ['two segments', 'aaa.bbb'],
    ['payload that is not base64', 'aaa.%%%.ccc'],
    ['payload that is not json', `aaa.${base64Url('nope')}.ccc`],
    ['payload that is a json array', `aaa.${base64Url('[1,2]')}.ccc`],
  ])('returns null for a malformed token (%s)', (_label, token) => {
    expect(decodeJwtExpiry(token)).toBeNull();
  });

  it.each([
    ['missing', {}],
    ['a string', { exp: '1800000000' }],
    ['zero', { exp: 0 }],
    ['negative', { exp: -5 }],
    ['not finite', { exp: null }],
  ])('returns null when exp is %s', (_label, claims) => {
    expect(decodeJwtExpiry(makeToken(claims))).toBeNull();
  });
});

describe('getMsUntilWarning', () => {
  const exp = 1_000_000_000;

  it('is the time left until exp minus the lead window', () => {
    expect(getMsUntilWarning(exp, 300, exp - 3_600_000)).toBe(3_300_000);
  });

  it('is zero when already inside the lead window', () => {
    expect(getMsUntilWarning(exp, 300, exp - 299_000)).toBe(0);
  });

  it('is zero when the token already expired', () => {
    expect(getMsUntilWarning(exp, 300, exp + 10_000)).toBe(0);
  });
});

describe('getRemainingSeconds', () => {
  it('rounds partial seconds up so the countdown never shows 00:00 early', () => {
    expect(getRemainingSeconds(10_500, 10_000)).toBe(1);
    expect(getRemainingSeconds(11_000, 10_000)).toBe(1);
    expect(getRemainingSeconds(11_001, 10_000)).toBe(2);
  });

  it('clamps to zero once expired', () => {
    expect(getRemainingSeconds(10_000, 20_000)).toBe(0);
  });
});

describe('formatCountdown', () => {
  it.each([
    [0, '00:00'],
    [5, '00:05'],
    [65, '01:05'],
    [300, '05:00'],
    [3599, '59:59'],
    [3600, '60:00'],
  ])('formats %i seconds as %s', (seconds, expected) => {
    expect(formatCountdown(seconds)).toBe(expected);
  });

  it('treats negative and non finite values as zero', () => {
    expect(formatCountdown(-4)).toBe('00:00');
    expect(formatCountdown(Number.NaN)).toBe('00:00');
  });
});

describe('getAnnouncementSeconds', () => {
  it('only changes every 30 seconds so screen readers are not flooded', () => {
    expect(getAnnouncementSeconds(300)).toBe(300);
    expect(getAnnouncementSeconds(299)).toBe(300);
    expect(getAnnouncementSeconds(271)).toBe(300);
    expect(getAnnouncementSeconds(270)).toBe(270);
    expect(getAnnouncementSeconds(31)).toBe(60);
    expect(getAnnouncementSeconds(1)).toBe(30);
  });

  it('is zero only when the session is over', () => {
    expect(getAnnouncementSeconds(0)).toBe(0);
  });
});

describe('resolveWarningLeadSeconds', () => {
  it('defaults to five minutes', () => {
    expect(DEFAULT_SESSION_WARNING_LEAD_SECONDS).toBe(300);
    expect(resolveWarningLeadSeconds(undefined)).toBe(300);
  });

  it('accepts a positive numeric override', () => {
    expect(resolveWarningLeadSeconds('45')).toBe(45);
  });

  it.each(['', 'abc', '0', '-10', 'Infinity'])(
    'falls back to the default for the invalid override %j',
    (raw) => {
      expect(resolveWarningLeadSeconds(raw)).toBe(300);
    },
  );
});
