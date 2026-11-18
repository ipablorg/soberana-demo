/**
 * Catalog-backed select options (providers, rails, currencies) for any staff
 * role (the catalog queries are readable by all staff). Providers fall back
 * to the supported list only when the query fails; rails never fall back.
 */

import { useMemo } from 'react';

import {
  ListPaymentRailsDocument,
  ListProvidersDocument,
  type ListPaymentRailsQuery,
  type ListPaymentRailsQueryVariables,
  type ListProvidersQuery,
  type ListProvidersQueryVariables,
} from '@/graphql/queries/admin-loopay';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';

import {
  currencyOptionsFromRails,
  providerOptionsFromCatalog,
  railOptionsFromCatalog,
} from '../lib/catalog-options';
import { platformQueryKeys } from '../lib/platform-query-keys';

const CATALOG_STALE_TIME_MS = 5 * 60 * 1000;

export function useProviderOptions() {
  const query = useGraphQLQuery<ListProvidersQuery, ListProvidersQueryVariables>(
    [...platformQueryKeys.providers],
    ListProvidersDocument,
    undefined,
    { staleTime: CATALOG_STALE_TIME_MS }
  );

  return useMemo(
    () => providerOptionsFromCatalog(query.data?.adminLoopay_listProviders, query.isError),
    [query.data, query.isError]
  );
}

export function useRailOptions() {
  const query = useGraphQLQuery<ListPaymentRailsQuery, ListPaymentRailsQueryVariables>(
    [...platformQueryKeys.paymentRails],
    ListPaymentRailsDocument,
    undefined,
    { staleTime: CATALOG_STALE_TIME_MS }
  );

  return useMemo(() => {
    const rails = query.data?.adminLoopay_listPaymentRails;

    return {
      rails: railOptionsFromCatalog(rails),
      currencies: currencyOptionsFromRails(rails, query.isError),
      /** True when the rail catalog could not be loaded (show a message, no stale data). */
      failed: query.isError,
    };
  }, [query.data, query.isError]);
}

/**
 * #411: catalogue flags by id (any staff role): whether a provider is active
 * and a rail is active and canonical, for lists whose junction rows only carry
 * the provider and rail summaries.
 */
export function useCatalogFlags() {
  const providers = useGraphQLQuery<ListProvidersQuery, ListProvidersQueryVariables>(
    [...platformQueryKeys.providers],
    ListProvidersDocument,
    undefined,
    { staleTime: CATALOG_STALE_TIME_MS }
  );
  const rails = useGraphQLQuery<ListPaymentRailsQuery, ListPaymentRailsQueryVariables>(
    [...platformQueryKeys.paymentRails],
    ListPaymentRailsDocument,
    undefined,
    { staleTime: CATALOG_STALE_TIME_MS }
  );

  return {
    isLoading: providers.isLoading || rails.isLoading,
    error: providers.error ?? rails.error,
    refetch: () => {
      void providers.refetch();
      void rails.refetch();
    },
    providerActive: new Map(
      (providers.data?.adminLoopay_listProviders ?? []).map((row) => [row.id, row.is_active])
    ),
    rails: new Map(
      (rails.data?.adminLoopay_listPaymentRails ?? []).map((row) => [
        row.id,
        { isActive: row.is_active, canonicalCode: row.canonical_code ?? null },
      ])
    ),
  };
}
