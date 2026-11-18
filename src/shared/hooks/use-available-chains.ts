import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { WalletsAvailableChains } from '@/graphql/queries/soberana/wallets-available-chains.query';

interface AvailableChainsResult {
  wallets_availableChains: {
    chains: string[];
    default_chain: string | null;
    currency: string | null;
  };
}

export function useAvailableChains() {
  const query = useGraphQLQuery(
    ['wallets', 'availableChains'],
    WalletsAvailableChains as any,
    undefined,
    {
      staleTime: 300_000,
    }
  );

  const result = (query.data as AvailableChainsResult | undefined)?.wallets_availableChains;

  return {
    chains: result?.chains ?? [],
    defaultChain: result?.default_chain ?? null,
    currency: result?.currency ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
}
