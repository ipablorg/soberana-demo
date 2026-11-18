/**
 * admin-loopay customer search query.
 *
 * Feeds the customer picker in the UUID manual-operation forms. Mirrors
 * `adminLoopay_listCustomers` in
 * `src/modules/admin-loopay/customers/customers.resolver.ts` on the backend
 * (LOOPAY_ADMIN). `where.email` is a case-insensitive contains.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';

import type {
  AdminCustomerManagementEntity,
  AdminCustomerManagementFilters,
  AdminWalletResponse,
} from '@/graphql/types/admin-loopay';

export interface AdminCustomerSearchItem {
  id: string;
  clientId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface ListCustomersSearchQuery {
  adminLoopay_listCustomers: AdminCustomerSearchItem[];
}

export interface ListCustomersSearchQueryVariables {
  where?: { email?: string; clientId?: string; kycStatus?: string };
  skip?: number;
  take?: number;
}

export const ListCustomersSearchDocument = parse(/* GraphQL */ `
  query AdminLoopayListCustomersSearch($where: AdminCustomerFiltersInput, $skip: Int, $take: Int) {
    adminLoopay_listCustomers(where: $where, skip: $skip, take: $take) {
      id
      clientId
      email
      firstName
      lastName
    }
  }
`) as unknown as TypedDocumentNode<ListCustomersSearchQuery, ListCustomersSearchQueryVariables>;

export interface ListCustomersManagementQuery {
  adminLoopay_listCustomers: AdminCustomerManagementEntity[];
}

export interface ListCustomersManagementQueryVariables {
  where?: AdminCustomerManagementFilters;
  skip?: number;
  take?: number;
}

export const ListCustomersManagementDocument = parse(/* GraphQL */ `
  query AdminLoopayListCustomersManagement(
    $where: AdminCustomerFiltersInput
    $skip: Int
    $take: Int
  ) {
    adminLoopay_listCustomers(where: $where, skip: $skip, take: $take) {
      id
      clientId
      externalId
      email
      firstName
      middleName
      lastName
      taxId
      taxIdTypeId
      country
      kycStatus
      customerStatus
      capabilities
      rejectionReasons
      addressDetails
      metadata
      bridgeCustomerId
      bridgeKycLevel
      bridgeKycUrl
      createdAt
      updatedAt
    }
  }
`) as unknown as TypedDocumentNode<
  ListCustomersManagementQuery,
  ListCustomersManagementQueryVariables
>;

export interface ListWalletsByCustomerQuery {
  adminLoopay_listWalletsByCustomer: AdminWalletResponse[];
}

export interface ListWalletsByCustomerQueryVariables {
  customerId: string;
}

export const ListWalletsByCustomerDocument = parse(/* GraphQL */ `
  query AdminLoopayListWalletsByCustomer($customerId: String!) {
    adminLoopay_listWalletsByCustomer(customerId: $customerId) {
      id
      customerId
      clientId
      providerId
      providerCode
      currency
      walletType
      chain
      address
      alias
      balance
      status
      alreadyExisted
      virtualAccountIds
      createdAt
      createdBy
    }
  }
`) as unknown as TypedDocumentNode<ListWalletsByCustomerQuery, ListWalletsByCustomerQueryVariables>;
