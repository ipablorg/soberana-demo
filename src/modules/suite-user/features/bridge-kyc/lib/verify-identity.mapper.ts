import type {
  ApiKycPayload,
  ApiKycIdentifyingInformation,
  ApiKycAssociatedPerson,
} from '@/shared/lib/kyc/create-customer-input';
import type { VerifyIdentityValues, BusinessValues } from './verify-identity.schema';

// Maps front catalog tax-id labels to the backend `tax_id_type` catalog names
// (DB table `tax_id_type`). The front static catalog offers country-specific
// labels that the backend catalog does not register; this alias layer keeps
// both in sync without a DB migration.
// - ECU `CI` (cédula de identidad) → the backend registers ECU individuals
//   under `DNI` (see migration 20260728173732_add_ecu_tax_id_types).
// - USA `ITIN` → the backend has no `ITIN` row; `TIN` is the global catch-all.
// NOTE: ECU `RUC` is intentionally NOT aliased — the backend catalog already
// has RUC for ECU (business customers).
const COUNTRY_TAX_ID_ALIASES: Record<string, Record<string, string>> = {
  ECU: { CI: 'DNI' },
  USA: { ITIN: 'TIN' },
};

function mapTaxIdType(taxIdType?: string, country?: string): string | undefined {
  if (!taxIdType) return undefined;
  if (country) {
    const countryAliases = COUNTRY_TAX_ID_ALIASES[country];
    if (countryAliases?.[taxIdType]) return countryAliases[taxIdType];
  }
  return taxIdType;
}

/**
 * Maps the flat, validated wizard values into the `ApiKycPayload` consumed by
 * `buildCreateCustomerInput`. Keeping this mapping pure (no React, no network)
 * makes it unit-testable and keeps the shared input builder agnostic of the
 * feature's form schema.
 *
 * SECURITY: `image_front`/`image_back` are base64-encoded PII — never log this
 * payload or persist it outside the in-flight request.
 */
export function mapVerifyValuesToApiPayload(
  values: VerifyIdentityValues,
): ApiKycPayload {
  const supportingDocuments = values.supporting_documents?.map((document) => ({
    file: document.file,
    purposes: [document.purpose],
    description: document.description,
  }));

  return {
    customer_type: 'individual',
    birth_date: values.birth_date,
    nationality: values.nationality,
    nationalities: [values.nationality, values.additional_nationality].filter(
      (nationality): nationality is string => Boolean(nationality),
    ),
    place_of_birth: values.place_of_birth_country
      ? {
          country: values.place_of_birth_country,
          city: values.place_of_birth_city,
        }
      : undefined,
    tax_id: values.tax_id,
    tax_id_type: mapTaxIdType(values.tax_id_type, values.country),
    address: {
      street: values.address_line_1,
      city: values.city,
      state: values.state,
      postal_code: values.postal_code,
      country: values.country,
    },
    identifying_information: buildIdentifyingInformation(values),
    selfies: values.selfie ? [values.selfie] : undefined,
    documents: supportingDocuments,
    account_purpose: values.account_purpose,
    account_purpose_other: values.account_purpose === 'other' ? values.account_purpose_other : undefined,
    employment_status: values.employment_status,
    source_of_funds: values.source_of_funds,
    expected_monthly_payments_usd: values.expected_monthly_payments_usd,
    acting_as_intermediary: values.acting_as_intermediary,
    most_recent_occupation: values.most_recent_occupation,
  };
}

export function mapBusinessValuesToApiPayload(
  values: BusinessValues,
): ApiKycPayload {
  return {
    customer_type: 'business',
    business_name: values.business_legal_name,
    business_legal_name: values.business_legal_name,
    registration_number: values.registration_number?.trim() || undefined,
    number_of_employees: values.number_of_employees,
    is_financial_institution: values.is_financial_institution,
    // Only when there is no website: the backend keeps the website otherwise.
    website_absence_reason: values.primary_website?.trim()
      ? undefined
      : values.website_absence_reason?.trim() || undefined,
    business_description: values.business_description,
    is_dao: values.is_dao,
    registered_address: {
      street: values.registered_address_line_1,
      city: values.registered_address_city,
      state: values.registered_address_state,
      postal_code: values.registered_address_postal_code,
      country: values.registered_address_country,
    },
    physical_address: {
      street: values.physical_address_line_1,
      city: values.physical_address_city,
      state: values.physical_address_state,
      postal_code: values.physical_address_postal_code,
      country: values.physical_address_country,
    },
    business_type: values.business_type,
    business_industry: values.business_industry,
    incorporation_date: values.incorporation_date,
    primary_website: values.primary_website || undefined,
    tax_id: values.tax_id,
    tax_id_type: values.tax_id_type,
    tax_id_issuing_country: values.tax_id_issuing_country,
    source_of_funds: values.source_of_funds,
    source_of_funds_description: values.source_of_funds_description,
    account_purpose: values.account_purpose,
    account_purpose_other: values.account_purpose === 'other' ? values.account_purpose_other : undefined,
    estimated_annual_revenue_usd: values.estimated_annual_revenue_usd,
    expected_monthly_payments_usd: values.expected_monthly_payments_usd,
    conducts_money_services: values.conducts_money_services,
    conducts_money_services_using_bridge: values.conducts_money_services_using_bridge,
    conducts_money_services_description: values.conducts_money_services_description,
    high_risk_activities: values.high_risk_activities,
    high_risk_activities_explanation: values.high_risk_activities_explanation,
    operates_in_prohibited_countries: values.operates_in_prohibited_countries,
    compliance_screening_explanation: values.compliance_screening_explanation,
    documents: [
      ...(values.proof_of_address_document ? [{
        file: values.proof_of_address_document,
        purposes: ['proof_of_address'],
        description: undefined,
      }] : []),
      ...(values.business_formation_document ? [{
        file: values.business_formation_document,
        purposes: ['business_formation'],
        description: undefined,
      }] : []),
    ].filter(Boolean),
    associated_persons: values.ubos.map((ubo) => buildAssociatedPerson(ubo)),
  };
}

