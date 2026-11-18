/**
 * useCanTransact Hook
 *
 * Checks if user can perform transactions by verifying KYC approval, the
 * customer's operational status and wallet existence. Wallets are provisioned
 * by ops, so a missing wallet reports `wallet_pending` and never triggers
 * a create mutation.
 */

import { useKYC } from '@/shared/hooks/useKYC';
import { useWallets } from '@/shared/hooks/use-wallets';

export type CanTransactReason =
  | 'no_kyc'
  | 'kyc_pending'
  | 'kyc_rejected'
  | 'kyc_review_required'
  | 'customer_inactive'
  | 'wallet_pending'
  | 'ready';

export interface CanTransactReasonInput {
  kycCanTransact: boolean;
  kycStatus: string;
  isCustomerActive: boolean;
  needsKycRetry?: boolean;
  needsManualRefresh?: boolean;
  hasWallet: boolean;
  walletsLoading: boolean;
}

/**
 * KYC and customer status are evaluated before the wallet so an approved,
 * ACTIVE customer without a wallet still reports `wallet_pending`.
 */
export function deriveCanTransactReason({
  kycCanTransact,
  kycStatus,
  isCustomerActive,
  needsKycRetry,
  needsManualRefresh,
  hasWallet,
  walletsLoading,
}: CanTransactReasonInput): CanTransactReason {
  if (!kycCanTransact || kycStatus !== 'APPROVED') {
    if (kycStatus === 'REJECTED') {
      return 'kyc_rejected';
    }
    if (needsKycRetry || needsManualRefresh || kycStatus === 'FAILED' || kycStatus === 'EXPIRED') {
      return 'kyc_review_required';
    }
    if (kycStatus === 'NOT_INITIATED' || kycStatus === 'INITIATED') {
      return 'kyc_pending';
    }
    return 'no_kyc';
  }

  if (!isCustomerActive) {
    return 'customer_inactive';
  }

  if (!hasWallet && !walletsLoading) {
    return 'wallet_pending';
  }

  return 'ready';
}

export function useCanTransact() {
  const {
    canTransact: kycCanTransact,
    isCustomerActive,
    kycStatus,
    needsKycRetry,
    needsManualRefresh,
    isLoading: kycLoading,
  } = useKYC();
  const { wallets, isLoading: walletsLoading } = useWallets();

  const isLoading = kycLoading || walletsLoading;
  const hasWallet = wallets.length > 0;

  const reason = deriveCanTransactReason({
    kycCanTransact,
    kycStatus,
    isCustomerActive,
    needsKycRetry,
    needsManualRefresh,
    hasWallet,
    walletsLoading,
  });

  const canTransact = reason === 'ready';

  return {
    canTransact,
    reason,
    kycStatus,
    isLoading,
    isBlocked: !canTransact && !isLoading,
    hasWallet,
  };
}
