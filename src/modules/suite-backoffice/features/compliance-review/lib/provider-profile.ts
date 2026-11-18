/**
 * Customer data a virtual-account provider (Mesta, KiraFin) reported missing,
 * as the backoffice completes it: which missing fields this form can fill,
 * the prefill from what the customer already has, and the mutation input.
 * The field names are the backend `missing_fields` names.
 */

import type {
  AdminOnboardingMissingField,
  CustomerProviderProfileInput,
} from '@/graphql/mutations/admin-loopay';

import { businessIndustryFromKyb } from './provider-industry-options';

/** Missing fields the backoffice can complete, in display order. */
export const PROVIDER_PROFILE_FIELD_ORDER = [
  'phone',
  'formationDate',
  'businessType',
  'businessIndustry',
  'website',
  'registrationNumber',
  'isFinancialInstitution',
  'numberOfEmployees',
  'registeredAddress',
  'representativeName',
] as const;

export type ProviderProfileFieldKey = (typeof PROVIDER_PROFILE_FIELD_ORDER)[number];

export interface ProviderProfileForm {
  phone: string;
  formationDate: string;
  businessType: string;
  businessIndustry: string;
  websiteUrl: string;
  websiteAbsenceReason: string;
  registrationNumber: string;
  isFinancialInstitution: '' | 'yes' | 'no';
  numberOfEmployees: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressPostalCode: string;
  addressCountry: string;
  representativeFirstName: string;
  representativeLastName: string;
}

/** What the backoffice already knows about the customer (KYC detail query). */
export interface CustomerProfileSource {
  customer?: {
    tax_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  } | null;
  kyc_data?: unknown;
  /**
   * Business data already kept for the providers (`provider_profile`, N-10):
   * registrationNumber, numberOfEmployees, isFinancialInstitution,
   * websiteAbsenceReason, representative names. It wins over the KYB form.
   */
  provider_profile?: unknown;
}

/** Mesta business types; KYB values that differ are mapped, others dropped. */
const BUSINESS_TYPES = [
  'sole_proprietorship',
  'partnership',
  'corporation',
  'limited_liability_company',
  'other',
];
const KYB_BUSINESS_TYPES: Readonly<Record<string, string>> = {
  llc: 'limited_liability_company',
  sole_prop: 'sole_proprietorship',
};

const PHONE_PATTERN = /^\+[1-9]\d{6,14}$/;

export function emptyProviderProfileForm(): ProviderProfileForm {
  return {
    phone: '',
    formationDate: '',
    businessType: '',
    businessIndustry: '',
    websiteUrl: '',
    websiteAbsenceReason: '',
    registrationNumber: '',
    isFinancialInstitution: '',
    numberOfEmployees: '',
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressPostalCode: '',
    addressCountry: '',
    representativeFirstName: '',
    representativeLastName: '',
  };
}

type MissingDetails = readonly Pick<AdminOnboardingMissingField, 'key' | 'kind'>[] | undefined;

/** Keys the backend marked PROFILE_FIELD; without details, every key may be one. */
function profileKeys(missing: readonly string[], details: MissingDetails): readonly string[] {
  if (!details || details.length === 0) return missing;
  return details.filter((detail) => detail.kind === 'PROFILE_FIELD').map((detail) => detail.key);
}

/** The missing fields this form completes, in display order. */
export function editableProviderFields(
  missing: readonly string[],
  details?: MissingDetails,
): ProviderProfileFieldKey[] {
  const asked = profileKeys(missing, details);
  return PROVIDER_PROFILE_FIELD_ORDER.filter((field) => asked.includes(field));
}

/**
 * Missing data the form cannot complete: the OPS_CHECKLIST items operations
 * resolves with the provider (documents, persons, SSN, ...), or, without
 * details, every key that is not a profile field.
 */