export interface RetryApiKycPayload {
  kyc_method: 'api';
  birth_date?: string;
  nationality?: string;
  tax_id?: string;
  tax_id_type?: string;
  country?: string;
  address?: {
    street: string;
    city: string;
    state?: string;
    postal_code?: string;
    country: string;
  };
  identifying_information?: ApiKycIdentifyingInformation[];
  business_name?: string;
  business_legal_name?: string;
  registration_number?: string;
  number_of_employees?: string;
  is_financial_institution?: boolean;
  website_absence_reason?: string;
  business_type?: string;
  registered_address?: {
    street: string;
    city: string;
    state?: string;
    postal_code?: string;
    country: string;
  };
  physical_address?: {
    street: string;
    city: string;
    state?: string;
    postal_code?: string;
    country: string;
  };
  incorporation_date?: string;
  primary_website?: string;
  associated_persons?: ApiKycAssociatedPerson[];
}

export function mapVerifyValuesToRetryPayload(
  values: VerifyIdentityValues,
): RetryApiKycPayload {
  return {
    kyc_method: 'api',
    birth_date: values.birth_date,
    nationality: values.nationality,
    tax_id: values.tax_id,
    tax_id_type: mapTaxIdType(values.tax_id_type, values.country),
    country: values.country,
    address: {
      street: values.address_line_1,
      city: values.city,
      state: values.state,
      postal_code: values.postal_code,
      country: values.country,
    },
    identifying_information: buildIdentifyingInformation(values),
  };
}

export function mapBusinessValuesToRetryPayload(
  values: BusinessValues,
): RetryApiKycPayload {
  return {
    kyc_method: 'api',
    business_name: values.business_legal_name,
    business_legal_name: values.business_legal_name,
    registration_number: values.registration_number?.trim() || undefined,
    number_of_employees: values.number_of_employees,
    is_financial_institution: values.is_financial_institution,
    // Only when there is no website: the backend keeps the website otherwise.
    website_absence_reason: values.primary_website?.trim()
      ? undefined
      : values.website_absence_reason?.trim() || undefined,
    business_type: values.business_type,
    registered_address: {
      street: values.registered_address_line_1,
      city: values.registered_address_city,
      state: values.registered_address_state,
      postal_code: values.registered_address_postal_code,
      country: values.registered_address_country,
    },
    physical_address: {
      street: values.physical_address_line_1,
      city: values.physical_address_city,
      state: values.physical_address_state,
      postal_code: values.physical_address_postal_code,
      country: values.physical_address_country,
    },
    incorporation_date: values.incorporation_date,
    primary_website: values.primary_website || undefined,
    associated_persons: values.ubos.map((ubo) => buildAssociatedPerson(ubo)),
  };
}

function buildIdentifyingInformation(
  values: VerifyIdentityValues,
): ApiKycIdentifyingInformation[] {
  return [
    {
      type: values.type,
      issuing_country: values.issuing_country,
      number: values.number,
      description: values.description,
      expiration: values.expiration,
      image_front: values.image_front,
      image_back: values.image_back,
    },
  ];
}

export function buildAssociatedPerson(ubo: any): ApiKycAssociatedPerson {
  const hasControl = ubo.has_control || ubo.has_ownership || ubo.is_signer || ubo.is_director;
  
  return {
    first_name: ubo.first_name,
    last_name: ubo.last_name,
    email: ubo.email,
    birth_date: ubo.birth_date,
    nationality: ubo.nationality,
    nationalities: ubo.nationalities,
    place_of_birth: ubo.place_of_birth_country ? {
      country: ubo.place_of_birth_country,
      city: ubo.place_of_birth_city,
    } : undefined,
    residential_address: {
      street: ubo.residential_address_line_1 || '',
      city: ubo.residential_address_city || '',
      state: ubo.residential_address_subdivision || undefined,
      postal_code: ubo.residential_address_postal_code || undefined,
      country: ubo.residential_address_country || '',
    },
    identifying_information: [
      {
        type: ubo.identifying_document.type,
        issuing_country: ubo.identifying_document.issuing_country,
        number: ubo.identifying_document.number,
        description: ubo.identifying_document.description,
        expiration: ubo.identifying_document.expiration,
        image_front: ubo.identifying_document.image_front,
        image_back: ubo.identifying_document.image_back,
      },
    ],
    has_ownership: ubo.has_ownership || false,
    has_control: ubo.has_control || false,
    is_signer: ubo.is_signer || false,
    is_director: ubo.is_director || false,
    title: ubo.has_control ? ubo.title : undefined,
    ownership_percentage: ubo.has_ownership ? String(ubo.ownership_percentage) : undefined,
    attested_ownership_structure_at: hasControl
      ? ubo.attested_ownership_structure_at || new Date().toISOString()
      : undefined,
  };
}
