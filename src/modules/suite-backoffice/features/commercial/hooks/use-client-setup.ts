/**
 * #411 Setup screen data: everything the checklist reads for one client.
 * Every query is readable by OPS_COMMERCIAL and LOOPAY_ADMIN; the checklist
 * itself is built by `buildSetupChecklist`.
 */

import {
  ListCustomersSearchDocument,
  type ListCustomersSearchQuery,
  type ListCustomersSearchQueryVariables,
} from '@/graphql/queries/admin-loopay/customers.queries';
import {
  PlatformReadinessDocument,
  type PlatformReadinessQuery,
  type PlatformReadinessQueryVariables,
} from '@/graphql/queries/admin-loopay/platform-config.queries';
import {
  ListVirtualAccountsDocument,
  type ListVirtualAccountsQuery,
  type ListVirtualAccountsQueryVariables,
} from '@/graphql/queries/admin-loopay/virtual-accounts.queries';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';

import { commercialQueryKeys } from '../lib/commercial-logic';

/** Readiness row of this client only (`adminLoopay_platformReadiness(clientId)`). */
export function useClientSetupReadiness(clientId: string) {
  return useGraphQLQuery<PlatformReadinessQuery, PlatformReadinessQueryVariables>(
    [...commercialQueryKeys.setup(clientId), 'readiness'],
    PlatformReadinessDocument,
    { clientId },
    { enabled: clientId !== '' }
  );
}

/** First customer of the client whose KYC is approved (informational step). */
export function useFirstApprovedCustomer(clientId: string) {
  return useGraphQLQuery<ListCustomersSearchQuery, ListCustomersSearchQueryVariables>(
    [...commercialQueryKeys.setup(clientId), 'first-customer'],
    ListCustomersSearchDocument,
    { where: { clientId, kycStatus: 'APPROVED' }, take: 1 },
    { enabled: clientId !== '' }
  );
}

/** An open (ACTIVE) virtual account of that customer, if any. */
export function useFirstOpenVirtualAccount(clientId: string, customerId: string | null) {
  return useGraphQLQuery<ListVirtualAccountsQuery, ListVirtualAccountsQueryVariables>(
    [...commercialQueryKeys.setup(clientId), 'first-va', customerId ?? ''],
    ListVirtualAccountsDocument,
    {
      where: { customerId: { equals: customerId ?? '' }, status: ['ACTIVE'] },
      pagination: { offset: 0, limit: 1 },
    },
    { enabled: Boolean(customerId) }
  );
}
