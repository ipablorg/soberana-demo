/**
 * Per-rail beneficiary fields: client-side validation (Zod) and payload
 * building. Pure logic, no React and no i18n.
 *
 * The rules mirror what the back enforces (`create-beneficiary.dto.ts` and the
 * provider requirements of Mesta/KiraFin) so the user hears about a bad routing
 * number before the round trip. Validation errors are stable CODES, not
 * sentences; the field components translate them with Lingui.
 */

import { z } from 'zod';

import { COLOMBIA_BANKS } from '@/shared/constants/colombia-banks';
import type { CreateBeneficiaryPayload } from '@/shared/lib/beneficiaries-api';

import type { CreateBeneficiaryFieldRequirements } from '@/shared/hooks/use-beneficiaries';

import { toIso3, type RailFamily } from './rail-catalogue';

export type RailErrorCode =
  | 'required'
  | 'routing_number'
  | 'account_number'
  | 'state'
  | 'postal_code'
  | 'bic'
  | 'iban'
  | 'iban_or_account'
  | 'clabe'
  | 'sort_code'
  | 'bank_code';

/** Every input of every family lives in one flat string record. */
export interface RailFormValues {
  beneficiary_name: string;
  tax_id: string;
  holder_type: string;
  relationship: string;
  alias: string;
  bank_name: string;
  bank_address: string;
  routing_number: string;
  account_number_us: string;
  account_type: string;
  address_line_1: string;
  city: string;
  state: string;
  postal_code: string;
  bic: string;
  iban: string;
  account_number: string;
  bank_code: string;
  tax_id_type: string;
  clabe: string;
  pix_key: string;
  sort_code: string;
}

export const EMPTY_RAIL_VALUES: RailFormValues = {
  beneficiary_name: '',
  tax_id: '',
  holder_type: 'INDIVIDUAL',
  relationship: 'SELF',
  alias: '',
  bank_name: '',
  bank_address: '',
  routing_number: '',
  account_number_us: '',
  account_type: '',
  address_line_1: '',
  city: '',
  state: '',
  postal_code: '',
  bic: '',
  iban: '',
  account_number: '',
  bank_code: '',
  tax_id_type: '',
  clabe: '',
  pix_key: '',
  sort_code: '',
};

export type RailFieldName = keyof RailFormValues;

/** Fields every family shows, in this order, before the rail-specific block. */
export const COMMON_FIELDS: readonly RailFieldName[] = ['beneficiary_name', 'holder_type', 'tax_id'];

/** Rail-specific fields per family (what the user fills after the common block). */
export const FAMILY_FIELDS: Record<RailFamily, readonly RailFieldName[]> = {
  'us-bank': [
    'routing_number', 'account_number_us', 'account_type', 'address_line_1', 'city', 'state',
    'postal_code', 'bank_name', 'bank_address',
  ],
  swift: ['bic', 'iban', 'account_number', 'bank_name', 'bank_address'],
  'co-ach': ['bank_code', 'account_type', 'account_number', 'tax_id_type'],
  spei: ['clabe'],
  pix: ['pix_key'],
  sepa: ['iban', 'bic'],
  uk: ['sort_code', 'account_number'],
};

/**
 * Beneficiary address block, shown for every rail (the country comes from the
 * country picker). US ACH/Wire renders and validates it inside its own field
 * set; the other families get the shared block.
 */
export const ADDRESS_FIELDS: readonly RailFieldName[] = ['address_line_1', 'city', 'state', 'postal_code'];

/** Required when the back's requirements are unavailable or the provider is Mesta. */
export const DEFAULT_ADDRESS_REQUIRED: readonly RailFieldName[] = ['address_line_1', 'city', 'postal_code'];

export function hasSharedAddressBlock(family: RailFamily): boolean {
  return family !== 'us-bank';
}

/** The requirements rail code the back uses for a catalogue rail. */
const REQUIREMENTS_RAIL_ALIAS: Record<string, string> = { ach: 'ach_wire' };

export interface AddressRequirementsParams {
  requirements: CreateBeneficiaryFieldRequirements | null | undefined;
  railCode: string;
  /** The rail is served by Mesta, which asks for the address on every rail. */
  mestaServed: boolean;
}

/**
 * Address fields the user must fill. Driven by `beneficiaries_createFieldRequirements`
 * when the back answered; Mesta-served rails always add the default trio because
 * the provider (not that list) is what rejects a missing address. Without
 * requirements the default trio is required.
 */
