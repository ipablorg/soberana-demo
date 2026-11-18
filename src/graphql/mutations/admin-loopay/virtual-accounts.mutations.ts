/**
 * admin-loopay virtual-account, provider-link and wallet-ops mutations.
 *
 * `adminLoopay_linkWalletAddress` and `adminLoopay_moveToOpsVault` carry
 * `@RequiresRecentAuth`; the link/create mutations do not.
 *
 * `adminLoopay_moveToOpsVault` is keyed by `transactionId` (the processing
 * withdrawal being swept), not by a wallet id.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import type {
  AdminCreateWalletInput,
  AdminLinkProviderCustomerInput,
  AdminLinkVirtualAccountInput,
  AdminLinkWalletAddressInput,
  AdminMoveToOpsVaultInput,
  AdminOpsVaultTransfer,
  AdminProviderCustomerLink,
  AdminRequestVirtualAccountInput,
  AdminRequestVirtualAccountResult,
  AdminUpdateVirtualAccountInput,
  AdminVirtualAccount,
  AdminWalletResponse,
} from '@/graphql/types/admin-loopay';

const WALLET_RESPONSE_FIELDS = `
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
`;

export interface LinkVirtualAccountMutation {
  adminLoopay_linkVirtualAccount: AdminVirtualAccount;
}

export interface LinkVirtualAccountMutationVariables {
  input: AdminLinkVirtualAccountInput;
}

export const LinkVirtualAccountDocument = parse(/* GraphQL */ `
  mutation AdminLoopayLinkVirtualAccount($input: LinkVirtualAccountInput!) {
    adminLoopay_linkVirtualAccount(input: $input) {
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
  }
`) as unknown as TypedDocumentNode<
  LinkVirtualAccountMutation,
  LinkVirtualAccountMutationVariables
>;

export interface RequestVirtualAccountMutation {
  adminLoopay_requestVirtualAccount: AdminRequestVirtualAccountResult;
}

export interface RequestVirtualAccountMutationVariables {
  input: AdminRequestVirtualAccountInput;
}

/** Backoffice request of a virtual account for a customer (carries `@RequiresRecentAuth`). */
export const RequestVirtualAccountDocument = parse(/* GraphQL */ `
  mutation AdminLoopayRequestVirtualAccount($input: AdminRequestVirtualAccountInput!) {
    adminLoopay_requestVirtualAccount(input: $input) {
      created
      request {
        country
        currency
        railCode
        railName
        provider
        providers
        status
        requestId
        virtualAccountId
        vaRequestState
        reason
        eligible
        ineligibleReason
      }
    }
  }
`) as unknown as TypedDocumentNode<
  RequestVirtualAccountMutation,
  RequestVirtualAccountMutationVariables
>;

export interface LinkProviderCustomerMutation {
  adminLoopay_linkProviderCustomer: AdminProviderCustomerLink;
}

export interface LinkProviderCustomerMutationVariables {
  customerId: string;
  input: AdminLinkProviderCustomerInput;
}

export const LinkProviderCustomerDocument = parse(/* GraphQL */ `
  mutation AdminLoopayLinkProviderCustomer(
    $customerId: ID!
    $input: LinkProviderCustomerInput!
  ) {
    adminLoopay_linkProviderCustomer(customerId: $customerId, input: $input) {
      id
      customer_id
      provider_code
      external_customer_id
      kyc_status
      linked_at
    }
  }
`) as unknown as TypedDocumentNode<
  LinkProviderCustomerMutation,
  LinkProviderCustomerMutationVariables
>;

export interface CreateWalletMutation {
  adminLoopay_createWallet: AdminWalletResponse;
}

export interface CreateWalletMutationVariables {
  input: AdminCreateWalletInput;
}

export const CreateWalletDocument = parse(/* GraphQL */ `
  mutation AdminLoopayCreateWallet($input: AdminCreateWalletInput!) {
    adminLoopay_createWallet(input: $input) {
      ${WALLET_RESPONSE_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  CreateWalletMutation,
  CreateWalletMutationVariables
>;

export interface LinkWalletAddressMutation {
  adminLoopay_linkWalletAddress: AdminWalletResponse;
}

export interface LinkWalletAddressMutationVariables {
  customerId: string;
  input: AdminLinkWalletAddressInput;
}

export const LinkWalletAddressDocument = parse(/* GraphQL */ `
  mutation AdminLoopayLinkWalletAddress(
    $customerId: ID!
    $input: LinkWalletAddressInput!
  ) {
    adminLoopay_linkWalletAddress(customerId: $customerId, input: $input) {
      ${WALLET_RESPONSE_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  LinkWalletAddressMutation,
  LinkWalletAddressMutationVariables
>;

export interface MoveToOpsVaultMutation {
  adminLoopay_moveToOpsVault: AdminOpsVaultTransfer;
}

export interface MoveToOpsVaultMutationVariables {
  transactionId: string;
  input: AdminMoveToOpsVaultInput;
}

export const MoveToOpsVaultDocument = parse(/* GraphQL */ `
  mutation AdminLoopayMoveToOpsVault(
    $transactionId: ID!
    $input: MoveToOpsVaultInput!
  ) {
    adminLoopay_moveToOpsVault(transactionId: $transactionId, input: $input) {
      transaction_id
      provider_tx_id
      funds_location
    }
  }
`) as unknown as TypedDocumentNode<
  MoveToOpsVaultMutation,
  MoveToOpsVaultMutationVariables
>;

export interface UpdateVirtualAccountMutation {
  adminLoopay_updateVirtualAccount: AdminVirtualAccount;
}

export interface UpdateVirtualAccountMutationVariables {
  id: string;
  input: AdminUpdateVirtualAccountInput;
}

export const UpdateVirtualAccountDocument = parse(/* GraphQL */ `
  mutation AdminLoopayUpdateVirtualAccount(
    $id: String!
    $input: UpdateVirtualAccountInput!
  ) {
    adminLoopay_updateVirtualAccount(id: $id, input: $input) {
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
  }
`) as unknown as TypedDocumentNode<
  UpdateVirtualAccountMutation,
  UpdateVirtualAccountMutationVariables
>;

export interface UpdateWalletMutation {
  adminLoopay_updateWallet: AdminWalletResponse;
}

export interface UpdateWalletMutationVariables {
  id: string;
  input: { status?: string; alias?: string | null };
}

export const UpdateWalletDocument = parse(/* GraphQL */ `
  mutation AdminLoopayUpdateWallet(
    $id: String!
    $input: AdminUpdateWalletInput!
  ) {
    adminLoopay_updateWallet(id: $id, input: $input) {
      ${WALLET_RESPONSE_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  UpdateWalletMutation,
  UpdateWalletMutationVariables
>;
