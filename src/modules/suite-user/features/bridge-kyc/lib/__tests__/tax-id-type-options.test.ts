import { describe, expect, it } from 'vitest';

import {
  getDefaultTaxIdType,
  getTaxIdTypeLabel,
  getTaxIdTypeOption,
  getTaxIdTypeOptions,
  isAllowedTaxIdType,
} from '../tax-id-type-options';

describe('tax-id-type-options', () => {
  it('returns the supported options for Colombia', () => {
    expect(getTaxIdTypeOptions('COL')).toEqual([
      { value: 'CC', label: 'Cédula de ciudadanía (CC)', placeholder: 'e.g. 1234567890' },
      { value: 'CE', label: 'Cédula de extranjería (CE)', placeholder: 'e.g. 123456789' },
      { value: 'NIT', label: 'NIT', placeholder: 'e.g. 900123456-7' },
    ]);
  });

  it('uses the first allowed option as the default', () => {
    expect(getDefaultTaxIdType('USA')).toBe('SSN');
    expect(getDefaultTaxIdType('COL')).toBe('CC');
    expect(getDefaultTaxIdType('ECU')).toBe('CI');
  });

  it('validates allowed values per country', () => {
    expect(isAllowedTaxIdType('MEX', 'RFC')).toBe(true);
    expect(isAllowedTaxIdType('MEX', 'CURP')).toBe(true);
    expect(isAllowedTaxIdType('MEX', 'SSN')).toBe(false);
  });

  it('exposes country-aware labels and placeholders', () => {
    expect(getTaxIdTypeOption('MEX', 'CURP')).toEqual({
      value: 'CURP',
      label: 'CURP',
      placeholder: 'e.g. ABCD123456HDFXYZ09',
    });

    expect(getTaxIdTypeLabel('ECU', 'RUC')).toBe('RUC');
    expect(getTaxIdTypeLabel('USA', 'ITIN')).toBe('ITIN');
  });
});
