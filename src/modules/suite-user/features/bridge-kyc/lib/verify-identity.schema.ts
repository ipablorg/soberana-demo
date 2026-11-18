import { z } from 'zod';
import { KYC_COUNTRY_CATALOG } from '@/shared/lib/kyc/static-catalog';
import { DEFAULT_SOF_QUESTIONNAIRE_FIELDS } from './sof-defaults';
import {
  DOCUMENT_TYPES,
  documentTypeRequiresBack,
  documentTypeRequiresExpiration,
  documentTypeRequiresNumber,
  documentTypeRequiresPhoto,
  isUsaDocumentType,
  type DocumentType,
} from './document-type-semantics';
import { EMPLOYEE_RANGE_OPTIONS } from './business-provider-profile';

/**
 * Bridge does not support customers whose principal residential or operating
 * address is in New York ("Unsupported subdivision NY"). Block it upfront with
 * a clear message instead of letting the submission fail with a 400.
 */
const UNSUPPORTED_USA_SUBDIVISIONS = ['NY', 'NEW YORK'];

function isUnsupportedUsaSubdivision(state: string | undefined | null): boolean {
  const normalized = state?.trim().toUpperCase();
  return Boolean(normalized && UNSUPPORTED_USA_SUBDIVISIONS.includes(normalized));
}

function refineNotNewYork(
  countryPath: string,
  statePath: string,
): (value: { country?: string; state?: string }, ctx: z.RefinementCtx) => void {
  return (value, ctx) => {
    if (value.country?.toUpperCase() !== 'USA') return;
    if (!isUnsupportedUsaSubdivision(value.state)) return;
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [statePath],
      message: 'New York addresses are not supported yet — use a different address',
    });
  };
}

/**
 * Zod schemas for the in-app KYC verification flow (`kyc_method: "api"`).
 *
 * Split per wizard step so each step can validate independently, and composed
 * into `verifyIdentitySchema` for the final submit that maps to
 * `CreateCustomerInput`.
 *
 * Document `type` values match the backend `customers_create` contract
 * (CreateCustomerInput.identifying_information): DNI = any national ID
 * (CC/NIF/CE/CI…), PASSPORT = passport, OTHER = any other document (requires a
 * `description`). Confirmed against suite-loopay-back (T-003 resolved).
 */

export const EMPLOYMENT_STATUS_OPTIONS = [
  'employed',
  'homemaker',
  'retired',
  'self_employed',
  'student',
  'unemployed',
] as const;

export const SOURCE_OF_FUNDS_OPTIONS = [
  'company_funds',
  'ecommerce_reseller',
  'gambling_proceeds',
  'gifts',
  'government_benefits',
  'inheritance',
  'investments_loans',
  'pension_retirement',
  'salary',
  'sale_of_assets_real_estate',
  'savings',
  'someone_elses_funds',
] as const;

export const ACCOUNT_PURPOSE_OPTIONS = [
  'charitable_donations',
  'ecommerce_retail_payments',
  'investment_purposes',
  'operating_a_company',
  'other',
  'payments_to_friends_or_family_abroad',
  'personal_or_living_expenses',
  'protect_wealth',
  'purchase_goods_and_services',
  'receive_payment_for_freelancing',
  'receive_salary',
] as const;

export const EXPECTED_MONTHLY_PAYMENTS_OPTIONS = [
  '0_4999',
  '5000_9999',
  '10000_49999',
  '50000_plus',
] as const;

/**
 * Bridge accepts a 6-char occupation code (digits + optional X wildcard).
 * We constrain frontend select values to a curated subset of known-safe codes.
 */
export const MOST_RECENT_OCCUPATION_OPTIONS = [
  '111021', // Business owner / general manager
  '113031', // Finance manager
  '131111', // Consultant
  '132011', // Accountant
  '151252', // Software developer
  '172199', // Engineer
  '231011', // Lawyer
  '2530XX', // Teacher
  '2912XX', // Healthcare professional
  '413091', // Sales representative
  '439061', // Administrative assistant
  '999999', // Other / unemployed / fallback bucket
] as const;

export const SUPPORTING_DOCUMENT_PURPOSE_OPTIONS = [
  'proof_of_address',
  'proof_of_source_of_funds',
  'proof_of_source_of_wealth',
  'proof_of_tax_identification',
  'proof_of_account_purpose',
  'proof_of_relationship',
  'proof_of_individual_name_change',
  'other',
] as const;

