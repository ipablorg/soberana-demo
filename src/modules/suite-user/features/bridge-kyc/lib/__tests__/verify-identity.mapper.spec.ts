/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { buildAssociatedPerson, mapBusinessValuesToApiPayload } from '../verify-identity.mapper';
import type { ApiKycAssociatedPerson } from '@/shared/lib/kyc/create-customer-input';
import type { BusinessValues } from '../verify-identity.schema';

describe('verify-identity.mapper - Bridge API compliance', () => {
  describe('buildAssociatedPerson', () => {
    it('should map UBO with nationalities, place_of_birth, and residential_address according to Bridge API', () => {
      const ubo = {
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
          image_front: 'data:image/jpeg;base64,/9j/4AAQ...',
          image_back: 'data:image/jpeg;base64,/9j/4AAQ...',
        },
      };

      const result = buildAssociatedPerson(ubo) as ApiKycAssociatedPerson;

      expect(result.first_name).toBe('John');
      expect(result.last_name).toBe('Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.birth_date).toBe('1980-05-15');
      expect(result.nationality).toBe('USA');
      expect(result.nationalities).toEqual(['USA', 'CAN']);
      expect(result.place_of_birth?.country).toBe('USA');
      expect(result.place_of_birth?.city).toBe('NYC');
      expect(result.residential_address?.street).toBe('123 Main St');
      expect(result.residential_address?.city).toBe('San Francisco');
      expect(result.residential_address?.state).toBe('CA');
      expect(result.residential_address?.postal_code).toBe('94102');
      expect(result.residential_address?.country).toBe('USA');
      expect(result.identifying_information).toBeDefined();
      expect(result.identifying_information[0].type).toBe('PASSPORT');
      expect(result.identifying_information[0].issuing_country).toBe('USA');
      expect(result.identifying_information[0].number).toBe('P12345678');
      expect(result.identifying_information[0].description).toBe('US Passport');
      expect(result.identifying_information[0].expiration).toBe('2025-12-31');
      expect(result.identifying_information[0].image_front).toBe('data:image/jpeg;base64,/9j/4AAQ...');
      expect(result.identifying_information[0].image_back).toBe('data:image/jpeg;base64,/9j/4AAQ...');
    });

    it('should NOT include tax_id or tax_id_type fields (Bridge API does not accept them)', () => {
      const ubo = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        birth_date: '1980-05-15',
        nationality: 'USA',
        nationalities: ['USA'],
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
            image_front: 'data:image/jpeg;base64,/9j/4AAQ...',
          },
      };

      const result = buildAssociatedPerson(ubo) as any;

      expect(result.tax_id).toBeUndefined();
      expect(result.tax_id_type).toBeUndefined();
    });

    it('should handle UBO without place_of_birth (optional field)', () => {
      const ubo = {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
        birth_date: '1985-08-22',
        nationality: 'CAN',
        nationalities: ['CAN'],
        place_of_birth_country: '',
        place_of_birth_city: '',
        residential_address_line_1: '456 Oak Ave',
        residential_address_city: 'Toronto',
        residential_address_subdivision: 'ON',
        residential_address_postal_code: 'M5V 2H1',
        residential_address_country: 'CAN',
        identifying_document: {
          type: 'PASSPORT',
          issuing_country: 'CAN',
          number: 'C98765432',
        },
      };

      const result = buildAssociatedPerson(ubo) as ApiKycAssociatedPerson;

      expect(result.first_name).toBe('Jane');
      expect(result.nationalities).toEqual(['CAN']);
      expect(result.place_of_birth).toBeUndefined();
      expect(result.residential_address?.street).toBe('456 Oak Ave');
    });

    it('should handle UBO without residential_address subdivision and postal_code (optional fields)', () => {
      const ubo = {
        first_name: 'Bob',
        last_name: 'Johnson',
        email: 'bob@example.com',
        birth_date: '1975-03-10',
        nationality: 'GBR',
        nationalities: ['GBR'],
        place_of_birth_country: 'GBR',
        place_of_birth_city: 'London',
        residential_address_line_1: '789 High St',
        residential_address_city: 'London',
        residential_address_subdivision: '',
        residential_address_postal_code: '',
        residential_address_country: 'GBR',
        identifying_document: {
          type: 'national_id',
          issuing_country: 'GBR',
          number: 'GB123456789',
        },
      };

      const result = buildAssociatedPerson(ubo) as ApiKycAssociatedPerson;

      expect(result.residential_address?.street).toBe('789 High St');
      expect(result.residential_address?.city).toBe('London');
      expect(result.residential_address?.state).toBeUndefined();
      expect(result.residential_address?.postal_code).toBeUndefined();
    });
  });

  describe('mapBusinessValuesToApiPayload', () => {
    it('should map business address with street and state (internal field names)', () => {
      const businessValues: BusinessValues = {
        business_legal_name: 'Test Business LLC',
        business_type: 'corporation',
        business_industry: 'technology',
        incorporation_date: '2020-01-15',
        primary_website: 'https://example.com',
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
        source_of_funds: 'company_funds',
        source_of_funds_description: 'Revenue from B2B SaaS subscriptions',
        account_purpose: 'operating_a_company',
        expected_annual_revenue_usd: '1000000_9999999',
        expected_monthly_payments_usd: '50000_plus',
        transmits_customer_funds: false,
        business_description: 'A technology company providing B2B software',
        is_dao: false,
        high_risk_activities: ['none_of_the_above'],
        operates_in_prohibited_countries: false,
        conducts_money_services: false,
        proof_of_address_document: 'data:application/pdf;base64,addr123',
        business_formation_document: 'data:application/pdf;base64,form456',
        ubos: [
          {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            birth_date: '1980-05-15',
            nationality: 'USA',
            nationalities: ['USA'],
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
            },
          },
        ],
      };

      const result = mapBusinessValuesToApiPayload(businessValues);

      expect(result.customer_type).toBe('business');
      expect(result.business_name).toBe('Test Business LLC');
      expect(result.business_type).toBe('corporation');
      expect(result.registered_address?.street).toBe('123 Business St');
      expect(result.registered_address?.city).toBe('San Francisco');
      expect(result.registered_address?.state).toBe('CA');
      expect(result.registered_address?.postal_code).toBe('94102');
      expect(result.registered_address?.country).toBe('USA');
      expect(result.physical_address?.street).toBe('456 Office Blvd');
      expect(result.physical_address?.city).toBe('San Francisco');
      expect(result.physical_address?.state).toBe('CA');
      expect(result.physical_address?.postal_code).toBe('94105');
      expect(result.physical_address?.country).toBe('USA');
    });

    it('should NOT use street_line_1 or subdivision in business address (backend mapper converts to Bridge API)', () => {
      const businessValues: BusinessValues = {
        business_legal_name: 'Test LLC',
        business_type: 'limited_liability_company',
        business_industry: 'finance',
        incorporation_date: '2015-06-30',
        registered_address_line_1: '123 Test St',
        registered_address_city: 'Miami',
        registered_address_state: 'FL',
        registered_address_postal_code: '33101',
        registered_address_country: 'USA',
        physical_address_line_1: '456 Office Blvd',
        physical_address_city: 'Miami',
        physical_address_state: 'FL',
        physical_address_postal_code: '33102',
        physical_address_country: 'USA',
        source_of_funds: 'company_funds',
        source_of_funds_description: 'Revenue from services',
        account_purpose: 'operating_a_company',
        expected_annual_revenue_usd: '100000_999999',
        expected_monthly_payments_usd: '50000_plus',
        transmits_customer_funds: true,
        business_description: 'A consulting firm',
        is_dao: false,
        high_risk_activities: ['none_of_the_above'],
        operates_in_prohibited_countries: false,
        conducts_money_services: false,
        proof_of_address_document: 'data:application/pdf;base64,addr789',
        business_formation_document: 'data:application/pdf;base64,form012',
        ubos: [],
      };

      const result = mapBusinessValuesToApiPayload(businessValues);

      expect(result.registered_address?.street_line_1).toBeUndefined();
      expect(result.registered_address?.subdivision).toBeUndefined();
      expect(result.registered_address?.street).toBe('123 Test St');
      expect(result.registered_address?.state).toBe('FL');
      expect(result.physical_address?.street_line_1).toBeUndefined();
      expect(result.physical_address?.subdivision).toBeUndefined();
      expect(result.physical_address?.street).toBe('456 Office Blvd');
      expect(result.physical_address?.state).toBe('FL');
    });
  });
});