/**
 * admin-loopay client management mutations (LOOPAY_ADMIN / PLATFORM_ADMIN).
 *
 * `adminLoopay_createClient`, `adminLoopay_updateClient`,
 * `adminLoopay_regenerateClientApiKey` and `adminLoopay_revokeClientApiKey`.
 * The document names are suffixed `Management` to avoid barrel export
 * collisions with the platform-config `UpdateClientDocument` (which selects
 * only `CLIENT_CONFIG_FIELDS`).
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import type {
  AdminClientApiKeyResponse,
  AdminClientEntity,
  AdminCreateClientInput,
  AdminUpdateClientInput,
} from '@/graphql/types/admin-loopay';
import type { TenantAdminInvitation } from '@/graphql/types/tenant';

const CLIENT_ENTITY_FIELDS = `
  id
  name
  email
  tax_id
  tax_id_type_id
  country
  status
  kyc_status
  api_key_prefix
  config
  metadata
  created_at
  updated_at
`;

export interface CreateClientMutation {
  adminLoopay_createClient: AdminClientEntity;
}

export interface CreateClientMutationVariables {
  input: AdminCreateClientInput;
}

export const CreateClientDocument = parse(/* GraphQL */ `
  mutation AdminLoopayCreateClient($input: CreateClientInput!) {
    adminLoopay_createClient(input: $input) {
      ${CLIENT_ENTITY_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<CreateClientMutation, CreateClientMutationVariables>;

export interface UpdateClientManagementMutation {
  adminLoopay_updateClient: AdminClientEntity;
}

export interface UpdateClientManagementMutationVariables {
  id: string;
  input: AdminUpdateClientInput;
}

export const UpdateClientManagementDocument = parse(/* GraphQL */ `
  mutation AdminLoopayUpdateClientManagement(
    $id: String!
    $input: UpdateClientInput!
  ) {
    adminLoopay_updateClient(id: $id, input: $input) {
      ${CLIENT_ENTITY_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  UpdateClientManagementMutation,
  UpdateClientManagementMutationVariables
>;

export interface RegenerateClientApiKeyMutation {
  adminLoopay_regenerateClientApiKey: AdminClientApiKeyResponse;
}

export interface RegenerateClientApiKeyMutationVariables {
  clientId: string;
}

export const RegenerateClientApiKeyDocument = parse(/* GraphQL */ `
  mutation AdminLoopayRegenerateClientApiKey($clientId: String!) {
    adminLoopay_regenerateClientApiKey(clientId: $clientId) {
      api_key
      api_key_prefix
    }
  }
`) as unknown as TypedDocumentNode<
  RegenerateClientApiKeyMutation,
  RegenerateClientApiKeyMutationVariables
>;

export interface RevokeClientApiKeyMutation {
  adminLoopay_revokeClientApiKey: AdminClientEntity;
}

export interface RevokeClientApiKeyMutationVariables {
  clientId: string;
}

export const RevokeClientApiKeyDocument = parse(/* GraphQL */ `
  mutation AdminLoopayRevokeClientApiKey($clientId: String!) {
    adminLoopay_revokeClientApiKey(clientId: $clientId) {
      ${CLIENT_ENTITY_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<RevokeClientApiKeyMutation, RevokeClientApiKeyMutationVariables>;

// ── Tenant admin invite (epic 2026-11 S4, LOOPAY_ADMIN / OPS_COMMERCIAL) ──

export interface InviteTenantAdminMutation {
  adminLoopay_inviteTenantAdmin: TenantAdminInvitation;
}

export interface InviteTenantAdminMutationVariables {
  clientId: string;
  input: { email: string };
}

/**
 * Creates a client's tenant admin (recent sign-in on the back). The
 * `password_setup_link` is returned once and never stored; null when the
 * Firebase account already has a password. 409 `TENANT_ADMIN_EMAIL_TAKEN`
 * when the email has another account here.
 */
export const InviteTenantAdminDocument = parse(/* GraphQL */ `
  mutation AdminLoopayInviteTenantAdmin($clientId: String!, $input: InviteTenantAdminInput!) {
    adminLoopay_inviteTenantAdmin(clientId: $clientId, input: $input) {
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
`) as unknown as TypedDocumentNode<InviteTenantAdminMutation, InviteTenantAdminMutationVariables>;
