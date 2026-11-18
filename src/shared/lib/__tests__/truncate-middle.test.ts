import { describe, expect, it } from 'vitest';

import { truncateMiddle } from '../truncate-middle';

describe('truncateMiddle', () => {
  it('keeps the leading and trailing characters and joins them with an ellipsis', () => {
    expect(truncateMiddle('a007e7ba-1c2d-4e5f-8a9b-0c1d2e3f4f9a', 8, 4)).toBe(
      'a007e7ba…4f9a',
    );
  });

  it('defaults to 8 leading and 4 trailing characters', () => {
    expect(truncateMiddle('a007e7ba-1c2d-4e5f-8a9b-0c1d2e3f4f9a')).toBe(
      'a007e7ba…4f9a',
    );
  });

  it('returns the value untouched when truncating would not shorten it', () => {
    // 8 + 4 + 1 (ellipsis) = 13 characters is the break-even length.
    expect(truncateMiddle('abcdefghijklm', 8, 4)).toBe('abcdefghijklm');
    expect(truncateMiddle('wallet-1', 8, 4)).toBe('wallet-1');
    expect(truncateMiddle('abcd', 8, 4)).toBe('abcd');
  });

  it('truncates as soon as the result is strictly shorter than the input', () => {
    expect(truncateMiddle('abcdefghijklmn', 8, 4)).toBe('abcdefgh…klmn');
  });

  it('returns an empty string for empty, null and undefined input', () => {
    expect(truncateMiddle('')).toBe('');
    expect(truncateMiddle(null)).toBe('');
    expect(truncateMiddle(undefined)).toBe('');
  });

  it('supports a zero-length tail without leaking the whole string', () => {
    expect(truncateMiddle('abcdefghijklmnop', 4, 0)).toBe('abcd…');
  });

  it('supports a zero-length head', () => {
    expect(truncateMiddle('abcdefghijklmnop', 0, 4)).toBe('…mnop');
  });

  it('clamps negative or fractional counts instead of producing garbage', () => {
    expect(truncateMiddle('abcdefghijklmnop', -3, 4.9)).toBe('…mnop');
  });
});
