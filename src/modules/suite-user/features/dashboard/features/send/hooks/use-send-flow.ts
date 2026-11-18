/**
 * Hook: useSendFlow
 *
 * Thin adapter that composes the three GraphQL sources the inline send
 * flow needs into a single, ready-to-consume shape. Pointing at the
 * exact same endpoints `/suite/send` uses (`beneficiaries_list`,
 * `wallets_listByCustomer`, `wallets_getBalance`) means the two
 * surfaces can't drift and every fixture works for both.
 *
 *   useBeneficiaries()             → beneficiary list (JSON scalar)
 *   useWallets()                   → customer wallets + backend default source
 *   useWalletBalance(walletId)     → live visible + spendable balance for selected wallet
 *
 * The selected wallet follows the same shared resolver used by
 * dashboard and receive: backend default exact match first, then the
 * deterministic oldest-visible fallback.
 *
 * Quote + off-ramp mutations are NOT composed here: each step of the
 * flow calls its own mutation hook where it needs to, so the caller
 * doesn't pay the cost of keeping a quote alive while it's on a step
 * that doesn't need one.
 */

import * as React from 'react';
import { useBeneficiaries } from '@/shared/hooks/use-beneficiaries';
import { useActiveWallet } from '@/shared/hooks/use-active-wallet';
import { useWalletBalance } from '@/shared/hooks/use-wallet-balance';
import type { BeneficiaryResponse } from '@/shared/lib/beneficiaries-api';
import { mapError } from '@/shared/lib/error-mapper';
import { resolveWalletSelection } from '@/shared/lib/receive-wallet';

/**
 * Structural subset of `Wallet` from `useWallets`. Exported so consumer
 * components can type their props against the same shape without
 * reaching into an internal `Wallet` type that isn't re-exported.
 */
export interface SendFlowWallet {
  id: string;
  currency: string;
  chain: string;
}

export interface UseSendFlowResult {
  beneficiaries: BeneficiaryResponse[];
  wallet: SendFlowWallet | null;
  secondaryWallets: SendFlowWallet[];
  /** Provider-truth spendable balance as a numeric string, or '0' when unknown. */
  availableBalance: string;
  isLoading: boolean;
  error: string | null;
}

export const useSendFlow = (): UseSendFlowResult => {
  const {
    beneficiaries,
    isLoading: beneficiariesLoading,
    error: beneficiariesError,
  } = useBeneficiaries();

  const {
    wallets,
    defaultWallet,
    activeWallet,
    isLoading: walletsLoading,
    error: walletsError,
  } = useActiveWallet();

  const walletSelection = React.useMemo(
    () => resolveWalletSelection(wallets, defaultWallet),
    [wallets, defaultWallet],
  );
  const wallet: SendFlowWallet | null = (activeWallet ?? walletSelection.mainWallet) as SendFlowWallet | null;

  const {
    balance,
    isLoading: balanceLoading,
    error: balanceError,
  } = useWalletBalance(wallet?.id);

  const isLoading = beneficiariesLoading || walletsLoading || balanceLoading;

  const firstError = beneficiariesError ?? walletsError ?? balanceError ?? null;
  const error = firstError ? mapError(firstError).message : null;

  return {
    beneficiaries: beneficiaries as BeneficiaryResponse[],
    wallet,
    secondaryWallets: walletSelection.secondaryWallets as SendFlowWallet[],
    availableBalance: balance?.spendable_balance ?? '0',
    isLoading,
    error,
  };
};
