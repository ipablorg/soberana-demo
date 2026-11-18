/**
 * admin-loopay transaction explorer queries.
 *
 * `adminLoopay_listTransactions` returns `PaginatedAdminTransactionsResponse`
 * and `adminLoopay_getTransaction` returns the full `AdminTransactionEntity`
 * (camelCase), including nested wallet.customer, beneficiary and provider
 * operations. Both are LOOPAY_ADMIN scope.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import type {
  AdminPaginationInput,
  AdminTransactionEntity,
  AdminTransactionFiltersInput,
  AdminTransactionPaginated,
} from '@/graphql/types/admin-loopay';

const TRANSACTION_ENTITY_FIELDS = `
  id
  type
  status
  amount
  currency
  description
  metadata
  failureReason
  referenceCode
  direction
  createdAt
  completedAt
  updatedAt
  wallet {
    id
    customerId
    currency
    chain
    address
    cachedBalance
    customer {
      id
      firstName
      lastName
      email
    }
  }
  beneficiary {
    id
    status
    railCode
  }
  providerOperations {
    id
    externalId
    status
    operationType
    requestPayload
    responsePayload
    idempotencyKey
    createdAt
    updatedAt
  }
`;

export interface ListTransactionsQuery {
  adminLoopay_listTransactions: AdminTransactionPaginated;
}

export interface ListTransactionsQueryVariables {
  where?: AdminTransactionFiltersInput;
  pagination?: AdminPaginationInput;
}

export const ListTransactionsDocument = parse(/* GraphQL */ `
  query AdminLoopayListTransactions(
    $where: AdminTransactionFiltersInput
    $pagination: PaginationInput
  ) {
    adminLoopay_listTransactions(where: $where, pagination: $pagination) {
      data {
        ${TRANSACTION_ENTITY_FIELDS}
      }
      total
      has_more
    }
  }
`) as unknown as TypedDocumentNode<
  ListTransactionsQuery,
  ListTransactionsQueryVariables
>;

export interface GetTransactionQuery {
  adminLoopay_getTransaction: AdminTransactionEntity;
}

export interface GetTransactionQueryVariables {
  id: string;
}

export const GetTransactionDocument = parse(/* GraphQL */ `
  query AdminLoopayGetTransaction($id: String!) {
    adminLoopay_getTransaction(id: $id) {
      ${TRANSACTION_ENTITY_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  GetTransactionQuery,
  GetTransactionQueryVariables
>;
