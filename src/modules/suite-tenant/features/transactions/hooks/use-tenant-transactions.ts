/** Transactions of the tenant: list, detail, capabilities and the four create commands. */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { useLingui } from '@lingui/react/macro';

import {
  TenantCreateDispersionDocument,
  TenantCreateOffRampDocument,
  TenantCreatePaymentLinkDocument,
  TenantCreateTransferDocument,
} from '@/graphql/mutations/tenant';
import {
  TenantGetTransactionDocument,
  TenantListTransactionsDocument,
  TenantPaymentLinkCapabilitiesDocument,
} from '@/graphql/queries/tenant';
import type { TenantTransactionFilters } from '@/graphql/types/tenant';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { useTenantMutation } from '@/modules/suite-tenant/hooks/use-tenant-mutation';
import { tenantQueryKeys } from '@/modules/suite-tenant/lib/tenant-query-keys';

export const TRANSACTIONS_PAGE_SIZE = 20;

export function useTenantTransactions(filters: TenantTransactionFilters) {
  return useGraphQLQuery([...tenantQueryKeys.transactions], TenantListTransactionsDocument, {
    filters,
  });
}

export function useTenantTransaction(id: string) {
  return useGraphQLQuery([...tenantQueryKeys.transaction(id)], TenantGetTransactionDocument, {
    id,
  });
}

export function useTenantPaymentLinkCapabilities(enabled: boolean) {
  return useGraphQLQuery(
    [...tenantQueryKeys.paymentLinkCapabilities],
    TenantPaymentLinkCapabilitiesDocument,
    undefined,
    { enabled, staleTime: 5 * 60_000 }
  );
}

/** Shared wiring of the money-moving commands (one hook per document, same messages). */
function useTransactionCommand<TResult extends object, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  successMessage: string,
  onCompleted: (result: unknown) => void,
  onFailed: (code: string | undefined) => void
) {
  const { t } = useLingui();

  return useTenantMutation(document, {
    invalidate: [tenantQueryKeys.transactions, tenantQueryKeys.wallets],
    successMessage,
    errorMessage: t`We couldn't create the transaction`,
    messagesByCode: {
      EXTERNAL_CRYPTO_TRANSFER_NOT_AVAILABLE: t`Crypto transfers to external addresses are not available in production.`,
      INSUFFICIENT_BALANCE: t`The wallet does not have enough balance.`,
      IDEMPOTENCY_KEY_REQUIRED: t`The request had no reference. Try again.`,
    },
    // The response is `{ tenant_<command>: <REST body> }`: hand over the body.
    onCompleted: (result) => onCompleted(Object.values(result)[0]),
    onFailed: (_description, code) => onFailed(code),
  });
}

export function useCreateTenantTransactions(
  onCompleted: (result: unknown) => void,
  onFailed: (code: string | undefined) => void
) {
  const { t } = useLingui();

  return {
    off_ramp: useTransactionCommand(
      TenantCreateOffRampDocument,
      t`Withdrawal requested.`,
      onCompleted,
      onFailed
    ),
    dispersion: useTransactionCommand(
      TenantCreateDispersionDocument,
      t`Dispersion requested.`,
      onCompleted,
      onFailed
    ),
    transfer: useTransactionCommand(
      TenantCreateTransferDocument,
      t`Transfer on its way.`,
      onCompleted,
      onFailed
    ),
    payment_link: useTransactionCommand(
      TenantCreatePaymentLinkDocument,
      t`Payment link ready.`,
      onCompleted,
      onFailed
    ),
  };
}
