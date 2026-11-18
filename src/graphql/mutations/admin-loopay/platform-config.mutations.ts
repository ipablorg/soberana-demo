/**
 * admin-loopay platform config mutations (PLATFORM_ADMIN only).
 *
 * Every mutation here carries `@RequiresRecentAuth` on the backend; the
 * re-auth prompt and retry are handled globally by `withRecentAuth`.
 * Mirrors `src/modules/admin-loopay/{catalog,clients,platform}/**`.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import {
  CLIENT_CONFIG_FIELDS,
  CLIENT_PROVIDER_RAIL_FIELDS,
  PAYMENT_RAIL_FIELDS,
  PROVIDER_FIELDS,
  PROVIDER_PAYMENT_RAIL_FIELDS,
} from '@/graphql/queries/admin-loopay/platform-config.queries';
import type {
  AdminClient,
  AdminClientProviderRail,
  AdminCreateClientProviderRailInput,
  AdminCreatePaymentRailInput,
  AdminCreateProviderInput,
  AdminCreateProviderPaymentRailInput,
  AdminCutoverDeactivateDeadProvidersInput,
  AdminCutoverDeadProviderCatalogResult,
  AdminCutoverDeadProvidersResult,
  AdminCutoverFlagLegacyTransactionsInput,
  AdminCutoverFlagLegacyTransactionsResult,
  AdminPaymentRail,
  AdminProvider,
  AdminProviderPaymentRail,
  AdminUpdateClientInput,
  AdminUpdateClientProviderRailInput,
  AdminUpdatePaymentRailInput,
  AdminUpdateProviderInput,
  AdminUpdateProviderPaymentRailInput,
} from '@/graphql/types/admin-loopay';

/* Providers ---------------------------------------------------------------- */

export interface CreateProviderMutation {
  adminLoopay_createProvider: AdminProvider;
}

export interface CreateProviderMutationVariables {
  input: AdminCreateProviderInput;
}

