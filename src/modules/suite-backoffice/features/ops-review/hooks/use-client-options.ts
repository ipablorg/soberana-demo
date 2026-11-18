/**
 * Client options for the ops queue client selector
 * (`adminLoopay_listClientOptions`, any OPS_* role or PLATFORM_ADMIN).
 */

import { useMemo } from 'react';

import {
  ListClientOptionsDocument,
  type ListClientOptionsQuery,
  type ListClientOptionsQueryVariables,
} from '@/graphql/queries/admin-loopay';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';

import { sortClientOptions } from '../lib/client-options';
import { opsQueryKeys } from '../lib/ops-query-keys';

/** Client list barely changes during a shift; avoid refetching per queue. */
const CLIENT_OPTIONS_STALE_TIME_MS = 5 * 60 * 1000;

export function useClientOptions() {
  const query = useGraphQLQuery<
    ListClientOptionsQuery,
    ListClientOptionsQueryVariables
  >([...opsQueryKeys.clientOptions], ListClientOptionsDocument, undefined, {
    staleTime: CLIENT_OPTIONS_STALE_TIME_MS,
  });

  const options = useMemo(
    () => sortClientOptions(query.data?.adminLoopay_listClientOptions ?? []),
    [query.data],
  );

  return { options, isLoading: query.isLoading, error: query.error };
}
