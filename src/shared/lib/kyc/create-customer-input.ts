/**
 * create-customer-input
 *
 * Pure mapping logic that builds the `customers_create` input for both KYC flows:
 *
 * - **Legacy hosted-link** (`kyc_method: "kyc_link"`): the user is redirected to a
 *   Bridge/Persona-hosted URL to complete verification.
 * - **In-app api** (`kyc_method: "api"`): the user submits their identity data from
 *   inside the app; provider is forced to `bridge` because Persona does not support
 *   the `api` method.
 *
 * This is deliberately a pure function (no side effects, no React, no network) so it
 * can be unit-tested in a node environment and so `useKYC` keeps a single, testable
 * seam for input construction.
 *
 * NOTE: field names follow the reviewed design contract (docs/sdd/kyc-api-method).
 * Final confirmation of accepted document types and required compliance fields is
 * tracked as T-003 (backend/product open questions) and may adjust the api payload.
 *
 * SECURITY: `image_front`/`image_back` are base64-encoded PII. Never log this input
 * object or persist it outside the in-flight request.
 */

export interface ApiKycIdentifyingInformation {
  type: string;
  issuing_country: string;
  number?: string;
  description?: string;
  expiration?: string;
  image_front: string;
  image_back?: string;
}

export interface ApiKycAssociatedPerson {
  first_name: string;
  last_name: string;
  email: string;
  birth_date: string;
  nationality: string;
  nationalities?: string[];
  place_of_birth?: {
    country: string;
    city?: string;
  };
  residential_address: {
    street: string;
    city: string;
    state?: string;
    postal_code?: string;
    country: string;
  };
  identifying_information: ApiKycIdentifyingInformation[];
  has_ownership: boolean;
  has_control: boolean;
  is_signer: boolean;
  is_director: boolean;
  title?: string;
  ownership_percentage?: string;
  attested_ownership_structure_at?: string;
}

export interface ApiKycSupportingDocument {
  file: string;
  purposes: string[];
  description?: string;
}

export interface ApiKycAddress {
  street?: string;
  street_line_2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
}

export interface ApiKycPlaceOfBirth {
  country: string;
  city?: string;
}

export interface ApiKycPayload {
  customer_type?: 'individual' | 'business';
  business_name?: string;
  business_legal_name?: string;
  /** Company registration number (defaults to the tax id on the backend). */
  registration_number?: string;
  /** One of the backend employee ranges: 1, 2-10, 11-50, 51-200, 201-1000, 1000+ (legacy 201-500 / 501+ still accepted). */
  number_of_employees?: string;
  is_financial_institution?: boolean;
  /** Why the business has no website (only when primary_website is empty). */
  website_absence_reason?: string;
  business_type?: string;
  business_industry?: string;
  incorporation_date?: string;
  business_description?: string;
  is_dao?: boolean;
  primary_website?: string;
  registered_address?: ApiKycAddress;
  physical_address?: ApiKycAddress;
  birth_date?: string;
  nationality?: string;
  nationalities?: string[];
  place_of_birth?: ApiKycPlaceOfBirth;
  tax_id?: string;
  tax_id_type?: string;
  tax_id_issuing_country?: string;
  address?: ApiKycAddress;
  identifying_information?: ApiKycIdentifyingInformation[];
  associated_persons?: ApiKycAssociatedPerson[];
  selfies?: string[];
  documents?: ApiKycSupportingDocument[];
  account_purpose?: string;
  employment_status?: string;
  source_of_funds?: string;
  source_of_funds_description?: string;
  expected_monthly_payments_usd?: string;
  estimated_annual_revenue_usd?: string;
  high_risk_activities?: string[];
  high_risk_activities_explanation?: string;
  operates_in_prohibited_countries?: boolean;
  conducts_money_services?: boolean;
  conducts_money_services_using_bridge?: boolean;
  conducts_money_services_description?: string;
  compliance_screening_explanation?: string;
  acting_as_intermediary?: boolean;
  most_recent_occupation?: string;
}

