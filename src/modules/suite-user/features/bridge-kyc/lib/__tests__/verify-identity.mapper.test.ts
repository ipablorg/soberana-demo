import { describe, it, expect } from 'vitest';

import {
  mapVerifyValuesToApiPayload,
  mapVerifyValuesToRetryPayload,
} from '../verify-identity.mapper';
import type { VerifyIdentityValues } from '../verify-identity.schema';

const baseValues: VerifyIdentityValues = {
  birth_date: '1990-05-12',
  nationality: 'COL',
  tax_id: '900123456',
  tax_id_type: 'nit',
  address_line_1: 'Calle 100 #20-30',
  city: 'Bogota',
  state: 'DC',
  postal_code: '110111',
  country: 'COL',
  type: 'DNI',
  issuing_country: 'COL',
  number: '123456789',
  expiration: '2030-01-01',
  source_of_funds: undefined,
  employment_status: undefined,
  account_purpose: undefined,
  expected_monthly_payments_usd: undefined,
  acting_as_intermediary: false,
  most_recent_occupation: undefined,
  selfie: undefined,
  supporting_documents: undefined,
  image_front: 'data:image/jpeg;base64,FRONT',
  image_back: 'data:image/jpeg;base64,BACK',
};

describe('mapVerifyValuesToApiPayload', () => {
  it('maps personal fields', () => {
    const payload = mapVerifyValuesToApiPayload(baseValues);
    expect(payload.birth_date).toBe('1990-05-12');
    expect(payload.nationality).toBe('COL');
    expect(payload.nationalities).toEqual(['COL']);
    expect(payload.tax_id).toBe('900123456');
    expect(payload.tax_id_type).toBe('nit');
  });

  it('aliases ECU CI to DNI (backend catalog registers ECU individuals as DNI)', () => {
    const payload = mapVerifyValuesToApiPayload({
      ...baseValues,
      nationality: 'ECU',
      country: 'ECU',
      issuing_country: 'ECU',
      tax_id_type: 'CI',
    });

    expect(payload.tax_id_type).toBe('DNI');
  });

  it('keeps ECU RUC unaliased (backend catalog has RUC for ECU businesses)', () => {
    const payload = mapVerifyValuesToApiPayload({
      ...baseValues,
      nationality: 'ECU',
      country: 'ECU',
      issuing_country: 'ECU',
      tax_id_type: 'RUC',
    });

    expect(payload.tax_id_type).toBe('RUC');
  });

  it('aliases USA ITIN to TIN (backend catalog has no ITIN row)', () => {
    const payload = mapVerifyValuesToApiPayload({
      ...baseValues,
      nationality: 'USA',
      country: 'USA',
      issuing_country: 'USA',
      tax_id_type: 'ITIN',
    });

    expect(payload.tax_id_type).toBe('TIN');
  });

  it('maps optional EEA nationality and place of birth fields', () => {
    const payload = mapVerifyValuesToApiPayload({
      ...baseValues,
      nationality: 'DEU',
      additional_nationality: 'FRA',
      place_of_birth_country: 'DEU',
      place_of_birth_city: 'Berlin',
    });

    expect(payload.nationalities).toEqual(['DEU', 'FRA']);
    expect(payload.place_of_birth).toEqual({
      country: 'DEU',
      city: 'Berlin',
    });
  });

  it('nests address fields under address', () => {
    const payload = mapVerifyValuesToApiPayload(baseValues);
    expect(payload.address).toEqual({
      street: 'Calle 100 #20-30',
      city: 'Bogota',
      state: 'DC',
      postal_code: '110111',
      country: 'COL',
    });
  });

  it('builds a single identifying_information entry from the document fields', () => {
    const payload = mapVerifyValuesToApiPayload(baseValues);
    expect(payload.identifying_information).toHaveLength(1);
    expect(payload.identifying_information?.[0]).toEqual({
      type: 'DNI',
      issuing_country: 'COL',
      number: '123456789',
      description: undefined,
      expiration: '2030-01-01',
      image_front: 'data:image/jpeg;base64,FRONT',
      image_back: 'data:image/jpeg;base64,BACK',
    });
  });

  it('preserves backend document enums even when the UX label is country-specific', () => {
    const mexicoPayload = mapVerifyValuesToApiPayload({
      ...baseValues,
      nationality: 'MEX',
      country: 'MEX',
      issuing_country: 'MEX',
      tax_id_type: 'CURP',
      type: 'DNI',
    });

    const usaPayload = mapVerifyValuesToApiPayload({
      ...baseValues,
      nationality: 'USA',
      country: 'USA',
      issuing_country: 'USA',
      tax_id_type: 'SSN',
      type: 'OTHER',
      description: 'California driver license',
      image_back: undefined,
    });

    expect(mexicoPayload.tax_id_type).toBe('CURP');
    expect(mexicoPayload.identifying_information?.[0].type).toBe('DNI');
    expect(usaPayload.tax_id_type).toBe('SSN');
    expect(usaPayload.identifying_information?.[0].type).toBe('OTHER');
  });

  it('omits image_back for single-sided documents (passport)', () => {
    const payload = mapVerifyValuesToApiPayload({
      ...baseValues,
      type: 'PASSPORT',
      image_back: undefined,
    });
    expect(payload.identifying_information?.[0].image_back).toBeUndefined();
  });

  it('omits optional document fields when not provided', () => {
    const payload = mapVerifyValuesToApiPayload({
      ...baseValues,
      number: undefined,
      expiration: undefined,
    });
    expect(payload.identifying_information?.[0].number).toBeUndefined();
    expect(payload.identifying_information?.[0].expiration).toBeUndefined();
  });

  it('maps retry payload to the REST retry shape expected by the existing backend', () => {
    const payload = mapVerifyValuesToRetryPayload(baseValues);

    expect(payload).toEqual({
      kyc_method: 'api',
      birth_date: '1990-05-12',
      nationality: 'COL',
      tax_id: '900123456',
      tax_id_type: 'nit',
      country: 'COL',
      address: {
        street: 'Calle 100 #20-30',
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
          description: undefined,
          expiration: '2030-01-01',
          image_front: 'data:image/jpeg;base64,FRONT',
          image_back: 'data:image/jpeg;base64,BACK',
        },
      ],
    });
  });

  it('keeps retry payload mapping stable for country-aware document labels', () => {
    const payload = mapVerifyValuesToRetryPayload({
      ...baseValues,
      nationality: 'ECU',
      country: 'ECU',
      issuing_country: 'ECU',
      tax_id_type: 'RUC',
      type: 'DNI',
    });

    expect(payload.tax_id_type).toBe('RUC');
    expect(payload.identifying_information?.[0]?.type).toBe('DNI');
  });

  it('does not invent unsupported provider issue-date fields for country-aware documents', () => {
    const payload = mapVerifyValuesToApiPayload({
      ...baseValues,
      nationality: 'MEX',
      country: 'MEX',
      issuing_country: 'MEX',
      tax_id_type: 'CURP',
      expiration: undefined,
    });

    expect(payload.identifying_information?.[0]).toEqual({
      type: 'DNI',
      issuing_country: 'MEX',
      number: '123456789',
      description: undefined,
      expiration: undefined,
      image_front: 'data:image/jpeg;base64,FRONT',
      image_back: 'data:image/jpeg;base64,BACK',
    });
    expect(payload.identifying_information?.[0]).not.toHaveProperty('issue_date');
    expect(payload.identifying_information?.[0]).not.toHaveProperty('expedition_date');
  });

  it('maps questionnaire, selfie, and supporting documents into the api payload', () => {
    const payload = mapVerifyValuesToApiPayload({
      ...baseValues,
      source_of_funds: 'salary',
      employment_status: 'employed',
      account_purpose: 'receive_salary',
      expected_monthly_payments_usd: '5000_9999',
      acting_as_intermediary: true,
      most_recent_occupation: '113031',
      selfie: 'data:image/jpeg;base64,SELFIE',
      supporting_documents: [
        {
          purpose: 'proof_of_address',
          file: 'data:image/jpeg;base64,DOC',
          description: 'Utility bill',
        },
      ],
    });

    expect(payload.source_of_funds).toBe('salary');
    expect(payload.employment_status).toBe('employed');
    expect(payload.account_purpose).toBe('receive_salary');
    expect(payload.expected_monthly_payments_usd).toBe('5000_9999');
    expect(payload.acting_as_intermediary).toBe(true);
    expect(payload.most_recent_occupation).toBe('113031');
    expect(payload.selfies).toEqual(['data:image/jpeg;base64,SELFIE']);
    expect(payload.documents).toEqual([
      {
        file: 'data:image/jpeg;base64,DOC',
        purposes: ['proof_of_address'],
        description: 'Utility bill',
      },
    ]);
  });
});
