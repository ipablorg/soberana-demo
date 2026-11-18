import { describe, expect, it } from 'vitest';

import {
  buildRailPayload,
  EMPTY_RAIL_VALUES,
  mapMissingFields,
  validateRailForm,
  type RailFormValues,
} from '../rail-fields';

const common = {
  beneficiary_name: 'Ana Perez',
  tax_id: '900123456',
  holder_type: 'INDIVIDUAL',
};

const form = (extra: Partial<RailFormValues>): RailFormValues => ({
  ...EMPTY_RAIL_VALUES,
  ...common,
  ...extra,
});

const validUs = form({
  routing_number: '021000021',
  account_number_us: '123456789',
  account_type: 'checking',
  address_line_1: '1 Main St',
  city: 'Miami',
  state: 'fl',
  postal_code: '33101',
});

describe('validateRailForm - common fields', () => {
  it('requires the beneficiary name and tax id on every family', () => {
    const errors = validateRailForm('pix', { ...EMPTY_RAIL_VALUES, pix_key: 'a@b.co' });
    expect(errors.beneficiary_name).toBe('required');
    expect(errors.tax_id).toBe('required');
  });

  it('returns no errors for a valid form', () => {
    expect(validateRailForm('us-bank', validUs)).toEqual({});
  });
});

describe('validateRailForm - us-bank (ach / wire)', () => {
  it('requires a 9-digit routing number', () => {
    expect(validateRailForm('us-bank', { ...validUs, routing_number: '12345' }).routing_number).toBe(
      'routing_number',
    );
    expect(validateRailForm('us-bank', { ...validUs, routing_number: '' }).routing_number).toBe('required');
  });

  it('requires a numeric account number and an account type', () => {
    const errors = validateRailForm('us-bank', { ...validUs, account_number_us: 'abc', account_type: '' });
    expect(errors.account_number_us).toBe('account_number');
    expect(errors.account_type).toBe('required');
  });

  it('requires a 2-letter state and the address block', () => {
    const errors = validateRailForm('us-bank', { ...validUs, state: 'Florida', city: '' });
    expect(errors.state).toBe('state');
    expect(errors.city).toBe('required');
  });

  it('keeps bank name and bank address optional', () => {
    const errors = validateRailForm('us-bank', { ...validUs, bank_name: '', bank_address: '' });
    expect(errors).toEqual({});
  });
});

describe('validateRailForm - swift', () => {
  const swift = form({ bic: 'DEUTDEFF', iban: 'DE89370400440532013000' });

  it('accepts a BIC with IBAN', () => {
    expect(validateRailForm('swift', swift)).toEqual({});
  });

  it('accepts a BIC with a plain account number instead of an IBAN', () => {
    expect(validateRailForm('swift', form({ bic: 'DEUTDEFFXXX', account_number: '0532013000' }))).toEqual({});
  });

  it('requires IBAN or account number', () => {
    expect(validateRailForm('swift', form({ bic: 'DEUTDEFF' })).iban).toBe('iban_or_account');
  });

  it('rejects a malformed BIC and a malformed IBAN', () => {
    const errors = validateRailForm('swift', form({ bic: 'XX', iban: 'not-an-iban' }));
    expect(errors.bic).toBe('bic');
    expect(errors.iban).toBe('iban');
  });
});

describe('validateRailForm - co-ach', () => {
  const co = form({
    bank_code: '1007',
    account_type: 'savings',
    account_number: '12345678901',
    tax_id_type: 'CC',
  });

  it('accepts a Colombian bank account', () => {
    expect(validateRailForm('co-ach', co)).toEqual({});
  });

  it('requires bank, account type, number and document type', () => {
    const errors = validateRailForm('co-ach', form({}));
    expect(errors).toMatchObject({
      bank_code: 'required',
      account_type: 'required',
      account_number: 'required',
      tax_id_type: 'required',
    });
  });

  it('rejects a non-numeric account number', () => {
    expect(validateRailForm('co-ach', { ...co, account_number: '12ab' }).account_number).toBe('account_number');
  });
});

describe('validateRailForm - spei / pix / sepa / uk', () => {
  it('spei needs an 18-digit CLABE', () => {
    expect(validateRailForm('spei', form({ clabe: '012180001234567897' }))).toEqual({});
    expect(validateRailForm('spei', form({ clabe: '1234' })).clabe).toBe('clabe');
    expect(validateRailForm('spei', form({ clabe: '01218000123456789X' })).clabe).toBe('clabe');
  });

  it('pix needs a key', () => {
    expect(validateRailForm('pix', form({ pix_key: 'ana@example.com' }))).toEqual({});
    expect(validateRailForm('pix', form({ pix_key: '  ' })).pix_key).toBe('required');
  });

  it('sepa needs a valid IBAN (spaces allowed) and an optional valid BIC', () => {
    expect(validateRailForm('sepa', form({ iban: 'DE89 3704 0044 0532 0130 00' }))).toEqual({});
    expect(validateRailForm('sepa', form({ iban: 'DE89' })).iban).toBe('iban');
    expect(validateRailForm('sepa', form({ iban: 'DE89370400440532013000', bic: 'zz' })).bic).toBe('bic');
  });

  it('uk needs a 6-digit sort code (dashes allowed) and an 8-digit account number', () => {
    expect(validateRailForm('uk', form({ sort_code: '60-83-71', account_number: '31926819' }))).toEqual({});
    const errors = validateRailForm('uk', form({ sort_code: '6083', account_number: '1234' }));
    expect(errors.sort_code).toBe('sort_code');
    expect(errors.account_number).toBe('account_number');
  });
});