export type EmploymentStatus = (typeof EMPLOYMENT_STATUS_OPTIONS)[number];
export type SourceOfFunds = (typeof SOURCE_OF_FUNDS_OPTIONS)[number];

export const BUSINESS_SOURCE_OF_FUNDS_OPTIONS = [
  'business_loans',
  'grants',
  'inter_company_funds',
  'investment_proceeds',
  'legal_settlement',
  'owners_capital',
  'pension_retirement',
  'sale_of_assets',
  'sales_of_goods_and_services',
  'third_party_funds',
  'treasury_reserves',
] as const;

export type BusinessSourceOfFunds = (typeof BUSINESS_SOURCE_OF_FUNDS_OPTIONS)[number];

export const BUSINESS_ACCOUNT_PURPOSE_OPTIONS = [
  'charitable_donations',
  'ecommerce_retail_payments',
  'investment_purposes',
  'other',
  'payments_to_friends_or_family_abroad',
  'payroll',
  'personal_or_living_expenses',
  'protect_wealth',
  'purchase_goods_and_services',
  'receive_payments_for_goods_and_services',
  'tax_optimization',
  'third_party_money_transmission',
  'treasury_management',
] as const;

export type BusinessAccountPurpose = (typeof BUSINESS_ACCOUNT_PURPOSE_OPTIONS)[number];

export type AccountPurpose = (typeof ACCOUNT_PURPOSE_OPTIONS)[number];
export type ExpectedMonthlyPayments = (typeof EXPECTED_MONTHLY_PAYMENTS_OPTIONS)[number];
export type MostRecentOccupation = (typeof MOST_RECENT_OCCUPATION_OPTIONS)[number];
export type SupportingDocumentPurpose = (typeof SUPPORTING_DOCUMENT_PURPOSE_OPTIONS)[number];

export { DOCUMENT_TYPES, documentTypeRequiresBack, type DocumentType };

const SUPPORTED_ISO3_CODES = KYC_COUNTRY_CATALOG.map((country) => country.iso3);

const iso3 = z
  .string()
  .length(3)
  .regex(/^[A-Z]{3}$/, 'must be a valid ISO 3166-1 alpha-3 code')
  .refine((value) => SUPPORTED_ISO3_CODES.includes(value), 'must be a supported country code');

const optionalIso3 = z.preprocess((value) => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }

  return value;
}, iso3.optional());

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD');
const optionalIsoDate = z.preprocess((value) => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }

  return value;
}, isoDate.optional());

const pastDate = isoDate.refine((value) => {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
}, 'must be a date in the past');

export const personalSchema = z.object({
  birth_date: pastDate,
  nationality: iso3,
  additional_nationality: optionalIso3,
  place_of_birth_country: optionalIso3,
  place_of_birth_city: z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() === '') {
      return undefined;
    }

    return value;
  }, z.string().min(1).optional()),
  tax_id: z.string().min(1),
  tax_id_type: z.string().min(1),
});

export const addressSchema = z.object({
  address_line_1: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1, 'State / Province is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: iso3,
});

const documentObject = z.object({
  type: z.enum(DOCUMENT_TYPES),
  issuing_country: iso3,
  number: z.string().optional(),
  description: z.string().optional(),
  expiration: optionalIsoDate,
  // Photo is only required for photo document types — SSN/ITIN are number-only
  // identifying entries for US customers.
  image_front: z.string().optional(),
  image_back: z.string().optional(),
});

export const supportingDocumentSchema = z.object({
  purpose: z.enum(SUPPORTING_DOCUMENT_PURPOSE_OPTIONS),
  file: z.string().min(1, 'a document file is required'),
  description: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.purpose === 'other' && !data.description?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['description'],
      message: 'A description is required when document purpose is "other"',
    });
  }
});

