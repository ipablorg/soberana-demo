/**
 * admin-loopay client management queries.
 *
 * `adminLoopay_listClients` returns `PaginatedClientsResponse` and
 * `adminLoopay_getClient` returns the full `ClientGraphqlEntity` (snake_case).
 * Both are LOOPAY_ADMIN / PLATFORM_ADMIN scope.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import type {
  AdminClientEntity,
  AdminClientFiltersInput,
  AdminClientPaginated,
  AdminPaginationInput,
} from '@/graphql/types/admin-loopay';

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
  api_key_expires_at
  api_key_rotated_at
  config
  metadata
  created_at
  updated_at
`;

/** `AdminClientEntity` plus the API-key lifecycle fields the backend returns. */
export type AdminClientWithKeyInfo = AdminClientEntity & {
  api_key_expires_at?: string | null;
  api_key_rotated_at?: string | null;
};

export interface ListClientsQuery {
  adminLoopay_listClients: AdminClientPaginated;
}

export interface ListClientsQueryVariables {
  where?: AdminClientFiltersInput;
  pagination?: AdminPaginationInput;
}

export const ListClientsDocument = parse(/* GraphQL */ `
  query AdminLoopayListClients(
    $where: ClientFiltersInput
    $pagination: PaginationInput
  ) {
    adminLoopay_listClients(where: $where, pagination: $pagination) {
      data {
        ${CLIENT_ENTITY_FIELDS}
      }
      total
      has_more
    }
  }
`) as unknown as TypedDocumentNode<
  ListClientsQuery,
  ListClientsQueryVariables
>;

export interface GetClientManagementQuery {
  adminLoopay_getClient: AdminClientWithKeyInfo;
}

export interface GetClientManagementQueryVariables {
  id: string;
}

export const GetClientManagementDocument = parse(/* GraphQL */ `
  query AdminLoopayGetClientManagement($id: String!) {
    adminLoopay_getClient(id: $id) {
      ${CLIENT_ENTITY_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  GetClientManagementQuery,
  GetClientManagementQueryVariables
>;

export interface AdminTaxIdTypeOption {
  id: string;
  name: string;
  countries: string[] | null;
}

export interface ListTaxIdTypesQuery {
  adminLoopay_listTaxIdTypes: AdminTaxIdTypeOption[];
}

export type ListTaxIdTypesQueryVariables = Record<string, never>;

export const ListTaxIdTypesDocument = parse(/* GraphQL */ `
  query AdminLoopayListTaxIdTypes {
    adminLoopay_listTaxIdTypes {
      id
      name
      countries
    }
  }
`) as unknown as TypedDocumentNode<
  ListTaxIdTypesQuery,
  ListTaxIdTypesQueryVariables
>;
