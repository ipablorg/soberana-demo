/**
 * Tenant backoffice queries (`tenant_*`, CLIENT_ADMIN of an ACTIVE client).
 *
 * The tenant scope comes from the signed-in user, never from an argument.
 * Customers, wallets and transactions return the REST response body as JSON
 * (see back `docs/api/TENANT_GRAPHQL.md`); `tenant_me` and `tenant_listTeam`
 * are typed objects.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';

import type {
  TenantAvailableChains,
  TenantCustomer,
  TenantCustomerRails,
  TenantDepositInstructions,
  TenantMe,
  TenantPage,
  TenantPaymentLinkCapabilities,
  TenantRequirementList,
  TenantTeamMember,
  TenantTransaction,
  TenantTransactionFilters,
  TenantWallet,
  TenantWalletBalance,
} from '@/graphql/types/tenant';

type NoVariables = Record<string, never>;

// ── Profile ────────────────────────────────────────────────────────────────

export interface TenantMeQuery {
  tenant_me: TenantMe;
}

export const TenantMeDocument = parse(/* GraphQL */ `
  query TenantMe {
    tenant_me {
      client_id
      name
      status
      api_key_prefix
      api_key_rotated_at
      api_key_expires_at
      environment
      enabled_rails {
        code
        currency
        country
      }
      acting_as {
        staff_email
        staff_roles
      }
    }
  }
`) as unknown as TypedDocumentNode<TenantMeQuery, NoVariables>;

// ── Customers ──────────────────────────────────────────────────────────────

export interface TenantListCustomersQuery {
  tenant_listCustomers: TenantPage<TenantCustomer>;
}

export interface TenantListCustomersQueryVariables {
  filters?: { page?: number; page_size?: number; created_from?: string; created_to?: string };
}

export const TenantListCustomersDocument = parse(/* GraphQL */ `
  query TenantListCustomers($filters: JSONObject) {
    tenant_listCustomers(filters: $filters)
  }
`) as unknown as TypedDocumentNode<TenantListCustomersQuery, TenantListCustomersQueryVariables>;

export interface TenantGetCustomerQuery {
  tenant_getCustomer: TenantCustomer;
}

export interface TenantCustomerIdVariables {
  id: string;
}

export const TenantGetCustomerDocument = parse(/* GraphQL */ `
  query TenantGetCustomer($id: String!) {
    tenant_getCustomer(id: $id)
  }
`) as unknown as TypedDocumentNode<TenantGetCustomerQuery, TenantCustomerIdVariables>;

export interface TenantListCustomerRailsQuery {
  tenant_listCustomerRails: TenantCustomerRails;
}

export interface TenantListCustomerRailsQueryVariables {
  id: string;
  include_pending?: boolean;
}

export const TenantListCustomerRailsDocument = parse(/* GraphQL */ `
  query TenantListCustomerRails($id: String!, $include_pending: Boolean) {
    tenant_listCustomerRails(id: $id, include_pending: $include_pending)
  }
`) as unknown as TypedDocumentNode<
  TenantListCustomerRailsQuery,
  TenantListCustomerRailsQueryVariables
>;

export interface TenantListCustomerRequirementsQuery {
  tenant_listCustomerRequirements: TenantRequirementList;
}

export const TenantListCustomerRequirementsDocument = parse(/* GraphQL */ `
  query TenantListCustomerRequirements($id: String!) {
    tenant_listCustomerRequirements(id: $id)
  }
`) as unknown as TypedDocumentNode<TenantListCustomerRequirementsQuery, TenantCustomerIdVariables>;

// ── Wallets ────────────────────────────────────────────────────────────────

export interface TenantWalletAvailableChainsQuery {
  tenant_walletAvailableChains: TenantAvailableChains;
}

export const TenantWalletAvailableChainsDocument = parse(/* GraphQL */ `
  query TenantWalletAvailableChains {
    tenant_walletAvailableChains
  }
`) as unknown as TypedDocumentNode<TenantWalletAvailableChainsQuery, NoVariables>;

export interface TenantListWalletsQuery {
  tenant_listWallets: TenantPage<TenantWallet>;
}

export interface TenantListWalletsQueryVariables {
  customer_id: string;
}