function refineDocument(
  value: {
    type: DocumentType;
    issuing_country: string;
    image_front?: string;
    image_back?: string;
    number?: string;
    description?: string;
    expiration?: string;
  },
  ctx: z.RefinementCtx,
): void {
  // Bridge rejects passport/national_id/other for US-issued documents —
  // only SSN and ITIN are valid there.
  if (value.issuing_country === 'USA' && !isUsaDocumentType(value.type)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['type'],
      message: 'US-issued documents only accept SSN or ITIN',
    });
  }

  if (documentTypeRequiresPhoto(value.type) && !value.image_front) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['image_front'],
      message: 'a front image is required',
    });
  }

  if (documentTypeRequiresNumber(value.type) && !value.number?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['number'],
      message: 'a document number is required for this document type',
    });
  }

  if (documentTypeRequiresBack(value.type) && !value.image_back) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['image_back'],
      message: 'a back image is required for this document type',
    });
  }
  // Backend requires a description when the document type is OTHER.
  if (value.type === 'OTHER' && !value.description?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['description'],
      message: 'a description is required for "other" document types',
    });
  }

  if (
    documentTypeRequiresExpiration(value.issuing_country, value.type)
    && !value.expiration
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['expiration'],
      message: 'an expiration date is required for this document type',
    });
  }
}

export const documentSchema = documentObject.superRefine(refineDocument);

const REQUIRED_OPTIONAL_SOF_FIELDS = [
  'source_of_funds',
  'employment_status',
  'account_purpose',
  'expected_monthly_payments_usd',
  'most_recent_occupation',
] as const;

const REQUIRED_OPTIONAL_SOF_FIELD_SET = new Set<string>(REQUIRED_OPTIONAL_SOF_FIELDS);

const REQUIRED_OPTIONAL_SOF_FIELD_MESSAGES: Record<(typeof REQUIRED_OPTIONAL_SOF_FIELDS)[number], string> = {
  source_of_funds: 'Source of funds is required',
  employment_status: 'Employment status is required',
  account_purpose: 'Account purpose is required',
  expected_monthly_payments_usd: 'Expected monthly payments is required',
  most_recent_occupation: 'Occupation is required',
};

export const verifyIdentitySchema = personalSchema
  .merge(addressSchema)
  .merge(z.object({
    source_of_funds: z.enum(SOURCE_OF_FUNDS_OPTIONS, { message: 'Source of funds is required' }),
    employment_status: z.enum(EMPLOYMENT_STATUS_OPTIONS, { message: 'Employment status is required' }),
    account_purpose: z.enum(ACCOUNT_PURPOSE_OPTIONS, { message: 'Account purpose is required' }),
    account_purpose_other: z.string().optional(),
    expected_monthly_payments_usd: z.enum(EXPECTED_MONTHLY_PAYMENTS_OPTIONS, { message: 'Expected monthly payments is required' }),
    acting_as_intermediary: z.boolean().default(false),
    most_recent_occupation: z.preprocess((value) => {
      if (typeof value !== 'string') {
        return value;
      }

      const normalized = value.trim();
      return normalized === '' ? undefined : normalized;
    }, z.enum(MOST_RECENT_OCCUPATION_OPTIONS).optional()),
    selfie: z.string().optional(),
    supporting_documents: z.array(supportingDocumentSchema).optional(),
  }))
  .merge(documentObject)
  .superRefine(refineDocument)
  .superRefine((data, ctx) => {
    if (data.account_purpose === 'other' && !data.account_purpose_other?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['account_purpose_other'],
        message: 'A description is required when account purpose is "other"',
      });
    }
  })
  .superRefine(refineNotNewYork('country', 'state'));

export function buildVerifyIdentitySchema(
  requiredQuestionnaireFields: readonly string[],
): z.ZodEffects<typeof verifyIdentitySchema> {
  const requiredFieldSet = new Set(requiredQuestionnaireFields);

  return verifyIdentitySchema.superRefine((value, ctx) => {
    for (const field of DEFAULT_SOF_QUESTIONNAIRE_FIELDS) {
      if (!requiredFieldSet.has(field)) {
        continue;
      }

      if (!REQUIRED_OPTIONAL_SOF_FIELD_SET.has(field)) {
        continue;
      }

      const typedField = field as (typeof REQUIRED_OPTIONAL_SOF_FIELDS)[number];
      const fieldValue = value[typedField];
      const isMissing = fieldValue === undefined || fieldValue === null;
      const isBlankString = typeof fieldValue === 'string' && fieldValue.trim() === '';

      if (!isMissing && !isBlankString) {
        continue;
      }

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [typedField],
        message: REQUIRED_OPTIONAL_SOF_FIELD_MESSAGES[typedField],
      });
    }
  });
}

