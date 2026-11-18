import { describe, expect, it } from 'vitest';

import { QUICK_PICK_COINS, resolveCoinCode } from '../coin-code';

describe('resolveCoinCode', () => {
  it('recognizes the supported coins regardless of case and padding', () => {
    expect(resolveCoinCode('USDC')).toBe('USDC');
    expect(resolveCoinCode('usdt')).toBe('USDT');
    expect(resolveCoinCode('  btc ')).toBe('BTC');
  });

  it('returns null for currencies without a coin logo', () => {
    expect(resolveCoinCode('USD')).toBeNull();
    expect(resolveCoinCode('COP')).toBeNull();
    expect(resolveCoinCode('USDCX')).toBeNull();
  });

  it('returns null for empty, null and undefined input', () => {
    expect(resolveCoinCode('')).toBeNull();
    expect(resolveCoinCode('   ')).toBeNull();
    expect(resolveCoinCode(null)).toBeNull();
    expect(resolveCoinCode(undefined)).toBeNull();
  });
});

describe('QUICK_PICK_COINS', () => {
  it('lists every coin that resolves to a logo, in display order', () => {
    expect([...QUICK_PICK_COINS]).toEqual(['USDC', 'USDT', 'BTC']);
    QUICK_PICK_COINS.forEach((coin) => {
      expect(resolveCoinCode(coin)).toBe(coin);
    });
  });
});
