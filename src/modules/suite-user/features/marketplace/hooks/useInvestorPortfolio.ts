import { useQuery } from '@tanstack/react-query';
import { MOCK_PORTFOLIO } from '../data/vault-mocks';
import type { InvestorPortfolio } from '../types/vault.types';

const SIMULATED_DELAY = 800;

async function fetchPortfolio(): Promise<InvestorPortfolio> {
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return MOCK_PORTFOLIO;
}

export function useInvestorPortfolio() {
  return useQuery({
    queryKey: ['investor-portfolio'],
    queryFn: fetchPortfolio,
    staleTime: 2 * 60 * 1000,
  });
}
