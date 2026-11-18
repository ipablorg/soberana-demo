/**
 * admin-loopay virtual-account queries.
 *
 * `adminLoopay_listVirtualAccounts` is the pre-existing LOOPAY_ADMIN query and
 * returns the camelCase `AdminVirtualAccountEntity`;
 * `adminLoopay_listProviderLinkedAccounts` is the newer OPS_VA query and
 * returns snake_case fields. The split is the backend's, mirrored verbatim.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import type {
  AdminPaginated,
  AdminPaginationInput,
  AdminProviderLinkedAccount,
  AdminVirtualAccount,
  AdminVirtualAccountFilters,
} from '@/graphql/types/admin-loopay';

export interface ListVirtualAccountsQuery {
  adminLoopay_listVirtualAccounts: AdminPaginated<AdminVirtualAccount>;
}

export interface ListVirtualAccountsQueryVariables {
  where?: AdminVirtualAccountFilters;
  pagination?: AdminPaginationInput;
}

export const ListVirtualAccountsDocument = parse(/* GraphQL */ `
  query AdminLoopayListVirtualAccounts(
    $where: VirtualAccountFiltersInput
    $pagination: PaginationInput
  ) {
    adminLoopay_listVirtualAccounts(where: $where, pagination: $pagination) {
      data {
        id
        customerId
        walletId
        providerId
        railId
        railCode
        currency
        providerAccountId
        bankDetails
        alias
        status
        createdAt
        updatedAt
      }
      total
      has_more
    }
  }
`) as unknown as TypedDocumentNode<
  ListVirtualAccountsQuery,
  ListVirtualAccountsQueryVariables
>;

export interface ListProviderLinkedAccountsQuery {
  adminLoopay_listProviderLinkedAccounts: AdminPaginated<AdminProviderLinkedAccount>;
}

export interface ListProviderLinkedAccountsQueryVariables {
  customerId?: string;
  providerCode?: string;
  pagination?: AdminPaginationInput;
}

export const ListProviderLinkedAccountsDocument = parse(/* GraphQL */ `
  query AdminLoopayListProviderLinkedAccounts(
    $customerId: ID
    $providerCode: String
    $pagination: PaginationInput
  ) {
    adminLoopay_listProviderLinkedAccounts(
      customerId: $customerId
      providerCode: $providerCode
      pagination: $pagination
    ) {
      data {
        id
        customer_id
        customer_email
        provider_code
        rail_code
        currency
        status
        provider_account_id
        alias
        linked_at
      }
      total
      has_more
    }
  }
`) as unknown as TypedDocumentNode<
  ListProviderLinkedAccountsQuery,
  ListProviderLinkedAccountsQueryVariables
>;
