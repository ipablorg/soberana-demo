/**
 * Prefill of the beneficiary form from what we already know about the
 * customer (KYC snapshot). It only applies to the customer's OWN account
 * (relationship "Soy yo"): a third party's name is never taken from the
 * customer's data.
 */

import type { PrefillData } from '@/modules/suite-user/features/dashboard/features/receive/external-account-form';

import type { RailFormValues } from './rail-fields';

export type SelfPrefill = Partial<
  Pick<
    RailFormValues,
    | 'beneficiary_name'
    | 'tax_id'
    | 'holder_type'
    | 'address_line_1'
    | 'city'
    | 'state'
    | 'postal_code'
  >
>;

const KEYS = [
  'beneficiary_name',
  'tax_id',
  'holder_type',
  'address_line_1',
  'city',
  'state',
  'postal_code',
] as const satisfies readonly (keyof SelfPrefill)[];

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

/** Customer profile fields (`customers_findById`) that complete the snapshot prefill. */
export interface CustomerProfilePrefillSource {
  tax_id?: string | null;
  business_name?: string | null;
  customer_type?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  address?: object | null;
}

/**
 * The KYC snapshot prefill carries name and address but never the tax id, and
 * the profile is the source of record for it. Profile values only fill what the
 * snapshot lacks; an empty profile value never erases a known one.
 */
export function mergeCustomerProfileIntoPrefill(
  snapshotPrefill: Record<string, unknown> | null | undefined,
  profile: CustomerProfilePrefillSource | null | undefined
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...(snapshotPrefill ?? {}) };
  if (!profile) return merged;
  for (const key of [
    'tax_id',
    'business_name',
    'customer_type',
    'first_name',
    'last_name',
  ] as const) {
    if (!hasText(merged[key]) && hasText(profile[key])) merged[key] = profile[key];
  }
  const snapshotAddress =
    merged.address && typeof merged.address === 'object'
      ? (merged.address as Record<string, unknown>)
      : {};
  const address: Record<string, unknown> = { ...snapshotAddress };
  for (const [key, value] of Object.entries((profile.address ?? {}) as Record<string, unknown>)) {
    if (!hasText(address[key]) && hasText(value)) address[key] = value;
  }
  if (Object.keys(address).length > 0) merged.address = address;
  return merged;
}

export function buildSelfPrefill(known: PrefillData): SelfPrefill {
  const out: SelfPrefill = {};
  if (known.ownerName) out.beneficiary_name = known.ownerName;
  if (known.tax_id) out.tax_id = known.tax_id;
  if (known.customer_type.toLowerCase() === 'business') out.holder_type = 'BUSINESS';
  if (known.address.street_line_1) out.address_line_1 = known.address.street_line_1;
  if (known.address.city) out.city = known.address.city;
  if (known.address.state) out.state = known.address.state;
  if (known.address.postal_code) out.postal_code = known.address.postal_code;
  return out;
}

/** Fills the still-empty fields when the account is the customer's own. */
export function fillSelfPrefill(values: RailFormValues, prefill: SelfPrefill): RailFormValues {
  if (values.relationship !== 'SELF') return values;
  const next = { ...values };
  let changed = false;
  for (const key of KEYS) {
    const known = prefill[key];
    // holder_type starts as INDIVIDUAL, so it counts as "empty" too.
    const isEmpty = key === 'holder_type' ? values.holder_type === 'INDIVIDUAL' : !values[key];
    if (known && isEmpty) {
      next[key] = known;
      changed = true;
    }
  }
  return changed ? next : values;
}

/** Drops the prefilled values the user left untouched (the account is someone else's). */
export function clearSelfPrefill(values: RailFormValues, prefill: SelfPrefill): RailFormValues {
  const next = { ...values };
  let changed = false;
  for (const key of KEYS) {
    const known = prefill[key];
    if (known && values[key] === known) {
      next[key] = key === 'holder_type' ? 'INDIVIDUAL' : '';
      changed = true;
    }
  }
  return changed ? next : values;
}
