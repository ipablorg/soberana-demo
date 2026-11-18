/**
 * Receive options (Phase 8 S3): every country/currency/rail the customer can
 * receive on, with the state of the virtual-account request.
 *
 *   available -> can be requested        requested -> in review / provider onboarding
 *   active    -> already has an account  rejected  -> ended without an account
 */

import {
  compareCountries,
  countryLabel,
} from '@/modules/suite-user/features/beneficiaries/lib/rail-catalogue';

export type ReceiveStatus = 'available' | 'requested' | 'active' | 'rejected';

export interface ReceiveBlocker {
  code: string;
  category: string;
  message: string;
}

export interface ReceiveOption {
  /** ISO 3166-1 alpha-2. */
  country: string;
  currency: string;
  railCode: string;
  railName: string;
  provider: string;
  providers: string[];
  status: string;
  requestId?: string | null;
  virtualAccountId?: string | null;
  vaRequestState?: string | null;
  blockers: ReceiveBlocker[];
  reason?: string | null;
  /**
   * Backend eligibility (contract C4, additive). `false` means this customer
   * cannot request the account; `ineligibleReason` says why. Absent on older
   * backends, in which case the customer type decides (see `isEligible`).
   */
  eligible?: boolean | null;
  /** "VA_BUSINESS_ONLY" | "RAIL_UNDER_MAINTENANCE" | null (or free text on older backends). */
  ineligibleReason?: string | null;
}

export interface ReceiveCountryGroup {
  country: string;
  label: string;
  options: ReceiveOption[];
}

const KNOWN_STATUSES: readonly ReceiveStatus[] = ['available', 'requested', 'active', 'rejected'];
const STATUS_RANK: Record<ReceiveStatus, number> = { active: 0, requested: 1, available: 2, rejected: 3 };

/** An unknown value never offers a request button: it is shown as in progress. */
export function normalizeReceiveStatus(status: string | null | undefined): ReceiveStatus {
  const lower = status?.trim().toLowerCase();
  return KNOWN_STATUSES.find((known) => known === lower) ?? 'requested';
}

export function canRequest(option: Pick<ReceiveOption, 'status'>): boolean {
  return normalizeReceiveStatus(option.status) === 'available';
}

/**
 * Can this customer request the account? The backend flag wins when present;
 * otherwise virtual accounts are offered only to business customers (any
 * business type, sole proprietorship included).
 */
export function isEligible(
  option: Pick<ReceiveOption, 'eligible'>,
  customerType: 'individual' | 'business',
): boolean {
  if (typeof option.eligible === 'boolean') return option.eligible;
  return customerType === 'business';
}

export function optionKey(option: Pick<ReceiveOption, 'country' | 'currency' | 'railCode'>): string {
  return `${option.country.toUpperCase()}:${option.currency}:${option.railCode.toLowerCase()}`;
}

export function groupReceiveOptions(options: readonly ReceiveOption[]): ReceiveCountryGroup[] {
  const byCountry = new Map<string, ReceiveOption[]>();
  for (const option of options) {
    const country = option.country.toUpperCase();
    byCountry.set(country, [...(byCountry.get(country) ?? []), option]);
  }

  return [...byCountry.entries()]
    .sort(([a], [b]) => compareCountries(a, b))
    .map(([country, list]) => ({
      country,
      label: countryLabel(country),
      options: [...list].sort(
        (a, b) => STATUS_RANK[normalizeReceiveStatus(a.status)] - STATUS_RANK[normalizeReceiveStatus(b.status)],
      ),
    }));
}
