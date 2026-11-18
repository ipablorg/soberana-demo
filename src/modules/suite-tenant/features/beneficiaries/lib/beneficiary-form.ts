/**
 * Create-beneficiary form (`POST /v1/beneficiaries`, `CreateBeneficiaryDto`).
 *
 * The rail decides the beneficiary `type` and the account fields (REST_API.md
 * 8.5, back `CREATE_BENEFICIARY_FIELD_REQUIREMENTS`): USA ACH / wire
 * (`ach_wire`, `ach`, `wire`) `routing_number` + `account_number_us`; SWIFT
 * `bic` + `iban` or `account_number`; SEPA `iban`; MEX SPEI `clabe`; BRA PIX
 * `pix_key`; COL `co_ach` and ECU `ec_bank_transfer` bank code, account and
 * tax id type; GBR `sort_code` + `account_number`. The back requires `tax_id`
 * on every beneficiary except a Bre-B key. Mesta rails also need the holder
 * address, and US accounts a `state` code. The back stays the authority: these
 * checks only spare a round trip (`beneficiary-rail-contract.test.ts` pins
 * them against the DTO).
 */

import type {
  TenantAccountType,
  TenantBeneficiary,
  TenantBeneficiaryList,
  TenantBeneficiaryType,
  TenantCreateBeneficiaryInput,
  TenantHolderType,
  TenantRail,
  TenantUpdateBeneficiaryInput,
} from '@/graphql/types/tenant';

export type BeneficiaryAccountField =
  | 'routing_number'
  | 'account_number_us'
  | 'account_type'
  | 'iban'
  | 'bic'
  | 'account_number'
  | 'clabe'
  | 'pix_key'
  | 'sort_code'
  | 'bank_code'
  | 'breb_key'
  | 'tax_id_type'
  | 'tax_id'
  | 'bank_name'
  | 'bank_address';

export type BeneficiaryAddressField = 'address_line_1' | 'city' | 'state' | 'postal_code';

export type BeneficiaryFormField =
  | 'customer_id'
  | 'payment_rail'
  | 'country'
  | 'holder_type'
  | 'beneficiary_name'
  | 'relationship'
  | BeneficiaryAccountField
  | BeneficiaryAddressField
  | 'alias';

export type BeneficiaryFormValues = Record<BeneficiaryFormField, string> & { is_favorite: boolean };

export type BeneficiaryFormError = 'required' | 'clabe' | 'country' | 'iban_or_account';
export type BeneficiaryFormErrors = Partial<Record<BeneficiaryFormField, BeneficiaryFormError>>;

interface RailSpec {
  type: TenantBeneficiaryType;
  required: readonly BeneficiaryAccountField[];
  optional: readonly BeneficiaryAccountField[];
  /** Mesta registers the holder address on every rail it serves. */
  address: boolean;
}

const US_BANK: RailSpec = {
  type: 'BANK_ACCOUNT',
  required: ['routing_number', 'account_number_us', 'tax_id'],
  optional: ['account_type', 'bank_name', 'bank_address'],
  address: true,
};

const RAIL_SPECS: Readonly<Record<string, RailSpec>> = {
  ach: US_BANK,
  wire: US_BANK,
  ach_wire: US_BANK,
  swift: {
    type: 'BANK_ACCOUNT',
    required: ['bic', 'tax_id'],
    optional: ['iban', 'account_number', 'bank_name', 'bank_address'],
    address: true,
  },
  sepa: {
    type: 'BANK_ACCOUNT',
    required: ['iban', 'tax_id'],
    optional: ['bic', 'bank_name'],
    address: true,
  },
  spei: {
    type: 'BANK_ACCOUNT',
    required: ['clabe', 'tax_id'],
    optional: ['bank_name'],
    address: true,
  },
  pix: { type: 'PIX', required: ['pix_key', 'tax_id'], optional: [], address: true },
  co_ach: {
    type: 'BANK_ACCOUNT',
    required: ['bank_code', 'account_number', 'account_type', 'tax_id_type', 'tax_id'],
    optional: ['bank_name'],
    address: false,
  },
  ec_bank_transfer: {
    type: 'BANK_ACCOUNT',
    required: ['bank_code', 'account_number', 'tax_id_type', 'tax_id'],
    optional: ['account_type', 'bank_name'],
    address: false,
  },
  faster_payments: {
    type: 'BANK_ACCOUNT',
    required: ['sort_code', 'account_number', 'tax_id'],
    optional: ['bank_name'],
    address: true,
  },
  breb: {
    type: 'BREB_KEY',
    required: ['breb_key'],
    optional: ['tax_id_type', 'tax_id'],
    address: false,
  },
};

