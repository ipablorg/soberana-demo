/**
 * Provider review of a beneficiary, as the admin read exposes it
 * (`reviewStatus`: IN_REVIEW | APPROVED | REJECTED). The same mapping exists in
 * the client app (`suite-user/features/beneficiaries/lib/beneficiary-review`);
 * the two modules cannot import each other, so this is the backoffice copy.
 */

export type BackofficeReviewKind = 'in_review' | 'approved' | 'rejected';

const KINDS: Record<string, BackofficeReviewKind> = {
  APPROVED: 'approved',
  IN_REVIEW: 'in_review',
  REJECTED: 'rejected',
};

/** Unknown or missing values are never shown as approved. */
export function reviewKindOf(reviewStatus: string | null | undefined): BackofficeReviewKind {
  return KINDS[(reviewStatus ?? '').toUpperCase()] ?? 'in_review';
}

/**
 * Beneficiaries created at a provider are managed by that provider's review;
 * ops decisions (verify, deactivate, reactivate) apply only to rows without one.
 */
export function isProviderManaged(row: { providerCode?: string | null }): boolean {
  return Boolean(row.providerCode);
}

export { countryName } from './country-name';
