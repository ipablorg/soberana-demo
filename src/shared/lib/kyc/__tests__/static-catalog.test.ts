import { describe, it, expect } from 'vitest';
import {
  getTaxIdTypeOptions,
  getDefaultTaxIdType,
  isAllowedTaxIdType,
} from '../static-catalog';

/**
 * USA business KYB tax ID catalog regression tests.
 *
 * Guards three production bugs:
 * 1. US businesses had no EIN option (only SSN/ITIN) — Bridge requires EIN
 *    for business identifying_information.
 * 2. The old front catalog offered ITIN, but the backend tax_id_type catalog
 *    has no ITIN (it has TIN) — individuals picking ITIN were rejected.
 * 3. Business options must fall back to the individual list when a country
 *    defines no business-specific options.
 */
describe('static-catalog — USA tax id options by customer type', () => {
  it('offers EIN first for US businesses', () => {
    const options = getTaxIdTypeOptions('USA', 'business');
    expect(options.map((o) => o.value)).toEqual(['EIN', 'SSN']);
    expect(getDefaultTaxIdType('USA', 'business')).toBe('EIN');
  });

  it('offers SSN and TIN (not the unsupported ITIN) for US individuals', () => {
    const options = getTaxIdTypeOptions('USA', 'individual');
    expect(options.map((o) => o.value)).toEqual(['SSN', 'TIN']);
    expect(isAllowedTaxIdType('USA', 'ITIN')).toBe(false);
    expect(isAllowedTaxIdType('USA', 'TIN')).toBe(true);
  });

  it('accepts iso2 country codes for business options', () => {
    expect(getTaxIdTypeOptions('US', 'business').map((o) => o.value)).toEqual(['EIN', 'SSN']);
  });

  it('falls back to the individual list for countries without business options', () => {
    const individual = getTaxIdTypeOptions('COL', 'individual');
    const business = getTaxIdTypeOptions('COL', 'business');
    expect(business).toEqual(individual);
  });

  it('keeps EIN disallowed for US individuals', () => {
    expect(isAllowedTaxIdType('USA', 'EIN', 'individual')).toBe(false);
    expect(isAllowedTaxIdType('USA', 'EIN', 'business')).toBe(true);
  });
});
