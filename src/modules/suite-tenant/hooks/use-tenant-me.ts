import { TenantMeDocument } from '@/graphql/queries/tenant';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { tenantQueryKeys } from '@/modules/suite-tenant/lib/tenant-query-keys';

/** The signed-in admin's tenant: name, status, environment, API key metadata, enabled rails. */
export function useTenantMe() {
  return useGraphQLQuery([...tenantQueryKeys.me], TenantMeDocument, undefined, {
    staleTime: 60_000,
  });
}