export const BUSINESS_TYPE_OPTIONS = [
  'cooperative',
  'corporation',
  'llc',
  'partnership',
  'sole_prop',
  'trust',
  'other',
] as const;

export const BUSINESS_INDUSTRY_OPTIONS = [
  'technology',
  'finance',
  'healthcare',
  'retail',
  'manufacturing',
  'consulting',
  'real_estate',
  'education',
  'entertainment',
  'transportation',
  'other',
] as const;

export const EXPECTED_ANNUAL_REVENUE_OPTIONS = [
  '0_99999',
  '100000_999999',
  '1000000_9999999',
  '10000000_49999999',
  '50000000_249999999',
  '250000000_plus',
] as const;

export type BusinessType = (typeof BUSINESS_TYPE_OPTIONS)[number];
export type BusinessIndustry = (typeof BUSINESS_INDUSTRY_OPTIONS)[number];
export type ExpectedAnnualRevenue = (typeof EXPECTED_ANNUAL_REVENUE_OPTIONS)[number];

const businessPastDate = isoDate.refine((value) => {
  const date = new Date(`${value}T00:00:00Z`);
  const fiftyYearsAgo = new Date();
  fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 50);
  return !Number.isNaN(date.getTime()) && date.getTime() < Date.now() && date.getTime() > fiftyYearsAgo.getTime();
}, 'must be a valid incorporation date within the last 50 years');

export const businessBasicSchema = z.object({
  business_legal_name: z.string().min(1, 'Business legal name is required'),
  business_type: z.enum(BUSINESS_TYPE_OPTIONS),
  business_industry: z.enum(BUSINESS_INDUSTRY_OPTIONS, {
    errorMap: () => ({ message: 'Industry is required' }),
  }),
  incorporation_date: businessPastDate,
  business_description: z.string().min(1, 'Business description is required'),
  is_dao: z.boolean().default(false),
  primary_website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  website_absence_reason: z.string().max(255).optional().or(z.literal('')),
  // Asked explicitly (NF-3): Mesta rejects the tax id as the registration number.
  registration_number: z.string().trim().min(1, 'Registration number is required').max(100),
  number_of_employees: z.enum(EMPLOYEE_RANGE_OPTIONS).optional(),
  is_financial_institution: z.boolean().default(false),
  tax_id: z.string().min(1, 'Tax ID is required'),
  tax_id_type: z.string().min(1, 'Tax ID type is required'),
  tax_id_issuing_country: iso3,
});

export const businessAddressSchema = z.object({
  registered_address_line_1: z.string().min(1, 'Registered address is required'),
  registered_address_city: z.string().min(1, 'City is required'),
  registered_address_state: z.string().min(1, 'State / Province is required'),
  registered_address_postal_code: z.string().min(1, 'Postal code is required'),
  registered_address_country: iso3,
  physical_address_line_1: z.string().min(1, 'Physical address is required'),
  physical_address_city: z.string().min(1, 'City is required'),
  physical_address_state: z.string().min(1, 'State / Province is required'),
  physical_address_postal_code: z.string().min(1, 'Postal code is required'),
  physical_address_country: iso3,
});

const uboDocumentObject = documentObject.superRefine(refineDocument);

export const uboSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Must be a valid email'),
  birth_date: pastDate,
  nationality: iso3,
  nationalities: z.array(iso3).optional(),
  place_of_birth_country: optionalIso3,
  place_of_birth_city: z.string().optional(),
  residential_address_line_1: z.string().min(1, 'Street address is required'),
  residential_address_city: z.string().min(1, 'City is required'),
  residential_address_subdivision: z.string().min(1, 'State / Province is required'),
  residential_address_postal_code: z.string().min(1, 'Postal code is required'),
  residential_address_country: iso3,
  identifying_document: uboDocumentObject,
  has_ownership: z.boolean().default(false),
  has_control: z.boolean().default(false),
  is_signer: z.boolean().default(false),
  is_director: z.boolean().default(false),
  title: z.string().optional(),
  ownership_percentage: z.number().min(0).max(100).optional(),
  attested_ownership_structure_at: z.string().optional(),
}).superRefine(refineNotNewYork('residential_address_country', 'residential_address_subdivision'));