export interface CreateCustomerBaseInfo {
  customer_type?: 'individual' | 'business';
  business_name?: string;
  email: string;
  first_name: string;
  last_name: string;
}

export type CreateCustomerKycMethod = 'kyc_link' | 'api';

export interface CreateCustomerInputShape {
  email: string;
  first_name: string;
  last_name: string;
  kyc_method: CreateCustomerKycMethod;
  tax_id?: string;
  customer_type?: 'individual' | 'business';
  business_name?: string;
  business_legal_name?: string;
  /** Company registration number (defaults to the tax id on the backend). */
  registration_number?: string;
  /** One of the backend employee ranges: 1, 2-10, 11-50, 51-200, 201-1000, 1000+ (legacy 201-500 / 501+ still accepted). */
  number_of_employees?: string;
  is_financial_institution?: boolean;
  /** Why the business has no website (only when primary_website is empty). */
  website_absence_reason?: string;
  business_type?: string;
  business_industry?: string;
  business_description?: string;
  is_dao?: boolean;
  incorporation_date?: string;
  primary_website?: string;
  registered_address_line_1?: string;
  registered_address_line_2?: string;
  registered_address_city?: string;
  registered_address_state?: string;
  registered_address_postal_code?: string;
  registered_address_country?: string;
  physical_address_line_1?: string;
  physical_address_line_2?: string;
  physical_address_city?: string;
  physical_address_state?: string;
  physical_address_postal_code?: string;
  physical_address_country?: string;
  birth_date?: string;
  nationality?: string;
  nationalities?: string[];
  place_of_birth?: ApiKycPlaceOfBirth;
  tax_id_type?: string;
  tax_id_issuing_country?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  identifying_information?: ApiKycIdentifyingInformation[];
  associated_persons?: ApiKycAssociatedPerson[];
  selfies?: string[];
  documents?: ApiKycSupportingDocument[];
  account_purpose?: string;
  employment_status?: string;
  source_of_funds?: string;
  source_of_funds_description?: string;
  expected_monthly_payments_usd?: string;
  estimated_annual_revenue_usd?: string;
  high_risk_activities?: string[];
  high_risk_activities_explanation?: string;
  operates_in_prohibited_countries?: boolean;
  conducts_money_services?: boolean;
  conducts_money_services_using_bridge?: boolean;
  conducts_money_services_description?: string;
  compliance_screening_explanation?: string;
  acting_as_intermediary?: boolean;
  most_recent_occupation?: string;
}

export interface RetryKycInputShape extends CreateCustomerInputShape {
  customer_id: string;
  endorsement?: string;
  redirect_uri?: string;
}

/**
 * Product decision: the suite user flow is now always API-only.
 *
 * Legacy hosted-link fallback remains in code only as technical debt cleanup,
 * but runtime must always use the embedded Verify Identity wizard.
 */
export function isApiKycEnabled(): boolean {
  return true;
}

/**
 * Builds the `customers_create` input.
 *
 * @param base   Identity fields always required by the backend.
 * @param payload When omitted, produces the legacy hosted-link input. When provided,
 *                produces the in-app `api` input.
 */
