/**
 * Wallets of the tenant. The REST API lists wallets per customer
 * (`customer_id` is required), so the screens pick a customer first.
 *
 * No creation: Loopay operations mint a customer's wallet when its KYC is
 * approved, and `tenant_createWallet` always answers 403
 * `WALLET_CREATION_MANAGED_BY_OPS` by design.
 */

import {
  TenantGetWalletDocument,
  TenantListWalletsDocument,
  TenantWalletBalanceDocument,
  TenantWalletDepositInstructionsDocument,
  TenantWalletTransactionsDocument,
} from '@/graphql/queries/tenant';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { tenantQueryKeys } from '@/modules/suite-tenant/lib/tenant-query-keys';

export function useTenantWallets(customerId: string) {
  return useGraphQLQuery(
    [...tenantQueryKeys.wallets, 'by-customer'],
    TenantListWalletsDocument,
    { customer_id: customerId },
    { enabled: customerId.length > 0 }
  );
}

export function useTenantWallet(id: string) {
  return useGraphQLQuery([...tenantQueryKeys.wallet(id)], TenantGetWalletDocument, { id });
}

export function useTenantWalletBalance(id: string) {
  return useGraphQLQuery([...tenantQueryKeys.wallet(id), 'balance'], TenantWalletBalanceDocument, {
    id,
  });
}

export function useTenantWalletDepositInstructions(id: string, customerId: string | undefined) {
  return useGraphQLQuery(
    [...tenantQueryKeys.wallet(id), 'deposit-instructions'],
    TenantWalletDepositInstructionsDocument,
    { id, customer_id: customerId ?? '' },
    { enabled: Boolean(customerId) }
  );
}

export function useTenantWalletTransactions(id: string) {
  return useGraphQLQuery(
    [...tenantQueryKeys.wallet(id), 'transactions'],
    TenantWalletTransactionsDocument,
    { id, filters: { page: 1, page_size: 20 } }
  );
}