describe('buildRailPayload', () => {
  const base = { customerId: 'cust-1', country: 'US', rail: { code: 'ach', currency: 'USD' } };

  it('builds the US ACH payload with ISO3 country, rail code and currency', () => {
    const payload = buildRailPayload({ ...base, family: 'us-bank', values: validUs });
    expect(payload).toEqual({
      customer_id: 'cust-1',
      type: 'BANK_ACCOUNT',
      country: 'USA',
      payment_rail: 'ach',
      currency: 'USD',
      beneficiary_name: 'Ana Perez',
      tax_id: '900123456',
      holder_type: 'INDIVIDUAL',
      relationship: 'SELF',
      routing_number: '021000021',
      account_number_us: '123456789',
      account_type: 'checking',
      address_line_1: '1 Main St',
      city: 'Miami',
      state: 'FL',
      postal_code: '33101',
    });
  });

  it('sends the optional bank address and alias only when filled', () => {
    const payload = buildRailPayload({
      ...base,
      family: 'us-bank',
      values: { ...validUs, bank_address: ' 1 Bank Plaza, NY ', alias: 'Mama', bank_name: 'Chase' },
    });
    expect(payload).toMatchObject({ bank_address: '1 Bank Plaza, NY', alias: 'Mama', bank_name: 'Chase' });
    const bare = buildRailPayload({ ...base, family: 'us-bank', values: validUs });
    expect(bare).not.toHaveProperty('bank_address');
    expect(bare).not.toHaveProperty('alias');
    expect(bare).not.toHaveProperty('bank_name');
  });

  it('swift uses bic and iban, or the account number when no iban', () => {
    const swiftBase = { country: 'US', customerId: 'c', rail: { code: 'swift', currency: 'USD' } };
    const withIban = buildRailPayload({
      ...swiftBase,
      family: 'swift',
      values: form({ bic: 'deutdeff', iban: 'DE89 3704 0044 0532 0130 00' }),
    });
    expect(withIban).toMatchObject({ payment_rail: 'swift', bic: 'DEUTDEFF', iban: 'DE89370400440532013000' });
    expect(withIban).not.toHaveProperty('account_number');

    const withAccount = buildRailPayload({
      ...swiftBase,
      family: 'swift',
      values: form({ bic: 'DEUTDEFF', account_number: '0532013000' }),
    });
    expect(withAccount).toMatchObject({ account_number: '0532013000' });
    expect(withAccount).not.toHaveProperty('iban');
  });

  it('co-ach carries the bank name from the bank code and a lowercase account type', () => {
    const payload = buildRailPayload({
      country: 'CO',
      customerId: 'c',
      rail: { code: 'co_ach', currency: 'COP' },
      family: 'co-ach',
      values: form({ bank_code: '1007', account_type: 'savings', account_number: '12345678901', tax_id_type: 'CC' }),
    });
    expect(payload).toMatchObject({
      country: 'COL',
      payment_rail: 'co_ach',
      currency: 'COP',
      type: 'BANK_ACCOUNT',
      bank_code: '1007',
      account_number: '12345678901',
      account_type: 'savings',
      tax_id_type: 'CC',
    });
    expect(payload.bank_name).toBeTruthy();
  });

  it('spei sends the digits-only CLABE', () => {
    const payload = buildRailPayload({
      country: 'MX',
      customerId: 'c',
      rail: { code: 'spei', currency: 'MXN' },
      family: 'spei',
      values: form({ clabe: '0121 8000 1234 5678 97' }),
    });
    expect(payload).toMatchObject({ country: 'MEX', clabe: '012180001234567897', payment_rail: 'spei' });
  });

  it('pix is typed PIX and sends the key', () => {
    const payload = buildRailPayload({
      country: 'BR',
      customerId: 'c',
      rail: { code: 'pix', currency: 'BRL' },
      family: 'pix',
      values: form({ pix_key: ' ana@example.com ' }),
    });
    expect(payload).toMatchObject({ type: 'PIX', country: 'BRA', pix_key: 'ana@example.com' });
  });

  it('sepa upper-cases and strips the IBAN, optional bic only when filled', () => {
    const payload = buildRailPayload({
      country: 'DE',
      customerId: 'c',
      rail: { code: 'sepa', currency: 'EUR' },
      family: 'sepa',
      values: form({ iban: 'de89 3704 0044 0532 0130 00' }),
    });
    expect(payload).toMatchObject({ country: 'DEU', iban: 'DE89370400440532013000' });
    expect(payload).not.toHaveProperty('bic');
  });

  it('uk sends a digits-only sort code and the account number', () => {
    const payload = buildRailPayload({
      country: 'GB',
      customerId: 'c',
      rail: { code: 'faster_payments', currency: 'GBP' },
      family: 'uk',
      values: form({ sort_code: '60-83-71', account_number: '31926819' }),
    });
    expect(payload).toMatchObject({ country: 'GBR', sort_code: '608371', account_number: '31926819' });
  });

  it('throws a typed error for a country the beneficiary API cannot address', () => {
    expect(() => buildRailPayload({ ...base, country: 'ZZ', family: 'us-bank', values: validUs })).toThrow(
      /country/i,
    );
  });
});

describe('mapMissingFields', () => {
  it('maps back field names onto form field names, ignoring unknown ones', () => {
    expect(mapMissingFields('us-bank', ['routing_number', 'account_number', 'nonsense'])).toEqual([
      'routing_number',
      'account_number_us',
    ]);
  });

  it('keeps names that are already form fields', () => {
    expect(mapMissingFields('sepa', ['iban', 'bic'])).toEqual(['iban', 'bic']);
  });

  it('highlights the common fields as well', () => {
    expect(mapMissingFields('pix', ['tax_id', 'beneficiary_name'])).toEqual(['tax_id', 'beneficiary_name']);
  });
});
