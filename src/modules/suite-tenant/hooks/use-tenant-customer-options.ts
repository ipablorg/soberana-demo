import { TenantListCustomersDocument } from '@/graphql/queries/tenant';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { tenantQueryKeys } from '@/modules/suite-tenant/lib/tenant-query-keys';

/** Largest page the customers endpoint serves (`page_size` max 100); enough for the pickers. */
const CUSTOMER_OPTIONS_PAGE_SIZE = 100;

/** Customers for the wallet and transaction pickers (first 100). */
export function useTenantCustomerOptions() {
  return useGraphQLQuery([...tenantQueryKeys.customers, 'options'], TenantListCustomersDocument, {
    filters: { page: 1, page_size: CUSTOMER_OPTIONS_PAGE_SIZE },
  });
}
