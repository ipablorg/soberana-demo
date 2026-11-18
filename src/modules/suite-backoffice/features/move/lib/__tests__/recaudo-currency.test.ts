import { describe, expect, it } from 'vitest';

import {
  buildRecaudoCurrencyOptions,
  hasCurrencyMismatch,
  resolveDefaultCurrency,
} from '../recaudo-currency';

describe('buildRecaudoCurrencyOptions', () => {
  it('offers the common coins when there are no wallet currencies', () => {
    expect(buildRecaudoCurrencyOptions([], '')).toEqual(['USDC', 'USDT', 'BTC']);
  });

  it('lists wallet currencies first, then the common coins', () => {
    expect(buildRecaudoCurrencyOptions(['EUR', 'USDT'], '')).toEqual([
      'EUR',
      'USDT',
      'USDC',
      'BTC',
    ]);
  });

  it('dedupes ignoring case and surrounding spaces', () => {
    expect(
      buildRecaudoCurrencyOptions(['usdt', ' USDT ', 'Usdc', 'eur'], ''),
    ).toEqual(['USDT', 'USDC', 'EUR', 'BTC']);
  });

  it('drops blank wallet currencies', () => {
    expect(buildRecaudoCurrencyOptions(['', '  '], '')).toEqual([
      'USDC',
      'USDT',
      'BTC',
    ]);
  });

  it('keeps the current value even when it is not a known currency', () => {
    expect(buildRecaudoCurrencyOptions([], 'cop')).toEqual([
      'USDC',
      'USDT',
      'BTC',
      'COP',
    ]);
  });

  it('does not duplicate a current value that is already listed', () => {
    expect(buildRecaudoCurrencyOptions(['EUR'], 'eur')).toEqual([
      'EUR',
      'USDC',
      'USDT',
      'BTC',
    ]);
  });
});

describe('resolveDefaultCurrency', () => {
  it('returns the wallet currency uppercased and trimmed', () => {
    expect(resolveDefaultCurrency({ currency: ' usdt ' })).toBe('USDT');
  });

  it('returns an empty string without a wallet', () => {
    expect(resolveDefaultCurrency(null)).toBe('');
    expect(resolveDefaultCurrency(undefined)).toBe('');
  });
});

describe('hasCurrencyMismatch', () => {
  it.each([
    ['USDT', 'USDC', true],
    ['USDT', 'usdt', false],
    [' usdt ', 'USDT ', false],
    ['USDT', '', false],
    ['USDT', '   ', false],
    ['', 'USDC', false],
    [undefined, 'USDC', false],
    [null, 'USDC', false],
    ['', '', false],
  ] as const)('wallet %j vs %j -> %s', (walletCurrency, currency, expected) => {
    expect(hasCurrencyMismatch(walletCurrency, currency)).toBe(expected);
  });
});
