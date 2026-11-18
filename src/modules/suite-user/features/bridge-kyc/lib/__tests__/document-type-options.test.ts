import { describe, expect, it } from 'vitest';

import {
  getDocumentTypeOption,
  getDocumentTypeOptions,
} from '../document-type-options';

describe('document-type-options', () => {
  it('returns country-aware labels for Mexico without changing backend types', () => {
    expect(getDocumentTypeOptions('MEX').map((o) => o.value)).toEqual(['DNI', 'PASSPORT', 'OTHER']);
    const dni = getDocumentTypeOption('MEX', 'DNI');
    expect(dni?.label).toBe('INE / voter ID');
    expect(dni?.numberLabel).toBe('INE or voter ID number');
    expect(dni?.expirationMode).toBe('hidden');
  });

  it('keeps fallback options for unsupported countries', () => {
    expect(getDocumentTypeOption('JPN', 'DNI')).toEqual({
      value: 'DNI',
      label: 'National identity document',
      helperText: 'Use the main government identity document issued in your country.',
      numberLabel: 'Government ID number',
      numberPlaceholder: 'e.g. 12345678',
      expirationMode: 'optional',
    });
  });

  it('offers only SSN and ITIN for US-issued documents', () => {
    // Bridge rejects passport/national_id/other for US-issued identifying
    // entries ("is not a valid US issued document").
    expect(getDocumentTypeOptions('USA').map((option) => option.value)).toEqual(['SSN', 'ITIN']);
  });

  it('does not offer SSN or ITIN for non-US issuing countries', () => {
    const values = getDocumentTypeOptions('MEX').map((option) => option.value);
    expect(values).not.toContain('SSN');
    expect(values).not.toContain('ITIN');
  });
});
