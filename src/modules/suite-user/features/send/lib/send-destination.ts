/**
 * Send flow, step 1 (Phase 8 S3): country -> rail -> beneficiary.
 *
 * Pure selection logic. The user picks where the money goes (country), how
 * (rail) and then one of the saved beneficiaries registered on that rail. Only
 * beneficiaries the provider approved can be picked; the rest are listed
 * disabled with a hint.
 */

import {
  payoutCountries,
  payoutRails,
  toIso3,
  type RailCatalogue,
} from '@/modules/suite-user/features/beneficiaries/lib/rail-catalogue';
import {
  isBeneficiarySelectable,
  type ReviewableBeneficiary,
} from '@/modules/suite-user/features/beneficiaries/lib/beneficiary-review';

export interface SendDestinationBeneficiary extends ReviewableBeneficiary {
  id: string;
  payment_rail?: string | null;
  rail?: { code: string } | null;
  /** ISO3 as stored by the back; ISO2 is tolerated. */
  country?: string | null;
}

/** Rows saved before the ach/wire split carry the combined rail code. */
const LEGACY_RAIL_ALIASES: Record<string, readonly string[]> = {
  ach_wire: ['ach', 'wire'],
};

function railCodesOf(beneficiary: SendDestinationBeneficiary): string[] {
  const code = (beneficiary.rail?.code ?? beneficiary.payment_rail ?? '').trim().toLowerCase();
  if (!code) return [];
  return [code, ...(LEGACY_RAIL_ALIASES[code] ?? [])];
}

function matchesCountry(beneficiary: SendDestinationBeneficiary, iso2: string): boolean {
  const stored = beneficiary.country?.trim().toUpperCase();
  if (!stored) return true;
  return stored === iso2.toUpperCase() || stored === toIso3(iso2);
}

export function beneficiariesForRail<T extends SendDestinationBeneficiary>(
  beneficiaries: readonly T[],
  country: string,
  railCode: string,
): T[] {
  const wanted = railCode.trim().toLowerCase();
  return beneficiaries.filter(
    (beneficiary) => railCodesOf(beneficiary).includes(wanted) && matchesCountry(beneficiary, country),
  );
}

export function partitionByReview<T extends SendDestinationBeneficiary>(
  beneficiaries: readonly T[],
): { usable: T[]; blocked: T[] } {
  const usable: T[] = [];
  const blocked: T[] = [];
  for (const beneficiary of beneficiaries) {
    (isBeneficiarySelectable(beneficiary) ? usable : blocked).push(beneficiary);
  }
  return { usable, blocked };
}

/**
 * Fewer steps: open on the first country (and rail, when unambiguous) where the
 * user already has a saved beneficiary.
 */
export function defaultDestination(
  catalogue: RailCatalogue | null | undefined,
  beneficiaries: readonly SendDestinationBeneficiary[],
): { country: string; railCode: string } {
  for (const { country } of payoutCountries(catalogue)) {
    const withBeneficiaries = payoutRails(catalogue, country).filter(
      (rail) => beneficiariesForRail(beneficiaries, country, rail.code).length > 0,
    );
    if (withBeneficiaries.length === 0) continue;
    return { country, railCode: withBeneficiaries.length === 1 ? withBeneficiaries[0].code : '' };
  }
  return { country: '', railCode: '' };
}
