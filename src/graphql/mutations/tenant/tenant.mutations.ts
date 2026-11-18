/**
 * Tenant backoffice mutations (`tenant_*`, CLIENT_ADMIN of an ACTIVE client).
 *
 * `input` is the REST body (snake_case JSON) validated by the back against the
 * same DTOs as REST; results are the REST response body. Off-ramps,
 * dispersions, transfers, API key rotation and team changes require a recent
 * sign-in and a second factor: `graphqlClient` already turns `REAUTH_REQUIRED`
 * into the re-authentication prompt and one retry.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';

import type {
  TenantAdminInvitation,
  TenantApiKeyRotation,
  TenantCreateCustomerInput,
  TenantCreateWalletInput,
  TenantCustomer,
  TenantDispersionInput,
  TenantOffRampInput,
  TenantPaymentLink,
  TenantPaymentLinkInput,
  TenantRequirement,
  TenantRequirementAnswer,
  TenantRetryKycInput,
  TenantTeamMember,
  TenantTransactionCommandResult,
  TenantTransferInput,
  TenantWallet,
} from '@/graphql/types/tenant';

// ── Customers ──────────────────────────────────────────────────────────────

export interface TenantCreateCustomerMutation {
  tenant_createCustomer: TenantCustomer;
}

export const TenantCreateCustomerDocument = parse(/* GraphQL */ `
  mutation TenantCreateCustomer($input: JSONObject!) {
    tenant_createCustomer(input: $input)
  }
`) as unknown as TypedDocumentNode<
  TenantCreateCustomerMutation,
  { input: TenantCreateCustomerInput }
>;

export interface TenantRetryCustomerKycMutation {
  tenant_retryCustomerKyc: Partial<TenantCustomer> & { kyc_link?: string | null };
}

export const TenantRetryCustomerKycDocument = parse(/* GraphQL */ `
  mutation TenantRetryCustomerKyc($id: String!, $input: JSONObject!) {
    tenant_retryCustomerKyc(id: $id, input: $input)
  }
`) as unknown as TypedDocumentNode<
  TenantRetryCustomerKycMutation,
  { id: string; input: TenantRetryKycInput }
>;

export interface TenantSubmitCustomerRequirementMutation {
  tenant_submitCustomerRequirement: TenantRequirement;
}

export const TenantSubmitCustomerRequirementDocument = parse(/* GraphQL */ `
  mutation TenantSubmitCustomerRequirement(
    $id: String!
    $requirement_id: String!
    $input: JSONObject!
  ) {
    tenant_submitCustomerRequirement(id: $id, requirement_id: $requirement_id, input: $input)
  }
`) as unknown as TypedDocumentNode<
  TenantSubmitCustomerRequirementMutation,
  { id: string; requirement_id: string; input: TenantRequirementAnswer }
>;

// ── Wallets ────────────────────────────────────────────────────────────────

export interface TenantCreateWalletMutation {
  tenant_createWallet: TenantWallet;
}

export const TenantCreateWalletDocument = parse(/* GraphQL */ `
  mutation TenantCreateWallet($input: JSONObject!) {
    tenant_createWallet(input: $input)
  }
`) as unknown as TypedDocumentNode<TenantCreateWalletMutation, { input: TenantCreateWalletInput }>;

// ── Transactions ───────────────────────────────────────────────────────────

export interface TenantCreateOffRampMutation {
  tenant_createOffRamp: TenantTransactionCommandResult;
}

export const TenantCreateOffRampDocument = parse(/* GraphQL */ `
  mutation TenantCreateOffRamp($input: JSONObject!) {
    tenant_createOffRamp(input: $input)
  }
`) as unknown as TypedDocumentNode<TenantCreateOffRampMutation, { input: TenantOffRampInput }>;

export interface TenantCreateDispersionMutation {
  tenant_createDispersion: TenantTransactionCommandResult;
}

export const TenantCreateDispersionDocument = parse(/* GraphQL */ `
  mutation TenantCreateDispersion($input: JSONObject!) {
    tenant_createDispersion(input: $input)
  }
`) as unknown as TypedDocumentNode<
  TenantCreateDispersionMutation,
  { input: TenantDispersionInput }
>;

export interface TenantCreateTransferMutation {
  tenant_createTransfer: TenantTransactionCommandResult;
}

export const TenantCreateTransferDocument = parse(/* GraphQL */ `
  mutation TenantCreateTransfer($input: JSONObject!) {
    tenant_createTransfer(input: $input)
  }
`) as unknown as TypedDocumentNode<TenantCreateTransferMutation, { input: TenantTransferInput }>;

export interface TenantCreatePaymentLinkMutation {
  tenant_createPaymentLink: TenantPaymentLink;
}

export const TenantCreatePaymentLinkDocument = parse(/* GraphQL */ `
  mutation TenantCreatePaymentLink($input: JSONObject!) {
    tenant_createPaymentLink(input: $input)
  }
`) as unknown as TypedDocumentNode<
  TenantCreatePaymentLinkMutation,
  { input: TenantPaymentLinkInput }
>;

// ── API key ────────────────────────────────────────────────────────────────

export interface TenantRegenerateApiKeyMutation {
  tenant_regenerateApiKey: TenantApiKeyRotation;
}

export interface TenantRegenerateApiKeyMutationVariables {
  /** Minutes the previous key keeps working (default 60, 0 = immediately, max 10080). */
  graceMinutes?: number;
  expiresAt?: string;
  scopes?: string[];
}

export const TenantRegenerateApiKeyDocument = parse(/* GraphQL */ `
  mutation TenantRegenerateApiKey($graceMinutes: Int, $expiresAt: DateTime, $scopes: [String!]) {
    tenant_regenerateApiKey(graceMinutes: $graceMinutes, expiresAt: $expiresAt, scopes: $scopes) {
      api_key
      api_key_prefix
    }
  }
`) as unknown as TypedDocumentNode<
  TenantRegenerateApiKeyMutation,
  TenantRegenerateApiKeyMutationVariables
>;

// ── Team ───────────────────────────────────────────────────────────────────

export interface TenantInviteAdminMutation {
  tenant_inviteAdmin: TenantAdminInvitation;
}

export const TenantInviteAdminDocument = parse(/* GraphQL */ `
  mutation TenantInviteAdmin($input: InviteTenantAdminInput!) {
    tenant_inviteAdmin(input: $input) {
      member {
        id
        email
        first_name
        last_name
        created_at
      }
      password_setup_link
    }
  }
`) as unknown as TypedDocumentNode<TenantInviteAdminMutation, { input: { email: string } }>;

export interface TenantRemoveAdminMutation {
  tenant_removeAdmin: TenantTeamMember;
}

export const TenantRemoveAdminDocument = parse(/* GraphQL */ `
  mutation TenantRemoveAdmin($user_id: String!) {
    tenant_removeAdmin(user_id: $user_id) {
      id
      email
      first_name
      last_name
      created_at
    }
  }
`) as unknown as TypedDocumentNode<TenantRemoveAdminMutation, { user_id: string }>;
