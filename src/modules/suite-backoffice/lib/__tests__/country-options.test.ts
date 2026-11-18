import { describe, expect, it } from 'vitest';

import { COUNTRY_ISO3_OPTIONS, iso3ForCountry } from '../country-options';

describe('country options', () => {
  it('offers operational countries with their ISO 3166-1 alpha-3 code as value', () => {
    const colombia = COUNTRY_ISO3_OPTIONS.find((o) => o.value === 'COL');

    expect(colombia?.label).toContain('Colombia');
    expect(COUNTRY_ISO3_OPTIONS.every((o) => /^[A-Z]{3}$/.test(o.value))).toBe(true);
  });

  it('maps an alpha-2 code to alpha-3 and rejects unknown codes', () => {
    expect(iso3ForCountry('co')).toBe('COL');
    expect(iso3ForCountry('zz')).toBeNull();
  });
});