export function addressRequirements({
  requirements,
  railCode,
  mestaServed,
}: AddressRequirementsParams): ReadonlySet<RailFieldName> {
  if (!requirements) return new Set(DEFAULT_ADDRESS_REQUIRED);

  const code = REQUIREMENTS_RAIL_ALIAS[railCode] ?? railCode;
  const entry = requirements.rails.find((candidate) => candidate.rail === railCode || candidate.rail === code);
  const required = new Set<RailFieldName>(
    ADDRESS_FIELDS.filter((field) => entry?.required.includes(field) || requirements.base_required.includes(field)),
  );
  if (mestaServed) DEFAULT_ADDRESS_REQUIRED.forEach((field) => required.add(field));
  return required;
}

const isDigits = (value: string, min: number, max = min) =>
  new RegExp(`^\\d{${min},${max}}$`).test(value);
const stripSpaces = (value: string) => value.replace(/\s+/g, '');
const IBAN_PATTERN = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/;
const BIC_PATTERN = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

type Check = (value: string) => RailErrorCode | null;

/** Required text with an optional format check on its trimmed value. */
const required = (check?: Check) =>
  z.string().superRefine((raw, ctx) => {
    const value = raw.trim();
    if (!value) {
      ctx.addIssue({ code: 'custom', message: 'required' satisfies RailErrorCode });
      return;
    }
    const failure = check?.(value);
    if (failure) ctx.addIssue({ code: 'custom', message: failure });
  });

/** Optional text: empty passes, a filled value must still satisfy the check. */
const optional = (check: Check) =>
  z.string().superRefine((raw, ctx) => {
    const value = raw.trim();
    if (!value) return;
    const failure = check(value);
    if (failure) ctx.addIssue({ code: 'custom', message: failure });
  });

const checkIban: Check = (v) => (IBAN_PATTERN.test(stripSpaces(v).toUpperCase()) ? null : 'iban');
const checkBic: Check = (v) => (BIC_PATTERN.test(v.toUpperCase()) ? null : 'bic');
const checkAccount =
  (min: number, max: number): Check =>
  (v) =>
    isDigits(stripSpaces(v), min, max) ? null : 'account_number';

const base = {
  beneficiary_name: required((v) => (v.length >= 2 ? null : 'required')),
  tax_id: required(),
};

const FAMILY_SCHEMAS: Record<RailFamily, z.ZodTypeAny> = {
  'us-bank': z.object({
    ...base,
    routing_number: required((v) => (isDigits(v, 9) ? null : 'routing_number')),
    account_number_us: required(checkAccount(4, 17)),
    account_type: required((v) => (v === 'checking' || v === 'savings' ? null : 'required')),
    address_line_1: required(),
    city: required(),
    state: required((v) => (/^[A-Za-z]{2}$/.test(v) ? null : 'state')),
    postal_code: required((v) => (/^\d{5}(-\d{4})?$/.test(v) ? null : 'postal_code')),
  }),
  swift: z
    .object({
      ...base,
      bic: required(checkBic),
      iban: optional(checkIban),
      account_number: optional((v) => (/^[A-Za-z0-9-]{4,34}$/.test(stripSpaces(v)) ? null : 'account_number')),
    })
    .superRefine((value, ctx) => {
      if (!value.iban.trim() && !value.account_number.trim()) {
        ctx.addIssue({ code: 'custom', path: ['iban'], message: 'iban_or_account' satisfies RailErrorCode });
      }
    }),
  'co-ach': z.object({
    ...base,
    bank_code: required((v) => (COLOMBIA_BANKS.some((b) => b.code === v) ? null : 'bank_code')),
    account_type: required((v) => (v === 'checking' || v === 'savings' ? null : 'required')),
    account_number: required(checkAccount(4, 20)),
    tax_id_type: required(),
  }),
  spei: z.object({ ...base, clabe: required((v) => (isDigits(stripSpaces(v), 18) ? null : 'clabe')) }),
  pix: z.object({ ...base, pix_key: required() }),
  sepa: z.object({ ...base, iban: required(checkIban), bic: optional(checkBic) }),
  uk: z.object({
    ...base,
    sort_code: required((v) => (isDigits(v.replace(/-/g, ''), 6) ? null : 'sort_code')),
    account_number: required((v) => (isDigits(v, 8) ? null : 'account_number')),
  }),
};

