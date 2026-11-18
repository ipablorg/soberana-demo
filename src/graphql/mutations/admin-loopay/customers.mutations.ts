/**
 * admin-loopay customer management mutations (LOOPAY_ADMIN).
 *
 * `adminLoopay_updateCustomerStatus` changes a customer's lifecycle status
 * (ACTIVE / SUSPENDED / FROZEN / PENALIZED). The response is snake_case,
 * matching `AdminCustomerStatusResponseEntity` on the backend.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import type {
  AdminCustomerStatusResponse,
  AdminUpdateCustomerStatusInput,
} from '@/graphql/types/admin-loopay';

export interface UpdateCustomerStatusMutation {
  adminLoopay_updateCustomerStatus: AdminCustomerStatusResponse;
}

export interface UpdateCustomerStatusMutationVariables {
  customerId: string;
  input: AdminUpdateCustomerStatusInput;
}

export const UpdateCustomerStatusDocument = parse(/* GraphQL */ `
  mutation AdminLoopayUpdateCustomerStatus(
    $customerId: String!
    $input: AdminUpdateCustomerStatusInput!
  ) {
    adminLoopay_updateCustomerStatus(customerId: $customerId, input: $input) {
      id
      previous_status
      current_status
      reason
      updated_at
      changed_by
    }
  }
`) as unknown as TypedDocumentNode<
  UpdateCustomerStatusMutation,
  UpdateCustomerStatusMutationVariables
>;
