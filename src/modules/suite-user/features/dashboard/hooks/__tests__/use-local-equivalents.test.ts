import { describe, it, expect } from 'vitest';
import {
  computeEquivalent,
  currencyForCountry,
  formatEquivalent,
  pickDefaultEquivalenceFiat,
  shouldRetryRateQuery,
} from '../use-local-equivalents';

/**
 * Pure-helper tests for the useLocalEquivalents hook. The React layer
 * is exercised indirectly via the VirtualCard visual smoke checklist;
 * here we pin down the math and the Intl fallback so the UI can't
 * render NaN or crash on an unknown ISO code.
 */

describe('computeEquivalent', () => {
  it('multiplies a numeric balance by the rate', () => {
    expect(computeEquivalent('100', 4200)).toBe(420_000);
  });

  it('handles decimal balances', () => {
    expect(computeEquivalent('12.5', 4000)).toBe(50_000);
  });

  it('returns 0 for an empty balance', () => {
    expect(computeEquivalent('', 4200)).toBe(0);
  });

  it('returns 0 for an undefined balance', () => {
    expect(computeEquivalent(undefined, 4200)).toBe(0);
  });

  it('returns 0 for a non-numeric balance', () => {
    expect(computeEquivalent('abc', 4200)).toBe(0);
  });

  it('returns 0 when rate is 0', () => {
    expect(computeEquivalent('100', 0)).toBe(0);
  });

  it('returns 0 when rate is negative', () => {
    expect(computeEquivalent('100', -10)).toBe(0);
  });

  it('returns 0 when rate is not finite', () => {
    expect(computeEquivalent('100', Number.NaN)).toBe(0);
    expect(computeEquivalent('100', Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe('formatEquivalent', () => {
  it('formats COP as currency without throwing', () => {
    const result = formatEquivalent(420_000, 'COP');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    // The formatted string must contain the numeric magnitude,
    // regardless of the active runtime locale or grouping glyph.
    expect(result.replace(/\D/g, '')).toContain('420000');
  });

  it('formats USD as currency', () => {
    const result = formatEquivalent(1234.5, 'USD');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('falls back to a decimal string for an invalid currency code', () => {
    // An empty string or a 2-letter code is rejected by Intl as a
    // currency; the helper must not throw and must still produce
    // something printable.
    const result = formatEquivalent(100, 'XX');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('formats zero without throwing', () => {
    const result = formatEquivalent(0, 'MXN');
    expect(typeof result).toBe('string');
  });
});


describe('pickDefaultEquivalenceFiat', () => {
  const LIST = ['BRL', 'COP', 'EUR', 'GBP', 'MXN', 'USD'];

  it('never defaults to the first listed currency (BRL has no USDT pricing yet)', () => {
    expect(pickDefaultEquivalenceFiat({ fiatCurrencies: LIST })).toBe('USD');
  });

  it('prefers the customer local currency when it is offered', () => {
    expect(pickDefaultEquivalenceFiat({ fiatCurrencies: LIST, localCurrency: 'COP' })).toBe('COP');
  });

  it('skips a local currency that is not priced (not in the list)', () => {
    expect(pickDefaultEquivalenceFiat({ fiatCurrencies: LIST, localCurrency: 'ARS' })).toBe('USD');
  });

  it('keeps the stored choice when it is still offered', () => {
    expect(pickDefaultEquivalenceFiat({ fiatCurrencies: LIST, stored: 'EUR', localCurrency: 'COP' })).toBe('EUR');
  });

  it('falls back to the first currency when neither USD nor local is offered', () => {
    expect(pickDefaultEquivalenceFiat({ fiatCurrencies: ['EUR', 'GBP'] })).toBe('EUR');
  });

  it('returns USD for an empty list so the query key stays valid', () => {
    expect(pickDefaultEquivalenceFiat({ fiatCurrencies: [] })).toBe('USD');
  });
});

describe('currencyForCountry', () => {
  it('maps ISO2 and ISO3 country codes to their currency', () => {
    expect(currencyForCountry('CO')).toBe('COP');
    expect(currencyForCountry('col')).toBe('COP');
    expect(currencyForCountry('MEX')).toBe('MXN');
    expect(currencyForCountry('DE')).toBe('EUR');
    expect(currencyForCountry('US')).toBe('USD');
  });

  it('returns undefined for unknown or empty countries', () => {
    expect(currencyForCountry('ZZ')).toBeUndefined();
    expect(currencyForCountry(null)).toBeUndefined();
  });
});

describe('shouldRetryRateQuery', () => {
  const badUserInput = { response: { errors: [{ extensions: { code: 'BAD_USER_INPUT' } }] } };

  it('does not retry a BAD_USER_INPUT pricing error', () => {
    expect(shouldRetryRateQuery(0, badUserInput)).toBe(false);
  });

  it('retries transient failures once', () => {
    expect(shouldRetryRateQuery(0, new Error('network'))).toBe(true);
    expect(shouldRetryRateQuery(1, new Error('network'))).toBe(false);
  });
});
