/**
 * Pure decision model for the endorsement and beneficiary review queues.
 *
 * Both queues share the same shape — approve or reject with a mandatory reason
 * on rejection — but they use different decision enums, so the mapping lives
 * here instead of being repeated in each page.
 */

import type {
  AdminLinkBeneficiaryProviderInput,
  AdminReviewBeneficiaryInput,
  AdminReviewEndorsementInput,
} from '@/graphql/types/admin-loopay';

export type QueueReviewAction = 'approve' | 'reject';

/** Rejection always needs a reason; approval never does. */
export function isQueueReasonRequired(action: QueueReviewAction): boolean {
  return action === 'reject';
}

/** `AdminEndorsementReviewDecision` target, used as the modal's target state. */
export function endorsementTargetStatus(action: QueueReviewAction): string {
  return action === 'approve' ? 'APPROVED' : 'REJECTED';
}

/** `AdminBeneficiaryReviewDecision` approves as `VERIFIED`, not `APPROVED`. */
export function beneficiaryTargetStatus(action: QueueReviewAction): string {
  return action === 'approve' ? 'VERIFIED' : 'REJECTED';
}

export function buildReviewEndorsementInput(
  action: QueueReviewAction,
  reason: string,
  providerCode?: string,
): AdminReviewEndorsementInput {
  if (action === 'approve') {
    // Without `providerCode` the approval is recorded but no virtual account opens.
    return providerCode
      ? { decision: 'APPROVED', providerCode }
      : { decision: 'APPROVED' };
  }

  return { decision: 'REJECTED', reason: reason.trim() };
}

export function buildReviewBeneficiaryInput(
  action: QueueReviewAction,
  reason: string,
): AdminReviewBeneficiaryInput {
  if (action === 'approve') {
    return { decision: 'VERIFIED' };
  }

  return { decision: 'REJECTED', reason: reason.trim() };
}

export function buildLinkBeneficiaryProviderInput(
  providerCode: string,
  providerBeneficiaryId: string,
): AdminLinkBeneficiaryProviderInput {
  return {
    providerCode: providerCode.trim(),
    providerBeneficiaryId: providerBeneficiaryId.trim(),
  };
}