export function otherMissingFields(missing: readonly string[], details?: MissingDetails): string[] {
  const editable = editableProviderFields(missing, details) as readonly string[];
  return missing.filter((field) => !editable.includes(field));
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

interface PersonName {
  first: string;
  last: string;
}

/** A person's name, never the business name stored as a name. */
function personName(first: unknown, last: unknown, businessName: string): PersonName | null {
  const name = { first: text(first), last: text(last) };
  if (!name.first || !name.last) return null;
  if (name.first === businessName || name.last === businessName) return null;
  return name;
}

function representativeFrom(source: CustomerProfileSource, kyc: Record<string, unknown>) {
  const businessName = text(kyc.businessLegalName);
  const persons = Array.isArray(kyc.associatedPersonsMetadata)
    ? kyc.associatedPersonsMetadata.map(record)
    : [];
  const ordered = [
    ...persons.filter((person) => person.isSigner === true),
    ...persons.filter((person) => person.isSigner !== true),
  ];

  for (const person of ordered) {
    const name = personName(person.firstName, person.lastName, businessName);
    if (name) return name;
  }

  return personName(source.customer?.first_name, source.customer?.last_name, businessName);
}

function businessTypeFrom(raw: string): string {
  const mapped = KYB_BUSINESS_TYPES[raw] ?? raw;
  return BUSINESS_TYPES.includes(mapped) ? mapped : '';
}

/**
 * Prefills the form with what the platform already has: the KYB phone, dates,
 * website and registered address, and the signer (or the customer's own name)
 * as representative. The registration number is asked, never the tax id.
 */
export function providerProfileFormFrom(
  source: CustomerProfileSource | null | undefined,
): ProviderProfileForm {
  const form = emptyProviderProfileForm();
  if (!source) return form;

  const kyc = record(source.kyc_data);
  const stored = record(source.provider_profile);
  const address = record(kyc.registeredAddress);
  const representative = representativeFrom(source, kyc);
  const storedFinancial = stored.isFinancialInstitution;

  return {
    ...form,
    phone: text(kyc.phone),
    formationDate: text(kyc.incorporationDate).slice(0, 10),
    businessType: businessTypeFrom(text(kyc.businessType)),
    businessIndustry: businessIndustryFromKyb(
      text(Array.isArray(kyc.businessIndustry) ? kyc.businessIndustry[0] : kyc.businessIndustry),
    ),
    websiteUrl: text(kyc.primaryWebsite),
    websiteAbsenceReason: text(stored.websiteAbsenceReason),
    // Never the tax id (NF-3): Mesta rejects it as `identificationNumber` and
    // the backend reports an equal value as still missing.
    registrationNumber: text(stored.registrationNumber) || text(kyc.registrationNumber),
    isFinancialInstitution:
      typeof storedFinancial === 'boolean' ? (storedFinancial ? 'yes' : 'no') : '',
    numberOfEmployees: text(stored.numberOfEmployees),
    addressStreet: text(address.street),
    addressCity: text(address.city),
    addressState: text(address.state),
    addressPostalCode: text(address.postalCode),
    addressCountry: text(address.country),
    representativeFirstName: text(stored.representativeFirstName) || (representative?.first ?? ''),
    representativeLastName: text(stored.representativeLastName) || (representative?.last ?? ''),
  };
}

function isComplete(form: ProviderProfileForm, field: ProviderProfileFieldKey): boolean {
  switch (field) {
    case 'phone':
      return PHONE_PATTERN.test(form.phone.trim());
    case 'website':
      return form.websiteUrl.trim() !== '' || form.websiteAbsenceReason.trim() !== '';
    case 'isFinancialInstitution':
      return form.isFinancialInstitution !== '';
    case 'registeredAddress':
      return form.addressStreet.trim() !== '' && form.addressCity.trim() !== '';
    case 'representativeName':
      return form.representativeFirstName.trim() !== '' && form.representativeLastName.trim() !== '';
    default:
      return form[field].trim() !== '';
  }
}

/** Asked fields that are still empty or invalid. */
export function incompleteProviderFields(
  form: ProviderProfileForm,
  fields: readonly ProviderProfileFieldKey[],
): ProviderProfileFieldKey[] {
  return fields.filter((field) => !isComplete(form, field));
}

function optional(value: string): string | undefined {
  return value.trim() || undefined;
}

function inputFor(form: ProviderProfileForm, field: ProviderProfileFieldKey): CustomerProviderProfileInput {
  switch (field) {
    case 'website':
      return form.websiteUrl.trim()
        ? { websiteUrl: form.websiteUrl.trim() }
        : { websiteAbsenceReason: form.websiteAbsenceReason.trim() };
    case 'isFinancialInstitution':
      return { isFinancialInstitution: form.isFinancialInstitution === 'yes' };
    case 'registeredAddress':
      return {
        addressStreet: optional(form.addressStreet),
        addressCity: optional(form.addressCity),
        addressState: optional(form.addressState),
        addressPostalCode: optional(form.addressPostalCode),
        addressCountry: optional(form.addressCountry),
      };
    case 'representativeName':
      return {
        representativeFirstName: form.representativeFirstName.trim(),
        representativeLastName: form.representativeLastName.trim(),
      };
    default:
      return { [field]: form[field].trim() };
  }
}

/** The mutation input with only the asked fields (the rest keeps its value). */
export function buildProviderProfileInput(
  form: ProviderProfileForm,
  fields: readonly ProviderProfileFieldKey[],
): CustomerProviderProfileInput {
  const input = Object.assign({}, ...fields.map((field) => inputFor(form, field))) as Record<
    string,
    unknown
  >;

  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as CustomerProviderProfileInput;
}
