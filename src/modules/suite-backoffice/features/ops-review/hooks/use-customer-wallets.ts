/**
 * Wallets of one customer (`adminLoopay_listWalletsByCustomer`).
 *
 * Every caller shares the `opsQueryKeys.customerWallets` cache entry, so the
 * wallet picker and any form that reads the wallet currencies trigger a single
 * request per customer.
 */

import {
  ListWalletsByCustomerDocument,
  type ListWalletsByCustomerQuery,
  type ListWalletsByCustomerQueryVariables,
} from '@/graphql/queries/admin-loopay';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';

import { opsQueryKeys } from '../lib/ops-query-keys';

export type CustomerWallet =
  ListWalletsByCustomerQuery['adminLoopay_listWalletsByCustomer'][number];

const NO_WALLETS: CustomerWallet[] = [];

export function useCustomerWallets(customerId: string | null) {
  const { data, isLoading } = useGraphQLQuery<
    ListWalletsByCustomerQuery,
    ListWalletsByCustomerQueryVariables
  >(
    [...opsQueryKeys.customerWallets(customerId ?? 'none')],
    ListWalletsByCustomerDocument,
    { customerId: customerId ?? '' },
    { enabled: customerId !== null },
  );

  return {
    wallets: data?.adminLoopay_listWalletsByCustomer ?? NO_WALLETS,
    isLoading,
  };
}
