/**
 * Pure logic of the Mesta business profile (KYB) the commercial team completes
 * from the backoffice. Mirrors the backend `ClientOnboardingProfileInput`
 * (client.metadata.onboardingProfile). Only data the system does not already
 * hold is asked: name, email, tax id and country come from the client record.
 *
 * No React, no i18n: labels live in `mesta-labels.ts`.
 */

import type { OnboardingProfileInput } from '@/graphql/mutations/admin-commercial';

import type { SelectOption } from '../../platform-config/lib/catalog-options';

/** Profile fields Mesta requires, in display order (backend `MESTA_REQUIRED_PROFILE_FIELDS`). */
export const MESTA_PROFILE_FIELD_ORDER = [
  'phone',
  'addressStreet',
  'addressCity',
  'addressPostalCode',
  'registrationDate',
  'businessType',
  'isFinancialInstitution',
  'numberOfEmployees',
  'expectedMonthlyVolumeEstimate',
  'averageTransactionSize',
  'primaryCounterpartyJurisdictions',
  'natureOfPayments',
  'sourceOfFunds',
  'websiteAbsenceReason',
] as const;

export type MestaProfileFieldKey = (typeof MESTA_PROFILE_FIELD_ORDER)[number];

/** Values accepted by the backend / Mesta (same vocabulary as the DTO). */
export const MESTA_BUSINESS_TYPE_VALUES = [
  'sole_proprietorship',
  'partnership',
  'corporation',
  'limited_liability_company',
  'other',
] as const;
export const MESTA_EMPLOYEE_RANGE_VALUES = [
  '1',
  '2-10',
  '11-50',
  '51-200',
  '201-1000',
  '1000+',
] as const;
export const MESTA_SOURCE_OF_FUNDS_VALUES = [
  'business_income',
  'salary',
  'saving',
  'advance_from_director',
] as const;
export const MESTA_NATURE_OF_PAYMENTS_VALUES = [
  'payment_for_goods_and_services',
  'vendor_payment',
  'operational_expense',
  'administrative_expenses',
  'accounting_services',
  'legal_services',
  'subsidiary_transfer',
] as const;
/** ISO 3166-1 alpha-2 counterpart jurisdictions offered in the form. */
export const MESTA_JURISDICTION_CODES = [
  'US',
  'CO',
  'MX',
  'BR',
  'PE',
  'EC',
  'PA',
  'CL',
  'AR',
  'GB',
  'ES',
  'DE',
  'FR',
] as const;
export const MESTA_DIAL_CODES = [
  '+1',
  '+52',
  '+51',
  '+54',
  '+55',
  '+56',
  '+57',
  '+507',
  '+593',
  '+34',
  '+44',
  '+49',
  '+33',
  '+39',
  '+351',
  '+31',
] as const;

export type YesNo = 'yes' | 'no' | '';

export interface MestaProfileForm {
  dialCode: string;
  phoneNational: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressPostalCode: string;
  /** `YYYY-MM-DD` from a date input. */
  registrationDate: string;
  businessType: string;
  websiteUrl: string;
  websiteAbsenceReason: string;
  isFinancialInstitution: YesNo;
  numberOfEmployees: string;
  expectedMonthlyVolumeEstimate: string;
  averageTransactionSize: string;
  primaryCounterpartyJurisdictions: string[];
  natureOfPayments: string[];
  sourceOfFunds: string;
}

export const DEFAULT_DIAL_CODE = '+57';

export const EMPTY_MESTA_PROFILE_FORM: MestaProfileForm = {
  dialCode: DEFAULT_DIAL_CODE,
  phoneNational: '',
  addressStreet: '',
  addressCity: '',
  addressState: '',
  addressPostalCode: '',
  registrationDate: '',
  businessType: '',
  websiteUrl: '',
  websiteAbsenceReason: '',
  isFinancialInstitution: '',
  numberOfEmployees: '',
  expectedMonthlyVolumeEstimate: '',
  averageTransactionSize: '',
  primaryCounterpartyJurisdictions: [],
  natureOfPayments: [],
  sourceOfFunds: '',
};

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

function filled(value: string): boolean {
  return value.trim() !== '';
}

function positiveNumber(raw: string): number | null {
  if (!filled(raw)) return null;
  const value = Number(raw.trim());

  return Number.isFinite(value) && value > 0 ? value : null;
}

function phoneOf(form: MestaProfileForm): string | null {
  const digits = form.phoneNational.replace(/\D/g, '');
  if (digits.length < 6) return null;

  return `${form.dialCode}${digits}`;
}

const MISSING_CHECKS: Record<MestaProfileFieldKey, (f: MestaProfileForm) => boolean> = {
  phone: (f) => phoneOf(f) !== null,
  addressStreet: (f) => filled(f.addressStreet),
  addressCity: (f) => filled(f.addressCity),
  addressPostalCode: (f) => filled(f.addressPostalCode),
  registrationDate: (f) => ISO_DAY.test(f.registrationDate),
  businessType: (f) => filled(f.businessType),
  isFinancialInstitution: (f) => f.isFinancialInstitution !== '',
  numberOfEmployees: (f) => filled(f.numberOfEmployees),
  expectedMonthlyVolumeEstimate: (f) => positiveNumber(f.expectedMonthlyVolumeEstimate) !== null,
  averageTransactionSize: (f) => positiveNumber(f.averageTransactionSize) !== null,
  primaryCounterpartyJurisdictions: (f) => f.primaryCounterpartyJurisdictions.length > 0,
  natureOfPayments: (f) => f.natureOfPayments.length > 0,
  sourceOfFunds: (f) => filled(f.sourceOfFunds),
  // Mesta wants a reason only when the business has no website.
  websiteAbsenceReason: (f) => filled(f.websiteUrl) || filled(f.websiteAbsenceReason),
};