export const HIGH_RISK_ACTIVITIES_OPTIONS = [
  'none_of_the_above',
  'adult_entertainment',
  'gambling',
  'hold_client_funds',
  'investment_services',
  'lending_banking',
  'marijuana_or_related_services',
  'money_services',
  'nicotine_tobacco_or_related_services',
  'operate_foreign_exchange_virtual_currencies_brokerage_otc',
  'pharmaceuticals',
  'precious_metals_precious_stones_jewelry',
  'safe_deposit_box_rentals',
  'third_party_payment_processing',
  'weapons_firearms_and_explosives',
] as const;

export type HighRiskActivity = (typeof HIGH_RISK_ACTIVITIES_OPTIONS)[number];

export const businessComplianceSchema = z.object({
  source_of_funds: z.enum(BUSINESS_SOURCE_OF_FUNDS_OPTIONS),
  account_purpose: z.enum(BUSINESS_ACCOUNT_PURPOSE_OPTIONS),
  account_purpose_other: z.string().optional(),
  estimated_annual_revenue_usd: z.enum(EXPECTED_ANNUAL_REVENUE_OPTIONS),
  expected_monthly_payments_usd: z.enum(EXPECTED_MONTHLY_PAYMENTS_OPTIONS).optional(),
  source_of_funds_description: z.string().min(1, 'Source of funds description is required'),
  conducts_money_services: z.boolean().default(false),
  conducts_money_services_using_bridge: z.boolean().default(false),
  conducts_money_services_description: z.string(),
  high_risk_activities: z.array(z.enum(HIGH_RISK_ACTIVITIES_OPTIONS)).default(['none_of_the_above']),
  high_risk_activities_explanation: z.string().optional(),
  operates_in_prohibited_countries: z.boolean().default(false),
  // Optional in the form; only required when the business conducts money services.
  compliance_screening_explanation: z.string().optional(),
});

export const businessDocumentsSchema = z.object({
  proof_of_address_document: z.string().optional(),
  business_formation_document: z.string().optional(),
});

/** Identifier compared without separators or case (`12-3456789` = `123456789`). */
function normalizeIdentifier(value: string | undefined): string {
  return (value ?? '').replace(/[^0-9a-z]/gi, '').toUpperCase();
}

export const businessSchema = businessBasicSchema
  .merge(businessAddressSchema)
  .merge(businessComplianceSchema)
  .merge(businessDocumentsSchema)
  .merge(z.object({
    ubos: z.array(uboSchema).min(1, 'At least one UBO is required'),
  }))
  .superRefine((data, ctx) => {
    if (data.conducts_money_services && !data.conducts_money_services_description?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['conducts_money_services_description'],
        message: 'A description is required when money services is enabled',
      });
    }
    if (data.conducts_money_services && !data.compliance_screening_explanation?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['compliance_screening_explanation'],
        message: 'Compliance screening explanation is required',
      });
    }
    if (!data.primary_website?.trim() && !data.website_absence_reason?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['website_absence_reason'],
        message: 'Website or a reason for not having one is required',
      });
    }
    if (
      data.registration_number &&
      normalizeIdentifier(data.registration_number) === normalizeIdentifier(data.tax_id)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['registration_number'],
        message: 'Registration number must differ from the tax ID',
      });
    }
    if (!data.number_of_employees) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['number_of_employees'],
        message: 'Number of employees is required',
      });
    }
    if (data.account_purpose === 'other' && !data.account_purpose_other?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['account_purpose_other'],
        message: 'A description is required when account purpose is "other"',
      });
    }
  })
  .superRefine(refineNotNewYork('physical_address_country', 'physical_address_state'));

export type BusinessBasicValues = z.infer<typeof businessBasicSchema>;
export type BusinessAddressValues = z.infer<typeof businessAddressSchema>;
export type BusinessComplianceValues = z.infer<typeof businessComplianceSchema>;
export type UboValues = z.infer<typeof uboSchema>;
export type BusinessValues = z.infer<typeof businessSchema>;
export type PersonalValues = z.infer<typeof personalSchema>;
export type AddressValues = z.infer<typeof addressSchema>;
export type VerifyIdentityValues = z.infer<typeof verifyIdentitySchema>;