/** Returns `{ field: code }` for the first problem of each invalid field. */
export function validateRailForm(
  family: RailFamily,
  values: RailFormValues,
  addressRequired: ReadonlySet<RailFieldName> = new Set(),
): Partial<Record<RailFieldName, RailErrorCode>> {
  const errors: Partial<Record<RailFieldName, RailErrorCode>> = {};
  const result = FAMILY_SCHEMAS[family].safeParse(values);
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as RailFieldName | undefined;
      if (field && !errors[field]) errors[field] = issue.message as RailErrorCode;
    }
  }

  if (hasSharedAddressBlock(family)) {
    for (const field of ADDRESS_FIELDS) {
      if (addressRequired.has(field) && !values[field].trim() && !errors[field]) errors[field] = 'required';
    }
  }
  return errors;
}

export type RailBeneficiaryPayload = CreateBeneficiaryPayload & { bank_address?: string };

export interface BuildRailPayloadParams {
  customerId: string;
  /** Catalogue country, ISO 3166-1 alpha-2. */
  country: string;
  rail: { code: string; currency: string };
  family: RailFamily;
  values: RailFormValues;
}

const clean = (value: string) => value.trim();

export function buildRailPayload({
  customerId,
  country,
  rail,
  family,
  values,
}: BuildRailPayloadParams): RailBeneficiaryPayload {
  const iso3 = toIso3(country);
  if (!iso3) {
    throw new Error(`Unsupported country for beneficiaries: ${country}`);
  }

  const payload: RailBeneficiaryPayload = {
    customer_id: customerId,
    type: family === 'pix' ? 'PIX' : 'BANK_ACCOUNT',
    country: iso3,
    payment_rail: rail.code,
    currency: rail.currency,
    beneficiary_name: clean(values.beneficiary_name),
    tax_id: clean(values.tax_id),
    holder_type: values.holder_type === 'BUSINESS' ? 'BUSINESS' : 'INDIVIDUAL',
    relationship: clean(values.relationship) || 'SELF',
  };

  const set = <K extends keyof RailBeneficiaryPayload>(key: K, value: RailBeneficiaryPayload[K] | undefined) => {
    if (value !== undefined && value !== '') payload[key] = value;
  };
  const optionalText = (value: string) => clean(value) || undefined;

  set('alias', optionalText(values.alias));
  set('bank_name', optionalText(values.bank_name));

  if (hasSharedAddressBlock(family)) {
    set('address_line_1', optionalText(values.address_line_1));
    set('city', optionalText(values.city));
    set('state', optionalText(values.state)?.toUpperCase());
    set('postal_code', optionalText(values.postal_code));
  }

  switch (family) {
    case 'us-bank':
      set('routing_number', clean(values.routing_number));
      set('account_number_us', clean(values.account_number_us));
      set('account_type', values.account_type === 'savings' ? 'savings' : 'checking');
      set('address_line_1', clean(values.address_line_1));
      set('city', clean(values.city));
      set('state', clean(values.state).toUpperCase());
      set('postal_code', clean(values.postal_code));
      set('bank_address', optionalText(values.bank_address));
      break;
    case 'swift': {
      set('bic', clean(values.bic).toUpperCase());
      const iban = stripSpaces(values.iban).toUpperCase();
      if (iban) set('iban', iban);
      else set('account_number', clean(values.account_number));
      set('bank_address', optionalText(values.bank_address));
      break;
    }
    case 'co-ach': {
      const bankCode = clean(values.bank_code);
      set('bank_code', bankCode);
      set('bank_name', COLOMBIA_BANKS.find((b) => b.code === bankCode)?.name);
      set('account_number', stripSpaces(values.account_number));
      set('account_type', values.account_type === 'savings' ? 'savings' : 'checking');
      set('tax_id_type', clean(values.tax_id_type));
      break;
    }
    case 'spei':
      set('clabe', stripSpaces(values.clabe));
      break;
    case 'pix':
      set('pix_key', clean(values.pix_key));
      break;
    case 'sepa':
      set('iban', stripSpaces(values.iban).toUpperCase());
      set('bic', optionalText(values.bic)?.toUpperCase());
      break;
    case 'uk':
      set('sort_code', clean(values.sort_code).replace(/-/g, ''));
      set('account_number', clean(values.account_number));
      break;
  }

  return payload;
}

/**
 * Names the back may report as missing (`BENEFICIARY_PROVIDER_FIELDS_MISSING`)
 * -> the form field to highlight. Unknown names are dropped.
 */
export function mapMissingFields(family: RailFamily, backFields: readonly string[]): RailFieldName[] {
  const known = new Set(Object.keys(EMPTY_RAIL_VALUES));
  const out: RailFieldName[] = [];
  for (const name of backFields) {
    const mapped = family === 'us-bank' && name === 'account_number' ? 'account_number_us' : name;
    if (known.has(mapped) && !out.includes(mapped as RailFieldName)) out.push(mapped as RailFieldName);
  }
  return out;
}
