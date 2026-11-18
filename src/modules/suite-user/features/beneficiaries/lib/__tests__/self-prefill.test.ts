import { describe, expect, it } from 'vitest';

import { extractPrefill } from '@/modules/suite-user/features/dashboard/features/receive/external-account-form';

import { buildSelfPrefill, mergeCustomerProfileIntoPrefill } from '../self-prefill';

// Shape the back serializes today (customer-local-kyc-snapshot.service.ts buildSnapshotPrefill):
// the address uses `street`, and a business carries `business_name` with null first/last name.
const INDIVIDUAL_SNAPSHOT = {
  customer_type: 'individual',
  business_name: null,
  first_name: 'Ana',
  last_name: 'Pérez',
  email: 'ana@example.com',
  address: {
    street: 'Calle 1 #2',
    city: 'Bogotá',
    state: 'DC',
    postal_code: '110111',
    country: 'COL',
  },
};

const BUSINESS_SNAPSHOT = {
  customer_type: 'business',
  business_name: 'Acme SAS',
  first_name: null,
  last_name: null,
  email: 'biz@example.com',
  address: {
    street: 'Carrera 7 #8',
    city: 'Medellín',
    state: 'ANT',
    postal_code: '050001',
    country: 'COL',
  },
};

describe('buildSelfPrefill with the KYC snapshot prefill', () => {
  it('maps the address `street` of an individual to the street field', () => {
    const out = buildSelfPrefill(extractPrefill(INDIVIDUAL_SNAPSHOT));
    expect(out.address_line_1).toBe('Calle 1 #2');
    expect(out.beneficiary_name).toBe('Ana Pérez');
    expect(out.holder_type).toBeUndefined();
  });

  it('takes the individual tax id from the customer profile', () => {
    const merged = mergeCustomerProfileIntoPrefill(INDIVIDUAL_SNAPSHOT, { tax_id: '1020304050' });
    expect(buildSelfPrefill(extractPrefill(merged)).tax_id).toBe('1020304050');
  });

  it('maps legal name, tax id and registered address of a business', () => {
    const merged = mergeCustomerProfileIntoPrefill(BUSINESS_SNAPSHOT, {
      tax_id: '900123456',
      business_name: 'Acme SAS',
      customer_type: 'business',
    });
    const out = buildSelfPrefill(extractPrefill(merged));
    expect(out).toMatchObject({
      beneficiary_name: 'Acme SAS',
      tax_id: '900123456',
      holder_type: 'BUSINESS',
      address_line_1: 'Carrera 7 #8',
      city: 'Medellín',
      postal_code: '050001',
    });
  });

  it('names a business account holder by its legal name even when the profile carries a contact person', () => {
    const merged = mergeCustomerProfileIntoPrefill(BUSINESS_SNAPSHOT, {
      first_name: 'QA Biz',
      last_name: '10191741',
      tax_id: '900123456',
    });
    expect(buildSelfPrefill(extractPrefill(merged)).beneficiary_name).toBe('Acme SAS');
  });

  it('lets the profile address fill what the snapshot lacks and never overwrites with empties', () => {
    const merged = mergeCustomerProfileIntoPrefill(
      { customer_type: 'individual', first_name: 'Ana', last_name: 'Pérez', address: null },
      { tax_id: null, address: { street: 'Av 3', city: 'Cali' } }
    );
    const out = buildSelfPrefill(extractPrefill(merged));
    expect(out.address_line_1).toBe('Av 3');
    expect(out.city).toBe('Cali');
    expect(out.tax_id).toBeUndefined();
  });

  it('keeps the legacy street_line_1 shape working', () => {
    const out = buildSelfPrefill(
      extractPrefill({ first_name: 'A', last_name: 'B', address: { street_line_1: 'Old 1' } })
    );
    expect(out.address_line_1).toBe('Old 1');
  });
});
