/**
 * Providers a client can be onboarded at, derived from the provider catalog
 * (`adminLoopay_listProviders`). A failed or empty query gets the static
 * default list.
 */

import { useMemo } from 'react';

import {
  ListProvidersDocument,
  type ListProvidersQuery,
  type ListProvidersQueryVariables,
} from '@/graphql/queries/admin-loopay';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';

import { platformQueryKeys } from '../../platform-config/lib/platform-query-keys';
import { deriveOnboardingProviders } from '../lib/commercial-logic';

export function useOnboardingProviders() {
  const query = useGraphQLQuery<ListProvidersQuery, ListProvidersQueryVariables>(
    [...platformQueryKeys.providers],
    ListProvidersDocument
  );

  return useMemo(
    () => deriveOnboardingProviders(query.data?.adminLoopay_listProviders),
    [query.data]
  );
}
