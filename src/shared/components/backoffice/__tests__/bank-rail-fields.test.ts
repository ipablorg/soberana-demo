import { describe, expect, it } from 'vitest';

import {
  displayBankFieldValue,
  formatBankFieldValue,
  formatClabe,
  getRailFields,
  readBankField,
  validateBankDetails,
  STRUCTURED_RAIL_CODES,
} from '../bank-rail-fields';

describe('getRailFields', () => {
  it('returns the structured field set for a known rail', () => {
    const fields = getRailFields('us_ach');

    expect(fields).not.toBeNull();
    expect(fields?.map((f) => f.key)).toEqual(['routing_number', 'account_number', 'account_type']);
  });

  it('shares the same SEPA fields for the iban alias', () => {
    expect(getRailFields('iban')).toEqual(getRailFields('sepa'));
  });

  it('returns null for an unknown rail so the UI falls back to raw JSON', () => {
    expect(getRailFields('unknown_rail')).toBeNull();
  });

  it('covers every structured rail code', () => {
    expect(STRUCTURED_RAIL_CODES).toContain('co_breb');
    expect(STRUCTURED_RAIL_CODES).toContain('spei');
    expect(STRUCTURED_RAIL_CODES).toContain('pix');
  });
});

describe('formatClabe', () => {
  it('groups the 18 digits in blocks of 4', () => {
    expect(formatClabe('123456789012345678')).toBe('1234 5678 9012 3456 78');
  });

  it('strips existing whitespace before grouping', () => {
    expect(formatClabe('1234 5678 9012 3456 78')).toBe('1234 5678 9012 3456 78');
  });
});

describe('formatBankFieldValue', () => {
  it('returns empty string for null and undefined', () => {
    expect(formatBankFieldValue(null)).toBe('');
    expect(formatBankFieldValue(undefined)).toBe('');
  });

  it('applies clabe grouping only when the format hint is clabe', () => {
    expect(formatBankFieldValue('123456789012345678', 'clabe')).toBe('1234 5678 9012 3456 78');
    expect(formatBankFieldValue('123456789012345678', 'mono')).toBe('123456789012345678');
  });
});

describe('readBankField', () => {
  it('reads a string value from a bankDetails object', () => {
    expect(readBankField({ account_number: '1234' }, 'account_number')).toBe('1234');
  });

  it('reads the camelCase key of stored bank details', () => {
    expect(readBankField({ routingNumber: '021000021' }, 'routing_number')).toBe('021000021');
  });

  it('returns empty string for missing keys and non-object payloads', () => {
    expect(readBankField(null, 'account_number')).toBe('');
    expect(readBankField({}, 'account_number')).toBe('');
    expect(readBankField('not-an-object', 'account_number')).toBe('');
  });
});

describe('validateBankDetails', () => {
  it('returns no errors when every required field is valid', () => {
    const errors = validateBankDetails('us_ach', {
      routing_number: '123456789',
      account_number: '9999',
    });

    expect(errors).toEqual([]);
  });

  it('flags missing required fields by their label', () => {
    const errors = validateBankDetails('us_ach', {});

    expect(errors).toContain('Número de ruta (routing)');
    expect(errors).toContain('Número de cuenta');
  });

  it('flags a required field that fails its pattern', () => {
    const errors = validateBankDetails('us_ach', {
      routing_number: '123',
      account_number: '9999',
    });

    expect(errors).toContain('Número de ruta (routing)');
    expect(errors).not.toContain('Número de cuenta');
  });

  it('requires account number, routing number and bank name for the ach VA rail', () => {
    expect(validateBankDetails('ach', {})).toEqual([
      'Número de ruta (routing)',
      'Número de cuenta',
      'Banco',
    ]);
    expect(
      validateBankDetails('ach', {
        routing_number: '123456789',
        account_number: '9999',
        bank_name: 'Lead Bank',
      })
    ).toEqual([]);
  });

  it('asks an account number for a rail without structured fields, in any key spelling', () => {
    expect(validateBankDetails('unknown_rail', {})).toEqual(['Número de cuenta']);
    expect(validateBankDetails('unknown_rail', { accountNumber: '9999' })).toEqual([]);
    expect(validateBankDetails('unknown_rail', { account_number: '9999' })).toEqual([]);
  });

  it('requires routing and account number on the wire and ach_wire rails, camelCase included', () => {
    for (const rail of ['wire', 'ach_wire']) {
      expect(validateBankDetails(rail, {})).toEqual([
        'Número de ruta (routing)',
        'Número de cuenta',
      ]);
      expect(
        validateBankDetails(rail, { routingNumber: '021000021', accountNumber: '9999' })
      ).toEqual([]);
    }
  });
});

describe('wire rails (NF-2)', () => {
  it('defines routing number, account number and bank name for wire and ach_wire', () => {
    expect(getRailFields('wire')?.map((f) => f.key)).toEqual([
      'routing_number',
      'account_number',
      'bank_name',
    ]);
    expect(getRailFields('ach_wire')?.map((f) => f.key)).toEqual([
      'routing_number',
      'account_number',
      'bank_name',
    ]);
  });
});

describe('displayBankFieldValue', () => {
  it('names the account type and keeps other values as they are', () => {
    const accountType = getRailFields('us_ach')!.find((f) => f.key === 'account_type')!;
    const routing = getRailFields('us_ach')!.find((f) => f.key === 'routing_number')!;

    expect(displayBankFieldValue('checking', accountType)).toBe('Corriente');
    expect(displayBankFieldValue('savings', accountType)).toBe('Ahorros');
    expect(displayBankFieldValue('brokerage', accountType)).toBe('brokerage');
    expect(displayBankFieldValue('021000021', routing)).toBe('021000021');
  });
});