const GENERIC_SPEC: RailSpec = {
  type: 'BANK_ACCOUNT',
  required: ['account_number', 'tax_id'],
  optional: ['bank_code', 'bank_name', 'iban', 'bic', 'tax_id_type'],
  address: false,
};

export const HOLDER_TYPES: readonly TenantHolderType[] = ['INDIVIDUAL', 'BUSINESS'];
export const ACCOUNT_TYPES: readonly TenantAccountType[] = ['savings', 'checking'];
export const RELATIONSHIPS = [
  'SELF',
  'FAMILY',
  'FRIEND',
  'EMPLOYEE',
  'BUSINESS',
  'OTHER',
  'THIRD_PARTY',
] as const;

const ISO3 = /^[A-Z]{3}$/;
const CLABE = /^\d{18}$/;

export const EMPTY_BENEFICIARY_FORM: BeneficiaryFormValues = {
  customer_id: '',
  payment_rail: '',
  country: '',
  holder_type: 'INDIVIDUAL',
  beneficiary_name: '',
  relationship: '',
  routing_number: '',
  account_number_us: '',
  account_type: '',
  iban: '',
  bic: '',
  account_number: '',
  clabe: '',
  pix_key: '',
  sort_code: '',
  bank_code: '',
  breb_key: '',
  tax_id_type: '',
  tax_id: '',
  bank_name: '',
  bank_address: '',
  address_line_1: '',
  city: '',
  state: '',
  postal_code: '',
  alias: '',
  is_favorite: false,
};

/**
 * Account fields and type of a rail code (`us_ach` reads as `ach`, `co_breb`
 * as `breb`); unknown rails get a generic bank form.
 */
export function railSpecOf(code: string): RailSpec {
  const value = code.trim().toLowerCase();

  return RAIL_SPECS[value] ?? RAIL_SPECS[value.replace(/^[a-z]{2}_/, '')] ?? GENERIC_SPEC;
}

/** Rails a payout beneficiary can be created on: fiat rails with the off-ramp capability. */
export function payoutRails(rails: readonly TenantRail[]): TenantRail[] {
  return rails.filter(
    (rail) => rail.type !== 'crypto_rail' && rail.enabled_capabilities.includes('off_ramp')
  );
}

/** Countries (ISO alpha-3) a rail serves: the multi-country list, else its own country. */
export function railCountries(rail: TenantRail | undefined): string[] {
  if (!rail) return [];
  if (rail.available_countries && rail.available_countries.length > 0)
    return rail.available_countries;

  return rail.country ? [rail.country] : [];
}

/** Account fields shown for the chosen rail, required first. */
export function accountFieldsOf(rail: string): BeneficiaryAccountField[] {
  if (!rail) return [];
  const spec = railSpecOf(rail);

  return [...spec.required, ...spec.optional];
}

/** Address fields shown for the chosen rail (`state` only matters for US accounts but is always offered). */
export function addressFieldsOf(rail: string): BeneficiaryAddressField[] {
  return rail ? ['address_line_1', 'city', 'state', 'postal_code'] : [];
}

export function isRequiredField(
  field: BeneficiaryFormField,
  values: BeneficiaryFormValues
): boolean {
  if (['customer_id', 'payment_rail', 'country', 'holder_type', 'beneficiary_name'].includes(field))
    return true;
  if (!values.payment_rail) return false;
  const spec = railSpecOf(values.payment_rail);
  if ((spec.required as readonly string[]).includes(field)) return true;
  if (spec.address && ['address_line_1', 'city', 'postal_code'].includes(field)) return true;

  return spec.address && field === 'state' && values.country === 'USA';
}

