/**
 * Transaction explorer hooks (`adminLoopay_*`, staff scope).
 *
 * `useTransactions` feeds the explorer table; `useTransactionDetail` fetches
 * the full entity (with provider operations) for the row detail dialog and is
 * gated by `enabled` so it only fires when a row is selected.
 */

import {
  GetTransactionDocument,
  ListTransactionsDocument,
  type GetTransactionQuery,
  type GetTransactionQueryVariables,
  type ListTransactionsQuery,
  type ListTransactionsQueryVariables,
} from '@/graphql/queries/admin-loopay';
import type { AdminTransactionFiltersInput } from '@/graphql/types/admin-loopay';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';

import { opsQueryKeys } from '../../ops-review/lib/ops-query-keys';

export function useTransactions(filter: AdminTransactionFiltersInput) {
  return useGraphQLQuery<
    ListTransactionsQuery,
    ListTransactionsQueryVariables
  >([...opsQueryKeys.transactions], ListTransactionsDocument, { where: filter });
}

export function useTransactionDetail(id: string | null) {
  return useGraphQLQuery<
    GetTransactionQuery,
    GetTransactionQueryVariables
  >(
    [...opsQueryKeys.transactions, 'detail', id ?? 'none'],
    GetTransactionDocument,
    { id: id ?? '' },
    { enabled: Boolean(id) },
  );
}
