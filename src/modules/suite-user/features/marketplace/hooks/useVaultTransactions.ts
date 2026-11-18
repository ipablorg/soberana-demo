import { useQuery } from '@tanstack/react-query';
import { MOCK_TRANSACTIONS } from '../data/vault-mocks';
import type { VaultTransaction } from '../types/vault.types';

const SIMULATED_DELAY = 800;

async function fetchTransactions(): Promise<VaultTransaction[]> {
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return MOCK_TRANSACTIONS;
}

export function useVaultTransactions() {
  return useQuery({
    queryKey: ['vault-transactions'],
    queryFn: fetchTransactions,
    staleTime: 2 * 60 * 1000,
  });
}
