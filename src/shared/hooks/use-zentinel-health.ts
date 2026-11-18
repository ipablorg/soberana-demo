/**
 * Reads the Zentinel `/api/health/info` probe. Powers the `isReady`
 * gate on the chat UI and surfaces feature flags (`streaming`,
 * `soberana_bridge`, rate-limit config) so the hook layer can decide
 * between streaming vs non-streaming chat automatically.
 *
 * The probe is unauthenticated (guide §8), cached for 5 minutes (flags
 * rarely change), and intentionally does NOT retry: if the backend is
 * down, the UI must render a graceful fallback banner, not thrash.
 */

import { useQuery } from '@tanstack/react-query';
import {
  getZentinelClient,
  type ZentinelHealthInfo,
} from '@/shared/lib/zentinel-client';

export const ZENTINEL_HEALTH_QUERY_KEY = ['zentinel', 'health-info'] as const;

export interface ZentinelHealthState {
  is_ready: boolean;
  is_loading: boolean;
  error: unknown;
  info: ZentinelHealthInfo | null;
  features: {
    streaming: boolean;
    soberana_bridge: boolean;
    csv_upload: boolean;
    rate_limit: { ttl_ms: number; limit: number };
  };
}

const FALLBACK_FEATURES: ZentinelHealthState['features'] = {
  streaming: false,
  soberana_bridge: false,
  csv_upload: false,
  rate_limit: { ttl_ms: 60_000, limit: 10 },
};

export function useZentinelHealth(): ZentinelHealthState {
  const { data, isLoading, error } = useQuery({
    queryKey: ZENTINEL_HEALTH_QUERY_KEY,
    queryFn: () => getZentinelClient().health_info(),
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    is_ready: !!data && !error,
    is_loading: isLoading,
    error,
    info: data ?? null,
    features: data?.features ?? FALLBACK_FEATURES,
  };
}