export function buildCreateCustomerInput(
  base: CreateCustomerBaseInfo,
  payload?: ApiKycPayload,
): CreateCustomerInputShape {
  if (!payload) {
    return {
      ...base,
      kyc_method: 'kyc_link',
      customer_type: base.customer_type,
      business_name: base.customer_type === 'business' ? base.business_name : undefined,
      // tax_id must be unique on the backend; use email as a placeholder until the
      // user provides a real tax ID in the in-app flow.
      tax_id: base.email,
    };
  }

  const customerType = payload.customer_type ?? base.customer_type;
  const isBusiness = customerType === 'business';

  if (!isBusiness && !payload.address) {
    throw new Error('Address is required for api KYC payloads');
  }

  if (!isBusiness && !payload.identifying_information?.length) {
    throw new Error('Identifying information is required for api KYC payloads');
  }

  if (isBusiness && !payload.registered_address) {
    throw new Error('Registered address is required for business api KYC payloads');
  }

  if (isBusiness && !payload.physical_address) {
    throw new Error('Physical address is required for business api KYC payloads');
  }

  return {
    ...base,
    kyc_method: 'api',
    customer_type: customerType,
    business_name: isBusiness
      ? payload.business_name ?? base.business_name
      : undefined,
    // The KYB legal name: the backend keys business eligibility on it.
    business_legal_name: isBusiness
      ? payload.business_legal_name ?? payload.business_name ?? base.business_name
      : undefined,
    registration_number: isBusiness ? payload.registration_number : undefined,
    number_of_employees: isBusiness ? payload.number_of_employees : undefined,
    is_financial_institution: isBusiness ? payload.is_financial_institution : undefined,
    website_absence_reason: isBusiness ? payload.website_absence_reason : undefined,
    business_type: payload.business_type,
    business_industry: payload.business_industry,
    business_description: payload.business_description,
    is_dao: payload.is_dao,
    incorporation_date: payload.incorporation_date,
    primary_website: payload.primary_website,
    registered_address_line_1: payload.registered_address?.street,
    registered_address_line_2: payload.registered_address?.street_line_2,
    registered_address_city: payload.registered_address?.city,
    registered_address_state: payload.registered_address?.state,
    registered_address_postal_code: payload.registered_address?.postal_code,
    registered_address_country: payload.registered_address?.country,
    physical_address_line_1: payload.physical_address?.street,
    physical_address_line_2: payload.physical_address?.street_line_2,
    physical_address_city: payload.physical_address?.city,
    physical_address_state: payload.physical_address?.state,
    physical_address_postal_code: payload.physical_address?.postal_code,
    physical_address_country: payload.physical_address?.country,
    tax_id: payload.tax_id || base.email,
    tax_id_type: payload.tax_id_type,
    tax_id_issuing_country: payload.tax_id_issuing_country,
    birth_date: payload.birth_date,
    nationality: payload.nationality,
    nationalities: payload.nationalities,
    place_of_birth: payload.place_of_birth,
    address_line_1: payload.address?.street,
    address_line_2: payload.address?.street_line_2,
    city: payload.address?.city,
    state: payload.address?.state,
    postal_code: payload.address?.postal_code,
    country: payload.address?.country,
    identifying_information: payload.identifying_information,
    associated_persons: payload.associated_persons,
    selfies: payload.selfies,
    documents: payload.documents,
    account_purpose: payload.account_purpose,
    employment_status: payload.employment_status,
    source_of_funds: payload.source_of_funds,
    source_of_funds_description: payload.source_of_funds_description,
    expected_monthly_payments_usd: payload.expected_monthly_payments_usd,
    estimated_annual_revenue_usd: payload.estimated_annual_revenue_usd,
    high_risk_activities: payload.high_risk_activities,
    high_risk_activities_explanation: payload.high_risk_activities_explanation,
    operates_in_prohibited_countries: payload.operates_in_prohibited_countries,
    conducts_money_services: payload.conducts_money_services,
    conducts_money_services_using_bridge: payload.conducts_money_services_using_bridge,
    conducts_money_services_description: payload.conducts_money_services_description,
    compliance_screening_explanation: payload.compliance_screening_explanation,
    acting_as_intermediary: payload.acting_as_intermediary,
    most_recent_occupation: payload.most_recent_occupation,
  };
}

export function buildRetryKycInput(
  base: CreateCustomerBaseInfo,
  customerId: string,
  payload: ApiKycPayload,
  options?: {
    endorsement?: string;
    redirect_uri?: string;
  },
): RetryKycInputShape {
  return {
    ...buildCreateCustomerInput(base, payload),
    customer_id: customerId,
    endorsement: options?.endorsement,
    redirect_uri: options?.redirect_uri,
  };
}
