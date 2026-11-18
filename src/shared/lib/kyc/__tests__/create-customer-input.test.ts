import { describe, it, expect } from 'vitest';

import {
  buildCreateCustomerInput,
  type ApiKycPayload,
  type CreateCustomerBaseInfo,
} from '../create-customer-input';

const base: CreateCustomerBaseInfo = {
  email: 'jane@example.com',
  first_name: 'Jane',
  last_name: 'Doe',
};

const apiPayload: ApiKycPayload = {
  birth_date: '1990-05-12',
  nationality: 'COL',
  tax_id: '900123456',
  tax_id_type: 'nit',
  address: {
    street: 'Calle 100 #20-30',
    street_line_2: 'Apto 501',
    city: 'Bogota',
    state: 'DC',
    postal_code: '110111',
    country: 'COL',
  },
  identifying_information: [
    {
      type: 'DNI',
      issuing_country: 'COL',
      number: '123456789',
      expiration: '2030-01-01',
      image_front: 'BASE64_FRONT',
      image_back: 'BASE64_BACK',
    },
  ],
};

describe('buildCreateCustomerInput — legacy hosted-link flow', () => {
  it('uses kyc_method "kyc_link" when no api payload is provided', () => {
    const input = buildCreateCustomerInput({ ...base, customer_type: 'business', business_name: 'Loopay LLC' });
    expect(input.kyc_method).toBe('kyc_link');
    expect(input.customer_type).toBe('business');
    expect(input.business_name).toBe('Loopay LLC');
  });

  it('falls back to email as the tax_id placeholder', () => {
    const input = buildCreateCustomerInput(base);
    expect(input.tax_id).toBe(base.email);
  });

  it('does not set kyc_provider or api-only fields (identifying_information)', () => {
    const input = buildCreateCustomerInput(base);
    expect(input).not.toHaveProperty('kyc_provider');
    expect(input.identifying_information).toBeUndefined();
  });

  it('preserves the base identity fields', () => {
    const input = buildCreateCustomerInput(base);
    expect(input.email).toBe(base.email);
    expect(input.first_name).toBe(base.first_name);
    expect(input.last_name).toBe(base.last_name);
  });
});

describe('buildCreateCustomerInput — api in-app flow', () => {
  it('uses kyc_method "api"', () => {
    const input = buildCreateCustomerInput(base, apiPayload);
    expect(input.kyc_method).toBe('api');
  });

  it('does not send the deprecated kyc_provider field', () => {
    const input = buildCreateCustomerInput(base, apiPayload);
    expect(input).not.toHaveProperty('kyc_provider');
  });

  it('maps personal fields (birth_date, nationality, tax_id, tax_id_type)', () => {
    const input = buildCreateCustomerInput(base, apiPayload);
    expect(input.birth_date).toBe('1990-05-12');
    expect(input.nationality).toBe('COL');
    expect(input.tax_id).toBe('900123456');
    expect(input.tax_id_type).toBe('nit');
  });

  it('flattens the address into snake_case fields', () => {
    const input = buildCreateCustomerInput(base, apiPayload);
    expect(input.address_line_1).toBe('Calle 100 #20-30');
    expect(input.address_line_2).toBe('Apto 501');
    expect(input.city).toBe('Bogota');
    expect(input.state).toBe('DC');
    expect(input.postal_code).toBe('110111');
    expect(input.country).toBe('COL');
  });

  it('passes identifying_information through unchanged', () => {
    const input = buildCreateCustomerInput(base, apiPayload);
    expect(input.identifying_information).toEqual(apiPayload.identifying_information);
  });

  it('preserves the provider payload shape without unsupported issue-date fields', () => {
    const input = buildCreateCustomerInput(base, {
      ...apiPayload,
      identifying_information: [
        {
          type: 'DNI',
          issuing_country: 'MEX',
          number: 'ABC123',
          image_front: 'BASE64_FRONT',
          image_back: 'BASE64_BACK',
        },
      ],
    });

    expect(input.identifying_information?.[0]).toEqual({
      type: 'DNI',
      issuing_country: 'MEX',
      number: 'ABC123',
      image_front: 'BASE64_FRONT',
      image_back: 'BASE64_BACK',
    });
    expect(input.identifying_information?.[0]).not.toHaveProperty('issue_date');
    expect(input.identifying_information?.[0]).not.toHaveProperty('expedition_date');
  });

  it('keeps stable backend contract values for country-aware KYC payloads', () => {
    const input = buildCreateCustomerInput(base, {
      ...apiPayload,
      nationality: 'MEX',
      tax_id_type: 'CURP',
      address: {
        ...apiPayload.address!,
        country: 'MEX',
      },
      identifying_information: [
        {
          type: 'DNI',
          issuing_country: 'MEX',
          number: '1234567890123',
          image_front: 'BASE64_FRONT',
          image_back: 'BASE64_BACK',
        },
      ],
    });

    expect(input.tax_id_type).toBe('CURP');
    expect(input.identifying_information?.[0]?.type).toBe('DNI');
  });

  it('falls back to email when tax_id is empty', () => {
    const input = buildCreateCustomerInput(base, { ...apiPayload, tax_id: '' });
    expect(input.tax_id).toBe(base.email);
  });
});

describe('buildCreateCustomerInput — business provider profile', () => {
  const address = { street: 'Calle 1', city: 'Bogota', country: 'COL' };

  it('sends the legal name and the provider profile fields once', () => {
    const input = buildCreateCustomerInput(
      { ...base, customer_type: 'business', business_name: 'Acme' },
      {
        customer_type: 'business',
        business_name: 'Acme SAS',
        registered_address: address,
        physical_address: address,
        registration_number: '900123456',
        number_of_employees: '11-50',
        is_financial_institution: false,
        website_absence_reason: 'Vendemos solo por WhatsApp',
      },
    );

    expect(input).toMatchObject({
      business_name: 'Acme SAS',
      business_legal_name: 'Acme SAS',
      registration_number: '900123456',
      number_of_employees: '11-50',
      is_financial_institution: false,
      website_absence_reason: 'Vendemos solo por WhatsApp',
    });
  });

  it('never sends the business fields for an individual', () => {
    const input = buildCreateCustomerInput(base, apiPayload);

    expect(input.business_legal_name).toBeUndefined();
    expect(input.registration_number).toBeUndefined();
  });
});
