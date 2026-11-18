import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { VaultTransaction, RedeemMode } from '../types/vault.types';

interface RedeemPayload {
  vaultSlug: string;
  mode: RedeemMode;
  sharesAmount?: number;
  amountUsd?: number;
  sharePrice: number;
}

async function submitRedemption(payload: RedeemPayload): Promise<VaultTransaction> {
  await new Promise((r) => setTimeout(r, 1500));

  const shares =
    payload.mode === 'shares'
      ? payload.sharesAmount!
      : payload.amountUsd! / payload.sharePrice;

  const usd =
    payload.mode === 'amount'
      ? payload.amountUsd!
      : payload.sharesAmount! * payload.sharePrice;

  return {
    id: `tx-${Date.now()}`,
    vaultSlug: payload.vaultSlug,
    vaultName: '',
    pair: '',
    type: 'REDEEM',
    amountUsd: Math.round(usd * 100) / 100,
    sharesAmount: Math.round(shares * 100) / 100,
    sharePriceAtExecution: payload.sharePrice,
    status: 'PROCESSING',
    createdAt: new Date().toISOString(),
  };
}

export function useRedeemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitRedemption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['vault-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['vaults'] });
    },
  });
}
