import { TenantRailCatalogueDocument } from '@/graphql/queries/tenant';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { tenantQueryKeys } from '@/modules/suite-tenant/lib/tenant-query-keys';

/** Country → rail → direction → provider catalogue; `country` (ISO alpha-2/3) narrows it, empty = all. */
export function useTenantRailCatalogue(country: string) {
  const variables: { country?: string } = country ? { country } : {};

  return useGraphQLQuery(
    [...tenantQueryKeys.railCatalogue],
    TenantRailCatalogueDocument,
    variables,
    {
      staleTime: 5 * 60_000,
    }
  );
}
