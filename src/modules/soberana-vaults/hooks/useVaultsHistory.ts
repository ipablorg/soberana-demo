/**
 * Soberana Vaults — History Hooks
 * TanStack Query v5 hooks for historical vault data
 */

import { useQuery } from '@tanstack/react-query';
import { vaultsApi } from '../api/vaults-api';

const REFETCH_INTERVAL = 60_000;
const STALE_TIME = 30_000;

export function useVaultsHistorico(ultimos = 100) {
  return useQuery({
    queryKey: ['vaults', 'historico', ultimos],
    queryFn: () => vaultsApi.historico(ultimos),
    refetchInterval: REFETCH_INTERVAL,
    staleTime: STALE_TIME,
    retry: 2,
  });
}

export function useVaultsInformes(limit = 20) {
  return useQuery({
    queryKey: ['vaults', 'informes', limit],
    queryFn: () => vaultsApi.informes(limit),
    refetchInterval: REFETCH_INTERVAL,
    staleTime: STALE_TIME,
    retry: 2,
  });
}
