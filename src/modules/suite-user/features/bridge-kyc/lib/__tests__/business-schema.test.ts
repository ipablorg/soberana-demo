import { describe, expect, it } from 'vitest';
import { businessSchema, type BusinessValues } from '../verify-identity.schema';

function buildValidBusiness(overrides: Partial<BusinessValues> = {}): BusinessValues {
  return {
    business_legal_name: 'Acme LLC',
    business_type: 'llc',
    business_industry: 'technology',
    incorporation_date: '2020-01-15',
    primary_website: '',
    business_description: 'Software services',
    is_dao: false,
    tax_id: '12-3456789',
    registration_number: 'L20000012345',
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

describe('businessSchema compliance screening explanation', () => {
  it('does not require the explanation, which the form labels as optional', () => {
    expect(issuePaths(buildValidBusiness({ compliance_screening_explanation: '' }))).not.toContain(
      'compliance_screening_explanation'
    );
  });

  it('requires the explanation when the business conducts money services', () => {
    expect(
      issuePaths(
        buildValidBusiness({
          conducts_money_services: true,
          conducts_money_services_description: 'Remittances',
          compliance_screening_explanation: '',
        })
      )
    ).toContain('compliance_screening_explanation');
  });
});
