/**
 * Pure decision model for the manual KYC queue.
 *
 * Keeping the "which action needs a reason / what does it transition to"
 * knowledge out of the page means it can be asserted without a renderer, and
 * means the confirmation modal and the mutation payload can never disagree
 * about whether a reason is mandatory.
 */

import type {
  AdminKycReviewResponse,
  AdminRequestKycAdditionalInfoInput,
  AdminReviewKycInput,
} from '@/graphql/types/admin-loopay';

export type KycReviewAction = 'approve' | 'reject' | 'request-info';

/**
 * `ReviewKycInput.reason` is optional in the schema but required by the
 * service when the decision is `REJECTED`;
 * `RequestKycAdditionalInfoInput.reason` is `@IsNotEmpty()` outright.
 */
export function isKycReasonRequired(action: KycReviewAction): boolean {
  return action === 'reject' || action === 'request-info';
}

/** The `kyc_status` the customer lands on, used as the modal's target state. */
export function kycActionTargetStatus(action: KycReviewAction): string {
  switch (action) {
    case 'approve':
      return 'APPROVED';
    case 'reject':
      return 'REJECTED';
    case 'request-info':
      return 'ADDITIONAL_INFO_REQUIRED';
  }
}

/** `approve` and `reject` both go through `adminLoopay_reviewKyc`. */
export function buildReviewKycInput(
  action: Exclude<KycReviewAction, 'request-info'>,
  reason: string,
): AdminReviewKycInput {
  if (action === 'approve') {
    return { decision: 'APPROVED' };
  }

  return { decision: 'REJECTED', reason: reason.trim() };
}

export function buildRequestKycAdditionalInfoInput(
  reason: string,
): AdminRequestKycAdditionalInfoInput {
  return { reason: reason.trim() };
}

/**
 * Wallet-provision announcement derived from the `adminLoopay_reviewKyc`
 * response. Returns `null` when there is nothing to announce (e.g. a reject,
 * where no wallet is created). Pure so it can be asserted without a renderer.
 */
export type KycWalletAnnouncement =
  | {
      kind: 'wallet-created';
      chain: string;
      currency: string;
      /** Truncated for display: `0x12ab...cdef`. */
      addressPreview: string;
    }
  | { kind: 'wallet-error'; error: string };

export function describeReviewKycWalletResult(
  result: AdminKycReviewResponse,
): KycWalletAnnouncement | null {
  if (result.wallet_error) {
    return { kind: 'wallet-error', error: result.wallet_error };
  }

  if (result.wallet?.address) {
    const address = result.wallet.address;
    const addressPreview =
      address.length > 12
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : address;

    return {
      kind: 'wallet-created',
      chain: result.wallet.chain ?? '?',
      currency: result.wallet.currency,
      addressPreview,
    };
  }

  return null;
}
