import { describe, expect, it } from 'vitest';

import { countryName, isProviderManaged, reviewKindOf } from '../beneficiary-review-status';

describe('reviewKindOf', () => {
  it('maps the three review statuses', () => {
    expect(reviewKindOf('IN_REVIEW')).toBe('in_review');
    expect(reviewKindOf('APPROVED')).toBe('approved');
    expect(reviewKindOf('REJECTED')).toBe('rejected');
  });

  it('never shows an unknown or missing status as approved', () => {
    expect(reviewKindOf('???')).toBe('in_review');
    expect(reviewKindOf(null)).toBe('in_review');
    expect(reviewKindOf(undefined)).toBe('in_review');
  });
});

describe('isProviderManaged', () => {
  it('is true only when a provider is linked', () => {
    expect(isProviderManaged({ providerCode: 'mesta' })).toBe(true);
    expect(isProviderManaged({ providerCode: null })).toBe(false);
    expect(isProviderManaged({})).toBe(false);
    expect(isProviderManaged({ providerCode: '' })).toBe(false);
  });
});

describe('countryName', () => {
  it('names an ISO alpha-2 code in Spanish', () => {
    expect(countryName('MX')).toMatch(/M[eé]xico/);
    expect(countryName('us')).toMatch(/Estados Unidos/);
  });

  it('accepts alpha-3 codes written before Phase 8', () => {
    expect(countryName('MEX')).toMatch(/M[eé]xico/);
    expect(countryName('DEU')).toMatch(/Alemania/);
    expect(countryName('usa')).toMatch(/Estados Unidos/);
  });

  it('falls back to the raw code when it is not a known country', () => {
    expect(countryName('XX')).toBe('XX');
    expect(countryName('ZZZ')).toBe('ZZZ');
  });

  it('returns an empty string for nothing', () => {
    expect(countryName(null)).toBe('');
    expect(countryName(undefined)).toBe('');
  });
});
