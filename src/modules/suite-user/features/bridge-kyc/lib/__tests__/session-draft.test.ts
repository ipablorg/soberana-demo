/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveSessionDraft,
  loadSessionDraft,
  clearSessionDraft,
  getDraftValuesExcludingBackendHydrated,
  setHydratingFromBackend,
  getIsHydratingFromBackend,
} from '../session-draft';
import type { VerifyIdentityValues } from '../verify-identity.schema';

describe('session-draft', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.clear();
    }
    setHydratingFromBackend(false);
  });

  it('should save and load draft for all fields including PII', () => {
    const values: Partial<VerifyIdentityValues> = {
      birth_date: '1990-01-01',
      tax_id: '12345678',
      number: 'ABC123',
      type: 'DNI',
      place_of_birth_country: 'AR',
      address_line_1: 'Av. Corrientes 1234',
      state: 'Buenos Aires',
    };

    saveSessionDraft(values, 'test-customer');
    const loaded = loadSessionDraft('test-customer');

    expect(loaded).toBeDefined();
    expect(loaded?.birth_date).toBe('1990-01-01');
    expect(loaded?.tax_id).toBe('12345678');
    expect(loaded?.number).toBe('ABC123');
    expect(loaded?.type).toBe('DNI');
    expect(loaded?.place_of_birth_country).toBe('AR');
    expect(loaded?.address_line_1).toBe('Av. Corrientes 1234');
    expect(loaded?.state).toBe('Buenos Aires');
  });

  it('should persist PII fields (birth_date, tax_id, number) in plaintext for UX', () => {
    const values: Partial<VerifyIdentityValues> = {
      birth_date: '1990-01-01',
      tax_id: '12345678',
      number: 'ABC123',
      type: 'PASSPORT',
    };

    saveSessionDraft(values, 'test-customer');
    const loaded = loadSessionDraft('test-customer');

    expect(loaded?.birth_date).toBe('1990-01-01');
    expect(loaded?.tax_id).toBe('12345678');
    expect(loaded?.number).toBe('ABC123');
    expect(loaded?.type).toBe('PASSPORT');
  });

  it('should preserve all fields when using getDraftValuesExcludingBackendHydrated (no-op passthrough)', () => {
    const values: Partial<VerifyIdentityValues> = {
      tax_id_type: 'CUIT',
      birth_date: '1990-01-01',
      address_line_1: 'Main St',
    };

    const filtered = getDraftValuesExcludingBackendHydrated(values);

    expect(filtered.tax_id_type).toBe('CUIT');
    expect(filtered.birth_date).toBe('1990-01-01');
    expect(filtered.address_line_1).toBe('Main St');
  });

  it('should invalidate drafts from older DRAFT_VERSION', () => {
    const staleDraft = {
      metadata: { version: 2, timestamp: Date.now() },
      values: { type: 'DNI', address_line_1: 'Old value' },
    };

    sessionStorage.setItem('kyc_draft_test-customer', JSON.stringify(staleDraft));
    const loaded = loadSessionDraft('test-customer');

    expect(loaded).toBeNull();
    expect(sessionStorage.getItem('kyc_draft_test-customer')).toBeNull();
  });

  it('should clear expired drafts (> 24h)', () => {
    const oldDraft = {
      metadata: { version: 3, timestamp: Date.now() - 25 * 60 * 60 * 1000 },
      values: { type: 'DNI' },
    };

    sessionStorage.setItem('kyc_draft_test-customer', JSON.stringify(oldDraft));
    const loaded = loadSessionDraft('test-customer');

    expect(loaded).toBeNull();
  });

  it('should handle missing sessionStorage gracefully', () => {
    const originalSessionStorage = window.sessionStorage;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).sessionStorage;

    expect(() => saveSessionDraft({}, 'test-customer')).not.toThrow();
    expect(loadSessionDraft('test-customer')).toBeNull();

    window.sessionStorage = originalSessionStorage;
  });

  it('should use user-scoped draft keys', () => {
    const values: Partial<VerifyIdentityValues> = {
      type: 'DNI',
    };

    saveSessionDraft(values, 'user-1');
    saveSessionDraft({ ...values, type: 'PASSPORT' }, 'user-2');

    const user1Draft = loadSessionDraft('user-1');
    const user2Draft = loadSessionDraft('user-2');

    expect(user1Draft?.type).toBe('DNI');
    expect(user2Draft?.type).toBe('PASSPORT');
  });

  it('should track hydration flag', () => {
    expect(getIsHydratingFromBackend()).toBe(false);

    setHydratingFromBackend(true);
    expect(getIsHydratingFromBackend()).toBe(true);

    setHydratingFromBackend(false);
    expect(getIsHydratingFromBackend()).toBe(false);
  });

  it('should clear draft', () => {
    saveSessionDraft({ type: 'DNI' }, 'test-customer');
    expect(loadSessionDraft('test-customer')).toBeDefined();

    clearSessionDraft('test-customer');
    expect(loadSessionDraft('test-customer')).toBeNull();
  });

  it('should persist business basic fields', () => {
    const values: Partial<VerifyIdentityValues> = {
      business_legal_name: 'Test LLC',
      business_type: 'corporation',
      business_industry: 'technology',
      incorporation_date: '2020-01-15',
      primary_website: 'https://example.com',
    };

    saveSessionDraft(values, 'test-customer');
    const loaded = loadSessionDraft('test-customer');

    expect(loaded?.business_legal_name).toBe('Test LLC');
    expect(loaded?.business_type).toBe('corporation');
    expect(loaded?.business_industry).toBe('technology');
    expect(loaded?.incorporation_date).toBe('2020-01-15');
    expect(loaded?.primary_website).toBe('https://example.com');
  });

  it('should persist business address fields', () => {
    const values: Partial<VerifyIdentityValues> = {
      registered_address_line_1: '123 Business St',
      registered_address_city: 'San Francisco',
      registered_address_state: 'CA',
      registered_address_postal_code: '94102',
      registered_address_country: 'USA',
      physical_address_line_1: '456 Office Blvd',
      physical_address_city: 'San Francisco',
      physical_address_state: 'CA',
      physical_address_postal_code: '94105',
      physical_address_country: 'USA',
    };

    saveSessionDraft(values, 'test-customer');
    const loaded = loadSessionDraft('test-customer');

    expect(loaded?.registered_address_line_1).toBe('123 Business St');
    expect(loaded?.registered_address_city).toBe('San Francisco');
    expect(loaded?.registered_address_state).toBe('CA');
    expect(loaded?.physical_address_line_1).toBe('456 Office Blvd');
  });

  it('should persist business compliance fields', () => {
    const values: Partial<VerifyIdentityValues> = {
      source_of_funds: 'business_revenue',
      account_purpose: 'operational',
      expected_annual_revenue_usd: '100000_999999',
      high_risk_activities: ['gambling', 'money_services'],
      high_risk_activities_explanation: 'We operate in high-risk sectors',
      operates_in_prohibited_countries: true,
      conducts_money_services: false,
      compliance_screening_explanation: 'We have strict compliance procedures',
    };

    saveSessionDraft(values, 'test-customer');
    const loaded = loadSessionDraft('test-customer');

    expect(loaded?.source_of_funds).toBe('business_revenue');
    expect(loaded?.high_risk_activities).toEqual(['gambling', 'money_services']);
    expect(loaded?.high_risk_activities_explanation).toBe('We operate in high-risk sectors');
    expect(loaded?.operates_in_prohibited_countries).toBe(true);
  });

  it('should persist UBOs without base64 images', () => {
    const values: Partial<VerifyIdentityValues> = {
      ubos: [
        {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          birth_date: '1980-05-15',
          nationality: 'USA',
          nationalities: ['USA', 'CAN'],
          place_of_birth_country: 'USA',
          place_of_birth_city: 'NYC',
          residential_address_line_1: '123 Main St',
          residential_address_city: 'San Francisco',
          residential_address_subdivision: 'CA',
          residential_address_postal_code: '94102',
          residential_address_country: 'USA',
          identifying_document: {
            type: 'PASSPORT',
            issuing_country: 'USA',
            number: 'P12345678',
            description: 'US Passport',
            expiration: '2025-12-31',
            image_front: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAP//////////////////////////////////////',
            image_back: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAP//////////////////////////////////////',
          },
        },
      ],
    };

    saveSessionDraft(values, 'test-customer');
    const loaded = loadSessionDraft('test-customer');

    expect(loaded?.ubos).toBeDefined();
    expect(loaded?.ubos[0].first_name).toBe('John');
    expect(loaded?.ubos[0].last_name).toBe('Doe');
    expect(loaded?.ubos[0].email).toBe('john@example.com');
    expect(loaded?.ubos[0].birth_date).toBe('1980-05-15');
    expect(loaded?.ubos[0].nationality).toBe('USA');
    expect(loaded?.ubos[0].nationalities).toEqual(['USA', 'CAN']);
    expect(loaded?.ubos[0].place_of_birth_country).toBe('USA');
    expect(loaded?.ubos[0].place_of_birth_city).toBe('NYC');
    expect(loaded?.ubos[0].residential_address_line_1).toBe('123 Main St');
    expect(loaded?.ubos[0].residential_address_city).toBe('San Francisco');
    expect(loaded?.ubos[0].residential_address_subdivision).toBe('CA');
    expect(loaded?.ubos[0].residential_address_postal_code).toBe('94102');
    expect(loaded?.ubos[0].residential_address_country).toBe('USA');
    expect(loaded?.ubos[0].identifying_document).toBeDefined();
    expect(loaded?.ubos[0].identifying_document?.type).toBe('PASSPORT');
    expect(loaded?.ubos[0].identifying_document?.issuing_country).toBe('USA');
    expect(loaded?.ubos[0].identifying_document?.number).toBe('P12345678');
    expect(loaded?.ubos[0].identifying_document?.description).toBe('US Passport');
    expect(loaded?.ubos[0].identifying_document?.expiration).toBe('2025-12-31');
    expect(loaded?.ubos[0].identifying_document?.image_front).toBeUndefined();
    expect(loaded?.ubos[0].identifying_document?.image_back).toBeUndefined();
  });
});
