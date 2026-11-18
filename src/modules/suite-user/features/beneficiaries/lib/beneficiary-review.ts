/**
 * Provider review of a beneficiary (Phase 8 S2).
 *
 * A beneficiary is created at the provider and is usable for payouts only once
 * the provider approves it. Until then it shows "En revisión" in the app. The
 * back exposes `review_status` (IN_REVIEW | APPROVED | REJECTED) and still
 * mirrors it into the legacy `verification_status`; we read the new field first
 * and fall back to the legacy one so an older back keeps working.
 */

export interface ReviewableBeneficiary {
  review_status?: string | null;
  review_reason?: string | null;
  verification_status?: string | null;
}

export type ReviewKind = 'in_review' | 'approved' | 'rejected';

export interface ReviewState {
  kind: ReviewKind;
  /** Provider/ops rejection reason; only ever set when rejected. */
  reason: string | null;
}

const LEGACY_TO_KIND: Record<string, ReviewKind> = {
  VERIFIED: 'approved',
  PENDING: 'in_review',
  REJECTED: 'rejected',
  UNVERIFIED: 'rejected',
};

const REVIEW_TO_KIND: Record<string, ReviewKind> = {
  APPROVED: 'approved',
  IN_REVIEW: 'in_review',
  REJECTED: 'rejected',
};

export function getReviewState(beneficiary: ReviewableBeneficiary): ReviewState {
  const fromReview = beneficiary.review_status
    ? REVIEW_TO_KIND[beneficiary.review_status.toUpperCase()]
    : undefined;
  const fromLegacy = beneficiary.verification_status
    ? LEGACY_TO_KIND[beneficiary.verification_status.toUpperCase()]
    : undefined;
  // Unknown or missing values are never treated as approved.
  const kind: ReviewKind =
    beneficiary.review_status !== undefined && beneficiary.review_status !== null
      ? (fromReview ?? 'in_review')
      : (fromLegacy ?? 'in_review');

  const reason = kind === 'rejected' ? (beneficiary.review_reason?.trim() || null) : null;
  return { kind, reason };
}

/** Send gate: only APPROVED beneficiaries can receive money. */
export function isBeneficiarySelectable(beneficiary: ReviewableBeneficiary): boolean {
  return getReviewState(beneficiary).kind === 'approved';
}
