/**
 * Pure form helpers for the platform catalog tabs (providers, payment rails).
 *
 * Kept free of React and Lingui so validation and input building are unit
 * testable. Input field names are copied from the backend DTOs in
 * `src/modules/admin-loopay/catalog/dto/*.input.ts`.
 */

import type {
  AdminCreatePaymentRailInput,
  AdminCreateProviderInput,
  AdminJsonObject,
  AdminPaymentRail,
  AdminProvider,
  AdminProviderType,
  AdminRailDirection,
  AdminUpdatePaymentRailInput,
  AdminUpdateProviderInput,
} from '@/graphql/types/admin-loopay';

export const PROVIDER_TYPES: readonly AdminProviderType[] = [
  'KYC',
  'WALLET',
  'FIAT_RAILS',
  'FULL_SERVICE',
];

export const RAIL_DIRECTIONS: readonly AdminRailDirection[] = ['INBOUND', 'OUTBOUND', 'BOTH'];

/* JSON config ------------------------------------------------------------- */

export type JsonConfigParseResult =
  { ok: true; value: AdminJsonObject | undefined } | { ok: false };

/** True for a non-null, non-array object (a JSON object). */
export function isPlainObject(value: unknown): value is AdminJsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Parses the config textarea. Blank means "no config"; anything else must be
 * a JSON object (the backend stores provider config as an object).
 */
export function parseJsonConfig(text: string): JsonConfigParseResult {
  if (text.trim().length === 0) return { ok: true, value: undefined };

  try {
    const parsed: unknown = JSON.parse(text);
    return isPlainObject(parsed) ? { ok: true, value: parsed } : { ok: false };
  } catch {
    return { ok: false };
  }
}

/** Pretty-prints a stored `GraphQLJSON` config for editing. */
export function formatJsonConfig(value: unknown): string {
  if (value === null || value === undefined) return '';
  return JSON.stringify(value, null, 2);
}

/* Providers --------------------------------------------------------------- */

export interface ProviderFormState {
  /** Set when editing an existing provider. */
  id: string | null;
  code: string;
  name: string;
  type: AdminProviderType;
  isActive: boolean;
  configText: string;
}

export const EMPTY_PROVIDER_FORM: ProviderFormState = {
  id: null,
  code: '',
  name: '',
  type: 'WALLET',
  isActive: true,
  configText: '',
};

export function providerToForm(provider: AdminProvider): ProviderFormState {
  return {
    id: provider.id,
    code: provider.code,
    name: provider.name,
    type: (PROVIDER_TYPES as readonly string[]).includes(provider.type)
      ? (provider.type as AdminProviderType)
      : 'WALLET',
    isActive: provider.is_active,
    configText: formatJsonConfig(provider.config),
  };
}

export interface ProviderFormErrors {
  code: boolean;
  name: boolean;
  config: boolean;
}

export function validateProviderForm(form: ProviderFormState): ProviderFormErrors {
  return {
    code: form.id === null && form.code.trim().length === 0,
    name: form.name.trim().length === 0,
    config: !parseJsonConfig(form.configText).ok,
  };
}

export function hasFormErrors(errors: object): boolean {
  return Object.values(errors).some(Boolean);
}

/** Only call after `validateProviderForm` reported no errors. */
export function buildCreateProviderInput(form: ProviderFormState): AdminCreateProviderInput {
  const config = parseJsonConfig(form.configText);

  return {
    code: form.code.trim(),
    name: form.name.trim(),
    type: form.type,
    isActive: form.isActive,
    ...(config.ok && config.value ? { config: config.value } : {}),
  };
}

/**
 * The provider code is immutable on the backend, so it is never sent. #411:
 * the catalogue is read-only, so an edit never sends the type or the active
 * flag either (no provider is (de)activated or retyped here): name and config only.
 */
export function buildUpdateProviderInput(form: ProviderFormState): AdminUpdateProviderInput {
  const config = parseJsonConfig(form.configText);

  return {
    name: form.name.trim(),
    ...(config.ok && config.value ? { config: config.value } : {}),
  };
}

/* Payment rails ----------------------------------------------------------- */

export interface PaymentRailFormState {
  id: string | null;
  code: string;
  name: string;
  currency: string;
  country: string;
  direction: AdminRailDirection;
  isActive: boolean;
}

export const EMPTY_PAYMENT_RAIL_FORM: PaymentRailFormState = {
  id: null,
  code: '',
  name: '',
  currency: '',
  country: '',
  direction: 'BOTH',
  isActive: true,
};

export function paymentRailToForm(rail: AdminPaymentRail): PaymentRailFormState {
  return {
    id: rail.id,
    code: rail.code,
    name: rail.name,
    currency: rail.currency,
    country: rail.country,
    direction: (RAIL_DIRECTIONS as readonly string[]).includes(rail.direction)
      ? (rail.direction as AdminRailDirection)
      : 'BOTH',
    isActive: rail.is_active,
  };
}

export interface PaymentRailFormErrors {
  code: boolean;
  name: boolean;
  currency: boolean;
  country: boolean;
}

export function validatePaymentRailForm(form: PaymentRailFormState): PaymentRailFormErrors {
  return {
    code: form.id === null && form.code.trim().length === 0,
    name: form.name.trim().length === 0,
    currency: form.currency.trim().length === 0 || form.currency.trim().length > 10,
    country: !/^[A-Za-z]{3}$/.test(form.country.trim()),
  };
}

export function buildCreatePaymentRailInput(
  form: PaymentRailFormState
): AdminCreatePaymentRailInput {
  return {
    code: form.code.trim(),
    name: form.name.trim(),
    currency: form.currency.trim().toUpperCase(),
    country: form.country.trim().toUpperCase(),
    direction: form.direction,
    isActive: form.isActive,
  };
}

/** The rail code is immutable on the backend, so it is never sent. */
export function buildUpdatePaymentRailInput(
  form: PaymentRailFormState
): AdminUpdatePaymentRailInput {
  return {
    name: form.name.trim(),
    currency: form.currency.trim().toUpperCase(),
    country: form.country.trim().toUpperCase(),
    direction: form.direction,
    isActive: form.isActive,
  };
}