export const CreateProviderDocument = parse(/* GraphQL */ `
  mutation AdminLoopayCreateProvider($input: CreateProviderInput!) {
    adminLoopay_createProvider(input: $input) {
      ${PROVIDER_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  CreateProviderMutation,
  CreateProviderMutationVariables
>;

export interface UpdateProviderMutation {
  adminLoopay_updateProvider: AdminProvider;
}

export interface UpdateProviderMutationVariables {
  id: string;
  input: AdminUpdateProviderInput;
}

export const UpdateProviderDocument = parse(/* GraphQL */ `
  mutation AdminLoopayUpdateProvider($id: String!, $input: UpdateProviderInput!) {
    adminLoopay_updateProvider(id: $id, input: $input) {
      ${PROVIDER_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  UpdateProviderMutation,
  UpdateProviderMutationVariables
>;

/* Payment rails ------------------------------------------------------------ */

export interface CreatePaymentRailMutation {
  adminLoopay_createPaymentRail: AdminPaymentRail;
}

export interface CreatePaymentRailMutationVariables {
  input: AdminCreatePaymentRailInput;
}

export const CreatePaymentRailDocument = parse(/* GraphQL */ `
  mutation AdminLoopayCreatePaymentRail($input: CreatePaymentRailInput!) {
    adminLoopay_createPaymentRail(input: $input) {
      ${PAYMENT_RAIL_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  CreatePaymentRailMutation,
  CreatePaymentRailMutationVariables
>;

export interface UpdatePaymentRailMutation {
  adminLoopay_updatePaymentRail: AdminPaymentRail;
}

export interface UpdatePaymentRailMutationVariables {
  id: string;
  input: AdminUpdatePaymentRailInput;
}

export const UpdatePaymentRailDocument = parse(/* GraphQL */ `
  mutation AdminLoopayUpdatePaymentRail(
    $id: String!
    $input: UpdatePaymentRailInput!
  ) {
    adminLoopay_updatePaymentRail(id: $id, input: $input) {
      ${PAYMENT_RAIL_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  UpdatePaymentRailMutation,
  UpdatePaymentRailMutationVariables
>;

/* Provider <-> rail -------------------------------------------------------- */

export interface CreateProviderPaymentRailMutation {
  adminLoopay_createProviderPaymentRail: AdminProviderPaymentRail;
}

export interface CreateProviderPaymentRailMutationVariables {
  input: AdminCreateProviderPaymentRailInput;
}

export const CreateProviderPaymentRailDocument = parse(/* GraphQL */ `
  mutation AdminLoopayCreateProviderPaymentRail(
    $input: CreateProviderPaymentRailInput!
  ) {
    adminLoopay_createProviderPaymentRail(input: $input) {
      ${PROVIDER_PAYMENT_RAIL_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  CreateProviderPaymentRailMutation,
  CreateProviderPaymentRailMutationVariables
>;

export interface UpdateProviderPaymentRailMutation {
  adminLoopay_updateProviderPaymentRail: AdminProviderPaymentRail;
}

export interface UpdateProviderPaymentRailMutationVariables {
  id: string;
  input: AdminUpdateProviderPaymentRailInput;
}

export const UpdateProviderPaymentRailDocument = parse(/* GraphQL */ `
  mutation AdminLoopayUpdateProviderPaymentRail(
    $id: String!
    $input: UpdateProviderPaymentRailInput!
  ) {
    adminLoopay_updateProviderPaymentRail(id: $id, input: $input) {
      ${PROVIDER_PAYMENT_RAIL_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  UpdateProviderPaymentRailMutation,
  UpdateProviderPaymentRailMutationVariables
>;

/* Client <-> provider <-> rail --------------------------------------------- */

export interface CreateClientProviderRailMutation {
  adminLoopay_createClientProviderRail: AdminClientProviderRail;
}

export interface CreateClientProviderRailMutationVariables {
  input: AdminCreateClientProviderRailInput;
}

export const CreateClientProviderRailDocument = parse(/* GraphQL */ `
  mutation AdminLoopayCreateClientProviderRail(
    $input: CreateClientProviderRailInput!
  ) {
    adminLoopay_createClientProviderRail(input: $input) {
      ${CLIENT_PROVIDER_RAIL_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  CreateClientProviderRailMutation,
  CreateClientProviderRailMutationVariables
>;

export interface UpdateClientProviderRailMutation {
  adminLoopay_updateClientProviderRail: AdminClientProviderRail;
}

export interface UpdateClientProviderRailMutationVariables {
  id: string;
  input: AdminUpdateClientProviderRailInput;
}

export const UpdateClientProviderRailDocument = parse(/* GraphQL */ `
  mutation AdminLoopayUpdateClientProviderRail(
    $id: String!
    $input: UpdateClientProviderRailInput!
  ) {
    adminLoopay_updateClientProviderRail(id: $id, input: $input) {
      ${CLIENT_PROVIDER_RAIL_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  UpdateClientProviderRailMutation,
  UpdateClientProviderRailMutationVariables
>;

/* Client config ------------------------------------------------------------ */

export interface UpdateClientMutation {
  adminLoopay_updateClient: AdminClient;
}

export interface UpdateClientMutationVariables {
  id: string;
  input: AdminUpdateClientInput;
}

export const UpdateClientDocument = parse(/* GraphQL */ `
  mutation AdminLoopayUpdateClient($id: String!, $input: UpdateClientInput!) {
    adminLoopay_updateClient(id: $id, input: $input) {
      ${CLIENT_CONFIG_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  UpdateClientMutation,
  UpdateClientMutationVariables
>;

/* Cutover ------------------------------------------------------------------ */

export interface CutoverDeactivateDeadProvidersMutation {
  adminLoopay_cutoverDeactivateDeadProviders: AdminCutoverDeadProvidersResult;
}

export interface CutoverDeactivateDeadProvidersMutationVariables {
  input: AdminCutoverDeactivateDeadProvidersInput;
}

export const CutoverDeactivateDeadProvidersDocument = parse(/* GraphQL */ `
  mutation AdminLoopayCutoverDeactivateDeadProviders(
    $input: AdminCutoverDeactivateDeadProvidersInput!
  ) {
    adminLoopay_cutoverDeactivateDeadProviders(input: $input) {
      dead_provider_codes
      total_deactivated
      clients {
        client_id
        deactivated_junctions
      }
    }
  }
`) as unknown as TypedDocumentNode<
  CutoverDeactivateDeadProvidersMutation,
  CutoverDeactivateDeadProvidersMutationVariables
>;

export interface CutoverDeactivateDeadProviderCatalogMutation {
  adminLoopay_cutoverDeactivateDeadProviderCatalog: AdminCutoverDeadProviderCatalogResult;
}

export interface CutoverDeactivateDeadProviderCatalogMutationVariables {
  reason: string;
}

export const CutoverDeactivateDeadProviderCatalogDocument = parse(/* GraphQL */ `
  mutation AdminLoopayCutoverDeactivateDeadProviderCatalog($reason: String!) {
    adminLoopay_cutoverDeactivateDeadProviderCatalog(reason: $reason) {
      provider_codes
      deactivated_providers
      deactivated_provider_payment_rails
    }
  }
`) as unknown as TypedDocumentNode<
  CutoverDeactivateDeadProviderCatalogMutation,
  CutoverDeactivateDeadProviderCatalogMutationVariables
>;

export interface CutoverFlagLegacyTransactionsMutation {
  adminLoopay_cutoverFlagLegacyTransactions: AdminCutoverFlagLegacyTransactionsResult;
}

export interface CutoverFlagLegacyTransactionsMutationVariables {
  input: AdminCutoverFlagLegacyTransactionsInput;
}

export const CutoverFlagLegacyTransactionsDocument = parse(/* GraphQL */ `
  mutation AdminLoopayCutoverFlagLegacyTransactions(
    $input: AdminCutoverFlagLegacyTransactionsInput!
  ) {
    adminLoopay_cutoverFlagLegacyTransactions(input: $input) {
      dry_run
      count
      created_before
    }
  }
`) as unknown as TypedDocumentNode<
  CutoverFlagLegacyTransactionsMutation,
  CutoverFlagLegacyTransactionsMutationVariables
>;
