/** Where a customer can receive money, and virtual-account requests (`/v1/virtual-accounts`). */

import { useLingui } from '@lingui/react/macro';

import {
  TenantRequestVirtualAccountDocument,
  type TenantRequestVirtualAccountMutation,
} from '@/graphql/mutations/tenant';
import { TenantVirtualAccountReceiveOptionsDocument } from '@/graphql/queries/tenant';
import type { TenantReceiveOptionsFilters } from '@/graphql/types/tenant';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { useTenantMutation } from '@/modules/suite-tenant/hooks/use-tenant-mutation';
import { tenantQueryKeys } from '@/modules/suite-tenant/lib/tenant-query-keys';

export function useTenantReceiveOptions(customerId: string, country: string) {
  const filters: TenantReceiveOptionsFilters = { customer_id: customerId };
  if (country) filters.country = country;

  return useGraphQLQuery(
    [...tenantQueryKeys.receiveOptions],
    TenantVirtualAccountReceiveOptionsDocument,
    { filters },
    {
      enabled: customerId.length > 0,
    }
  );
}

export function useRequestTenantVirtualAccount(
  onCompleted?: (result: TenantRequestVirtualAccountMutation) => void
) {
  const { t } = useLingui();

  return useTenantMutation(TenantRequestVirtualAccountDocument, {
    invalidate: [tenantQueryKeys.receiveOptions],
    errorMessage: t`We couldn't request the virtual account`,
    messagesByCode: {
      VA_REQUEST_EXISTS: t`This account was already requested.`,
      RAIL_NOT_AVAILABLE: t`That rail is not available for this customer.`,
    },
    onCompleted,
  });
}
