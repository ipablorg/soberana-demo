import { describe, expect, it } from 'vitest';

import { mapBusinessValuesToApiPayload, mapBusinessValuesToRetryPayload } from '../verify-identity.mapper';
import { businessSchema, type BusinessValues } from '../verify-identity.schema';
import { BUSINESS_DEFAULT_VALUES } from '../../hooks/use-verify-identity';

function buildValidBusiness(overrides: Partial<BusinessValues> = {}): BusinessValues {
  return {
    business_legal_name: 'Acme LLC',
    business_type: 'llc',
    business_industry: 'technology',
    incorporation_date: '2020-01-15',
    primary_website: '',
    business_description: 'Software services',
    is_dao: false,
    registration_number: 'L20000012345',
    number_of_employees: '2-10',
    is_financial_institution: false,
    website_absence_reason: 'Vendemos por referidos',
    tax_id: '12-3456789',
    tax_id_type: 'EIN',
    tax_id_issuing_country: 'USA',
    registered_address_line_1: '1 Main St',
    registered_address_city: 'Miami',
    registered_address_state: 'FL',
    registered_address_postal_code: '33101',
    registered_address_country: 'USA',
    physical_address_line_1: '1 Main St',
    physical_address_city: 'Miami',
    physical_address_state: 'FL',
    physical_address_postal_code: '33101',
    physical_address_country: 'USA',
    source_of_funds: 'owners_capital',
    account_purpose: 'receive_payments_for_goods_and_services',
    account_purpose_other: '',
    estimated_annual_revenue_usd: '0_99999',
    expected_monthly_payments_usd: undefined,
    source_of_funds_description: 'Revenue from services',
    conducts_money_services: false,
    conducts_money_services_using_bridge: false,
    conducts_money_services_description: '',
    high_risk_activities: ['none_of_the_above'],
    high_risk_activities_explanation: '',
    operates_in_prohibited_countries: false,
    compliance_screening_explanation: '',
    proof_of_address_document: '',
    business_formation_document: '',
    ubos: [
      {
        first_name: 'Ana',
        last_name: 'Pérez',
        email: 'ana@example.com',
        birth_date: '1985-05-05',
        nationality: 'USA',
        residential_address_line_1: '2 Oak St',
        residential_address_city: 'Miami',
        residential_address_subdivision: 'FL',
        residential_address_postal_code: '33101',
        residential_address_country: 'USA',
        has_ownership: true,
        ownership_percentage: 100,
        has_control: true,
        is_signer: true,
        is_director: false,
        identifying_document: {
          type: 'SSN',
          issuing_country: 'USA',
          number: '123-45-6789',
        },
      },
    ] as unknown as BusinessValues['ubos'],
    ...overrides,
  } as BusinessValues;
}

function issuePaths(values: BusinessValues): string[] {
  const result = businessSchema.safeParse(values);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'));
}

describe('business provider profile in the KYB company step', () => {
  it('accepts a business with a website reason, employees and the financial-institution answer', () => {
    expect(issuePaths(buildValidBusiness())).toEqual([]);
  });

  it('accepts a website instead of the reason', () => {
    expect(
      issuePaths(buildValidBusiness({ primary_website: 'https://acme.co', website_absence_reason: '' })),
    ).toEqual([]);
  });

  it('asks for the website or the reason when both are empty', () => {
    expect(issuePaths(buildValidBusiness({ primary_website: '', website_absence_reason: '' }))).toEqual([
      'website_absence_reason',
    ]);
  });

  it('asks for the number of employees', () => {
    expect(issuePaths(buildValidBusiness({ number_of_employees: undefined }))).toEqual([
      'number_of_employees',
    ]);
  });

  it('sends the legal name and the provider profile on create and on retry', () => {
    const values = buildValidBusiness();

    const create = mapBusinessValuesToApiPayload(values);
    const retry = mapBusinessValuesToRetryPayload(values);

    const expected = {
      business_name: 'Acme LLC',
      business_legal_name: 'Acme LLC',
      registration_number: 'L20000012345',
      number_of_employees: '2-10',
      is_financial_institution: false,
      website_absence_reason: 'Vendemos por referidos',
    };
    expect(create).toMatchObject(expected);
    expect(retry).toMatchObject(expected);
  });

  it('drops the website reason when a website is given', () => {
    const payload = mapBusinessValuesToApiPayload(
      buildValidBusiness({
        primary_website: 'https://acme.co',
        website_absence_reason: 'stale reason',
      }),
    );

    expect(payload.website_absence_reason).toBeUndefined();
    expect(payload.primary_website).toBe('https://acme.co');
  });

  it('asks for the registration number (NF-3)', () => {
    expect(issuePaths(buildValidBusiness({ registration_number: '' }))).toEqual([
      'registration_number',
    ]);
  });

  it('rejects the tax id as registration number, as Mesta does (NF-3)', () => {
    expect(
      issuePaths(buildValidBusiness({ registration_number: ' 12-3456789 ', tax_id: '12-3456789' })),
    ).toEqual(['registration_number']);
  });

  it('asks for the industry instead of defaulting to "other" (NF-7)', () => {
    expect(
      issuePaths(buildValidBusiness({ business_industry: undefined as unknown as BusinessValues['business_industry'] })),
    ).toEqual(['business_industry']);
    expect(BUSINESS_DEFAULT_VALUES.business_industry).toBeUndefined();
  });
});
