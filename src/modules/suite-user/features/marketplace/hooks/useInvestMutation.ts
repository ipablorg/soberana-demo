import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { VaultTransaction } from '../types/vault.types';

interface InvestPayload {
  vaultSlug: string;
  amountUsd: number;
  sharePrice: number;
}

async function submitInvestment(payload: InvestPayload): Promise<VaultTransaction> {
  await new Promise((r) => setTimeout(r, 1500));

  const sharesAmount = payload.amountUsd / payload.sharePrice;

  return {
    id: `tx-${Date.now()}`,
    vaultSlug: payload.vaultSlug,
    vaultName: '',
    pair: '',
    type: 'INVEST',
    amountUsd: payload.amountUsd,
    sharesAmount: Math.round(sharesAmount * 100) / 100,
    sharePriceAtExecution: payload.sharePrice,
    status: 'PROCESSING',
    createdAt: new Date().toISOString(),
  };
}

export function useInvestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitInvestment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['vault-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['vaults'] });
    },
  });
}