export const TenantListWalletsDocument = parse(/* GraphQL */ `
  query TenantListWallets($customer_id: String) {
    tenant_listWallets(customer_id: $customer_id)
  }
`) as unknown as TypedDocumentNode<TenantListWalletsQuery, TenantListWalletsQueryVariables>;

export interface TenantGetWalletQuery {
  tenant_getWallet: TenantWallet;
}

export interface TenantWalletIdVariables {
  id: string;
}

export const TenantGetWalletDocument = parse(/* GraphQL */ `
  query TenantGetWallet($id: String!) {
    tenant_getWallet(id: $id)
  }
`) as unknown as TypedDocumentNode<TenantGetWalletQuery, TenantWalletIdVariables>;

export interface TenantWalletBalanceQuery {
  tenant_walletBalance: TenantWalletBalance;
}

export const TenantWalletBalanceDocument = parse(/* GraphQL */ `
  query TenantWalletBalance($id: String!) {
    tenant_walletBalance(id: $id)
  }
`) as unknown as TypedDocumentNode<TenantWalletBalanceQuery, TenantWalletIdVariables>;

export interface TenantWalletDepositInstructionsQuery {
  tenant_walletDepositInstructions: TenantDepositInstructions;
}

export interface TenantWalletDepositInstructionsQueryVariables {
  id: string;
  customer_id: string;
}

export const TenantWalletDepositInstructionsDocument = parse(/* GraphQL */ `
  query TenantWalletDepositInstructions($id: String!, $customer_id: String) {
    tenant_walletDepositInstructions(id: $id, customer_id: $customer_id)
  }
`) as unknown as TypedDocumentNode<
  TenantWalletDepositInstructionsQuery,
  TenantWalletDepositInstructionsQueryVariables
>;

export interface TenantWalletTransactionsQuery {
  tenant_walletTransactions: TenantPage<TenantTransaction>;
}

export interface TenantWalletTransactionsQueryVariables {
  id: string;
  filters?: { page?: number; page_size?: number };
}

export const TenantWalletTransactionsDocument = parse(/* GraphQL */ `
  query TenantWalletTransactions($id: String!, $filters: JSONObject) {
    tenant_walletTransactions(id: $id, filters: $filters)
  }
`) as unknown as TypedDocumentNode<
  TenantWalletTransactionsQuery,
  TenantWalletTransactionsQueryVariables
>;

// ── Transactions ───────────────────────────────────────────────────────────

export interface TenantListTransactionsQuery {
  tenant_listTransactions: TenantPage<TenantTransaction>;
}

export interface TenantListTransactionsQueryVariables {
  filters?: TenantTransactionFilters;
}

export const TenantListTransactionsDocument = parse(/* GraphQL */ `
  query TenantListTransactions($filters: JSONObject) {
    tenant_listTransactions(filters: $filters)
  }
`) as unknown as TypedDocumentNode<
  TenantListTransactionsQuery,
  TenantListTransactionsQueryVariables
>;

export interface TenantGetTransactionQuery {
  tenant_getTransaction: TenantTransaction;
}

export const TenantGetTransactionDocument = parse(/* GraphQL */ `
  query TenantGetTransaction($id: String!) {
    tenant_getTransaction(id: $id)
  }
`) as unknown as TypedDocumentNode<TenantGetTransactionQuery, { id: string }>;

export interface TenantPaymentLinkCapabilitiesQuery {
  tenant_paymentLinkCapabilities: TenantPaymentLinkCapabilities;
}

export const TenantPaymentLinkCapabilitiesDocument = parse(/* GraphQL */ `
  query TenantPaymentLinkCapabilities {
    tenant_paymentLinkCapabilities
  }
`) as unknown as TypedDocumentNode<TenantPaymentLinkCapabilitiesQuery, NoVariables>;

// ── Team ───────────────────────────────────────────────────────────────────

export interface TenantListTeamQuery {
  tenant_listTeam: TenantTeamMember[];
}

export const TenantListTeamDocument = parse(/* GraphQL */ `
  query TenantListTeam {
    tenant_listTeam {
      id
      email
      first_name
      last_name
      created_at
    }
  }
`) as unknown as TypedDocumentNode<TenantListTeamQuery, NoVariables>;
