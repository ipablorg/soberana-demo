import { useQuery } from '@tanstack/react-query';
import { RAILS_LIST_QUERY } from '@/graphql/queries/soberana/rails-list.query';
import { isSandboxRuntime } from '@/shared/lib/runtime-sandbox';
import { graphqlClient } from '@/shared/lib/graphql-client';

interface Rail {
  code: string;
  currency: string;
  country?: string | null;
  available_countries?: string[] | null;
  is_assignable: boolean;
  type: string;
  enabled_capabilities: string[];
  limits?: {
    min_amount?: number | null;
    max_amount?: number | null;
    daily_limit?: number | null;
    source: string;
  } | null;
  name: string;
  description: string | null;
}

/**
 * Rails excluded from the receive UI.
 * Includes crypto rails (no virtual accounts / deposit instructions)
 * and alias rails that duplicate an existing rail for the same currency.
 *
 * Exported so other surfaces (dashboard receive flow, orphan endorsement
 * calculation) can reuse the same filter.
 */
export const EXCLUDED_RAILS = new Set([
  'solana', 'polygon', 'base',      // crypto
  'us_ach', 'us_wire',              // aliases of ach / wire (USD)
  'br_ted',                          // alias of pix (BRL)
]);

interface RailsListResult {
  rails_list: {
    data: Rail[];
  };
}

export function useRails() {
  const sandboxRuntime = isSandboxRuntime();
  const hiddenRailsOutsideSandbox = sandboxRuntime
    ? new Set<string>()
    : new Set(['pe_bank_transfer']);

  const query = useQuery<RailsListResult>({
    queryKey: ['rails', 'list'],
    queryFn: async () => graphqlClient.request<RailsListResult>(RAILS_LIST_QUERY),
    staleTime: 600_000,
  });

  return {
    rails: (query.data?.rails_list?.data ?? [])
      .filter((r) => !EXCLUDED_RAILS.has(r.code.toLowerCase()))
      .filter((r) => !hiddenRailsOutsideSandbox.has(r.code.toLowerCase())),
    isLoading: query.isLoading,
    error: query.error,
  };
}
