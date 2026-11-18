import { describe, expect, it } from 'vitest';

import {
  FALLBACK_PROVIDER_OPTIONS,
  currencyOptionsFromRails,
  providerOptionsFromCatalog,
  railOptionsFromCatalog,
  withCurrentValue,
} from '../catalog-options';

describe('providerOptionsFromCatalog', () => {
  it('lists active providers sorted by name using the code as value', () => {
    const options = providerOptionsFromCatalog([
      { code: 'mesta', name: 'Mesta', is_active: true },
      { code: 'openfort', name: 'Openfort', is_active: true },
      { code: 'lumx', name: 'Lumx', is_active: false },
    ]);

    expect(options.map((o) => o.value)).toEqual(['mesta', 'openfort']);
    expect(options[1].label).toBe('Openfort (openfort)');
  });

  it('never offers decommissioned providers even when the catalog still marks them active', () => {
    const options = providerOptionsFromCatalog([
      { code: 'kirafin', name: 'KiraFin', is_active: true },
      { code: 'bridge', name: 'Bridge', is_active: true },
      { code: 'loopayx', name: 'LoopayX', is_active: true },
      { code: 'lumx', name: 'Lumx', is_active: true },
      { code: 'persona', name: 'Persona', is_active: true },
      { code: 'prometeo', name: 'Prometeo', is_active: true },
    ]);

    expect(options.map((o) => o.value)).toEqual(['kirafin']);
  });

  it('returns nothing while the catalog has not loaded and no error happened', () => {
    expect(providerOptionsFromCatalog(undefined)).toEqual([]);
  });

  it('falls back to the supported providers only when the query failed', () => {
    const options = providerOptionsFromCatalog(undefined, true);

    expect(options).toEqual(FALLBACK_PROVIDER_OPTIONS);
    expect(options.map((o) => o.value)).not.toContain('bridge');
    expect(options.map((o) => o.value)).not.toContain('loopayx');
  });
});

describe('railOptionsFromCatalog / currencyOptionsFromRails', () => {
  const rails = [
    { code: 'us_ach', name: 'ACH', currency: 'USD', is_active: true },
    { code: 'us_wire', name: 'Wire', currency: 'USD', is_active: true },
    { code: 'sepa', name: 'SEPA', currency: 'EUR', is_active: true },
    { code: 'old', name: 'Old', currency: 'GBP', is_active: false },
  ];

  it('builds rail options with currency and derives unique currencies', () => {
    expect(railOptionsFromCatalog(rails).map((o) => o.value)).toEqual([
      'sepa',
      'us_ach',
      'us_wire',
    ]);
    expect(currencyOptionsFromRails(rails).map((o) => o.value)).toEqual(['EUR', 'USD']);
  });

  it('never invents rails: empty when the catalog is missing or failed', () => {
    expect(railOptionsFromCatalog(undefined)).toEqual([]);
    expect(railOptionsFromCatalog(null)).toEqual([]);
  });

  it('offers generic currency codes only after a failed query', () => {
    expect(currencyOptionsFromRails(undefined)).toEqual([]);
    expect(currencyOptionsFromRails(undefined, true).length).toBeGreaterThan(0);
  });
});

describe('withCurrentValue', () => {
  it('keeps a stored value that is not in the options selectable', () => {
    const options = [{ value: 'tron', label: 'tron' }];

    expect(withCurrentValue(options, 'legacy').map((o) => o.value)).toEqual(['tron', 'legacy']);
    expect(withCurrentValue(options, 'tron')).toEqual(options);
    expect(withCurrentValue(options, '')).toEqual(options);
  });
});

describe('#411: no dead provider and no duplicate rail code is selectable', () => {
  it.each(['bridge', 'aiprise', 'loopayx', 'lumx', 'persona', 'jube'])(
    'drops the dead provider %s even when the catalog still marks it active',
    (code) => {
      const options = providerOptionsFromCatalog([
        { code, name: code, is_active: true },
        { code: 'mesta', name: 'Mesta', is_active: true },
      ]);

      expect(options.map((o) => o.value)).toEqual(['mesta']);
    }
  );

  it('offers only canonical rails: an alias (canonical_code differs from code) is hidden', () => {
    const options = railOptionsFromCatalog([
      { code: 'ach', name: 'ACH', currency: 'USD', is_active: true, canonical_code: 'ach' },
      { code: 'us_ach', name: 'US ACH', currency: 'USD', is_active: true, canonical_code: 'ach' },
      {
        code: 'ach_wire',
        name: 'ACH wire',
        currency: 'USD',
        is_active: true,
        canonical_code: 'ach',
      },
      { code: 'mx_spei', name: 'SPEI', currency: 'MXN', is_active: true, canonical_code: null },
    ]);

    expect(options.map((o) => o.value)).toEqual(['ach', 'mx_spei']);
  });

  it('keeps every rail canonical while canonical_code is not set (before the prod step)', () => {
    const options = railOptionsFromCatalog([
      { code: 'ach', name: 'ACH', currency: 'USD', is_active: true },
      { code: 'us_ach', name: 'US ACH', currency: 'USD', is_active: true },
    ]);

    expect(options.map((o) => o.value)).toEqual(['ach', 'us_ach']);
  });
});
