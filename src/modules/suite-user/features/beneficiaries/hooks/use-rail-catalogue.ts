/**
 * `rails_catalogue`: country -> rail -> provider availability. Cached for five
 * minutes; the catalogue only changes when ops seed rails or flip a provider.
 */

import { useQuery } from '@tanstack/react-query';

import { RailsCatalogue } from '@/graphql/queries/soberana/rails-catalogue.query';
import { graphqlClient } from '@/shared/lib/graphql-client';

import type { RailCatalogue } from '../lib/rail-catalogue';

export const RAIL_CATALOGUE_QUERY_KEY = ['rails', 'catalogue'] as const;

export function useRailCatalogue() {
  return useQuery({
    queryKey: RAIL_CATALOGUE_QUERY_KEY,
    queryFn: async (): Promise<RailCatalogue> => {
      const result = await graphqlClient.request(RailsCatalogue, {});
      return result.rails_catalogue;
    },
    staleTime: 5 * 60_000,
  });
}