/** Fields still to fill, in display order. */
export function missingMestaFields(form: MestaProfileForm): MestaProfileFieldKey[] {
  return MESTA_PROFILE_FIELD_ORDER.filter((key) => !MISSING_CHECKS[key](form));
}

export function isMestaProfileComplete(form: MestaProfileForm): boolean {
  return missingMestaFields(form).length === 0;
}

/** Backend input with only the filled fields (stored values are never wiped). */
export function buildMestaProfileInput(form: MestaProfileForm): OnboardingProfileInput {
  const input: OnboardingProfileInput = {};
  const text = (value: string) => (filled(value) ? value.trim() : undefined);

  const phone = phoneOf(form);
  if (phone) input.phone = phone;
  const street = text(form.addressStreet);
  if (street) input.addressStreet = street;
  const city = text(form.addressCity);
  if (city) input.addressCity = city;
  const state = text(form.addressState);
  if (state) input.addressState = state;
  const postal = text(form.addressPostalCode);
  if (postal) input.addressPostalCode = postal;
  if (ISO_DAY.test(form.registrationDate)) input.registrationDate = form.registrationDate;
  const businessType = text(form.businessType);
  if (businessType) input.businessType = businessType;

  const website = text(form.websiteUrl);
  if (website) {
    input.websiteUrl = website;
  } else {
    const reason = text(form.websiteAbsenceReason);
    if (reason) input.websiteAbsenceReason = reason;
  }

  if (form.isFinancialInstitution !== '') {
    input.isFinancialInstitution = form.isFinancialInstitution === 'yes';
  }
  const employees = text(form.numberOfEmployees);
  if (employees) input.numberOfEmployees = employees;
  const volume = positiveNumber(form.expectedMonthlyVolumeEstimate);
  if (volume !== null) input.expectedMonthlyVolumeEstimate = volume;
  const average = positiveNumber(form.averageTransactionSize);
  if (average !== null) input.averageTransactionSize = average;
  if (form.primaryCounterpartyJurisdictions.length > 0) {
    input.primaryCounterpartyJurisdictions = [...form.primaryCounterpartyJurisdictions];
  }
  if (form.natureOfPayments.length > 0) input.natureOfPayments = [...form.natureOfPayments];
  const source = text(form.sourceOfFunds);
  if (source) input.sourceOfFunds = source;

  return input;
}

function splitPhone(phone: string): { dialCode: string; phoneNational: string } {
  const dial = [...MESTA_DIAL_CODES]
    .sort((a, b) => b.length - a.length)
    .find((code) => phone.startsWith(code));

  return dial
    ? { dialCode: dial, phoneNational: phone.slice(dial.length) }
    : { dialCode: '', phoneNational: phone };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function numText(value: unknown): string {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
}

/** Prefills the form from `client.metadata.onboardingProfile`. */
export function mestaFormFromMetadata(metadata: unknown): MestaProfileForm {
  const profile = asRecord(asRecord(metadata)['onboardingProfile']);
  const phone = str(profile['phone']);
  const flag = profile['isFinancialInstitution'];

  return {
    ...EMPTY_MESTA_PROFILE_FORM,
    ...(phone ? splitPhone(phone) : {}),
    addressStreet: str(profile['addressStreet']),
    addressCity: str(profile['addressCity']),
    addressState: str(profile['addressState']),
    addressPostalCode: str(profile['addressPostalCode']),
    registrationDate: str(profile['registrationDate']),
    businessType: str(profile['businessType']),
    websiteUrl: str(profile['websiteUrl']),
    websiteAbsenceReason: str(profile['websiteAbsenceReason']),
    isFinancialInstitution: typeof flag === 'boolean' ? (flag ? 'yes' : 'no') : '',
    numberOfEmployees: str(profile['numberOfEmployees']),
    expectedMonthlyVolumeEstimate: numText(profile['expectedMonthlyVolumeEstimate']),
    averageTransactionSize: numText(profile['averageTransactionSize']),
    primaryCounterpartyJurisdictions: strings(profile['primaryCounterpartyJurisdictions']),
    natureOfPayments: strings(profile['natureOfPayments']),
    sourceOfFunds: str(profile['sourceOfFunds']),
  };
}

/** Narrows backend missing-field names to the ones the form can fill. */
export function formFieldsFrom(missing: readonly string[] | undefined): MestaProfileFieldKey[] {
  const wanted = new Set(missing ?? []);

  return MESTA_PROFILE_FIELD_ORDER.filter((key) => wanted.has(key));
}

interface TaxIdTypeLike {
  id: string;
  name: string;
  countries: string[] | null;
}

/** The only tax id type used in the country, when there is exactly one (else null). */
export function defaultTaxIdTypeId(
  types: readonly TaxIdTypeLike[],
  countryIso3: string
): string | null {
  const country = countryIso3.trim().toUpperCase();
  const specific = types.filter((type) => type.countries?.includes(country));

  return specific.length === 1 ? (specific[0]?.id ?? null) : null;
}

/**
 * Tax id type options: value is the id the backend stores, label is the code
 * (NIT, EIN...). Types used in the selected country (ISO3) come first.
 */
export function taxIdTypeOptions(
  types: readonly TaxIdTypeLike[],
  countryIso3: string
): SelectOption[] {
  const country = countryIso3.trim().toUpperCase();
  const applies = (type: TaxIdTypeLike) =>
    country !== '' &&
    (type.countries === null || type.countries.length === 0 || type.countries.includes(country));
  const options = (list: readonly TaxIdTypeLike[]) =>
    list.map((type) => ({ value: type.id, label: type.name }));

  if (country === '') return options(types);

  return [...options(types.filter(applies)), ...options(types.filter((type) => !applies(type)))];
}
