import { useQuery } from '@tanstack/react-query';
import { MOCK_VAULTS } from '../data/vault-mocks';
import type { Vault } from '../types/vault.types';

const SIMULATED_DELAY = 800;

async function fetchVaults(): Promise<Vault[]> {
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return MOCK_VAULTS;
}

export function useVaults() {
  return useQuery({
    queryKey: ['vaults'],
    queryFn: fetchVaults,
    staleTime: 5 * 60 * 1000,
  });
}

export function useVaultBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['vaults', slug],
    queryFn: async (): Promise<Vault | undefined> => {
      await new Promise((r) => setTimeout(r, 400));
      return MOCK_VAULTS.find((v) => v.slug === slug);
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}
