/**
 * Soberana Vaults — Live Data Hooks
 * TanStack Query v5 hooks for real-time vault data
 */

import { useQuery } from '@tanstack/react-query';
import { vaultsApi } from '../api/vaults-api';

const REFETCH_INTERVAL = 60_000; // 60 seconds
const STALE_TIME = 30_000;       // 30 seconds

export function useVaultsHealth() {
  return useQuery({
    queryKey: ['vaults', 'health'],
    queryFn: vaultsApi.health,
    refetchInterval: REFETCH_INTERVAL,
    staleTime: STALE_TIME,
    retry: 2,
  });
}

export function useVaultsResumen() {
  return useQuery({
    queryKey: ['vaults', 'resumen'],
    queryFn: vaultsApi.resumen,
    refetchInterval: REFETCH_INTERVAL,
    staleTime: STALE_TIME,
    retry: 2,
  });
}

export function useVaultsLatestInforme() {
  return useQuery({
    queryKey: ['vaults', 'latest'],
    queryFn: vaultsApi.latestInforme,
    refetchInterval: REFETCH_INTERVAL,
    staleTime: STALE_TIME,
    retry: 2,
  });
}