export function validateBeneficiaryForm(values: BeneficiaryFormValues): BeneficiaryFormErrors {
  const errors: BeneficiaryFormErrors = {};
  const fields: BeneficiaryFormField[] = [
    'customer_id',
    'payment_rail',
    'country',
    'holder_type',
    'beneficiary_name',
    ...accountFieldsOf(values.payment_rail),
    ...addressFieldsOf(values.payment_rail),
  ];

  for (const field of fields) {
    if (isRequiredField(field, values) && !values[field].trim()) errors[field] = 'required';
  }

  if (!errors.country && !ISO3.test(values.country.trim().toUpperCase()))
    errors.country = 'country';
  if (!errors.clabe && values.clabe.trim() && !CLABE.test(values.clabe.trim()))
    errors.clabe = 'clabe';
  if (
    values.payment_rail &&
    railSpecOf(values.payment_rail) === RAIL_SPECS.swift &&
    !values.iban.trim() &&
    !values.account_number.trim()
  ) {
    errors.iban = 'iban_or_account';
  }

  return errors;
}

/** REST body: the rail's type, the visible non-empty fields (trimmed) and the favorite flag when set. */
export function toCreateBeneficiaryInput(
  values: BeneficiaryFormValues
): TenantCreateBeneficiaryInput {
  const spec = railSpecOf(values.payment_rail);
  const input: TenantCreateBeneficiaryInput = {
    customer_id: values.customer_id,
    payment_rail: values.payment_rail,
    type: spec.type,
    country: values.country.trim().toUpperCase(),
    beneficiary_name: values.beneficiary_name.trim(),
    holder_type: values.holder_type as TenantHolderType,
  };
  const optional: BeneficiaryFormField[] = [
    'relationship',
    ...accountFieldsOf(values.payment_rail),
    ...addressFieldsOf(values.payment_rail),
    'alias',
  ];
  const body = input as unknown as Record<string, unknown>;

  for (const field of optional) {
    const value = values[field].trim();
    if (value) body[field] = value;
  }
  if (values.is_favorite) input.is_favorite = true;

  return input;
}

export interface BeneficiaryEditValues {
  alias: string;
  beneficiary_name: string;
  is_favorite: boolean;
}

export function editValuesOf(beneficiary: TenantBeneficiary): BeneficiaryEditValues {
  return {
    alias: beneficiary.alias ?? '',
    beneficiary_name: beneficiary.beneficiary_name,
    is_favorite: beneficiary.is_favorite,
  };
}

/** `PATCH` body: the three editable fields, trimmed (an empty name is never sent). */
export function toUpdateBeneficiaryInput(
  values: BeneficiaryEditValues
): TenantUpdateBeneficiaryInput {
  const input: TenantUpdateBeneficiaryInput = {
    alias: values.alias.trim(),
    is_favorite: values.is_favorite,
  };
  const name = values.beneficiary_name.trim();
  if (name) input.beneficiary_name = name;

  return input;
}

/**
 * Beneficiaries of a `tenant_listBeneficiaries` answer. The back returns the
 * REST body, a bare array; a `{ data: [] }` wrapper is read too, and anything
 * else counts as no beneficiaries instead of crashing the screen.
 */
export function beneficiariesOf(
  list: readonly TenantBeneficiary[] | TenantBeneficiaryList | null | undefined
): TenantBeneficiary[] {
  if (Array.isArray(list)) return [...list];
  const wrapped = (list as TenantBeneficiaryList | null | undefined)?.data;

  return Array.isArray(wrapped) ? [...wrapped] : [];
}

/** `UNVERIFIED` is how the API marks a deactivated beneficiary. */
export function isDeactivated(
  beneficiary: Pick<TenantBeneficiary, 'verification_status'>
): boolean {
  return beneficiary.verification_status.toUpperCase() === 'UNVERIFIED';
}

/** Label of a beneficiary in pickers: alias or name, rail and review state. */
export function beneficiaryOptionLabel(beneficiary: TenantBeneficiary): string {
  const name = beneficiary.alias || beneficiary.beneficiary_name;
  const rail = beneficiary.rail_code ?? beneficiary.payment_rail ?? beneficiary.currency;

  return `${name} · ${rail} · ${beneficiary.review_status ?? beneficiary.verification_status}`;
}
