/**
 * admin-loopay recaudos mutations.
 *
 * Approve / reject / reverse all carry `@RequiresRecentAuth` on the backend.
 * `adminLoopay_createRecaudo` does not.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import type {
  AdminApproveRecaudoInput,
  AdminCreateRecaudoInput,
  AdminRecaudo,
  AdminRejectRecaudoInput,
  AdminReverseRecaudoInput,
} from '@/graphql/types/admin-loopay';

const RECAUDO_FIELDS = `
  id
  reference_code
  customer_id
  customer_email
  client_id
  wallet_id
  amount
  currency
  status
  provider_code
  provider_event_id
  source
  reference
  created_at
  review_reason
  reviewed_at
`;

export interface CreateRecaudoMutation {
  adminLoopay_createRecaudo: AdminRecaudo;
}

export interface CreateRecaudoMutationVariables {
  input: AdminCreateRecaudoInput;
}

export const CreateRecaudoDocument = parse(/* GraphQL */ `
  mutation AdminLoopayCreateRecaudo($input: CreateRecaudoInput!) {
    adminLoopay_createRecaudo(input: $input) {
      ${RECAUDO_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  CreateRecaudoMutation,
  CreateRecaudoMutationVariables
>;

export interface ApproveRecaudoMutation {
  adminLoopay_approveRecaudo: AdminRecaudo;
}

export interface ApproveRecaudoMutationVariables {
  id: string;
  input: AdminApproveRecaudoInput;
}

export const ApproveRecaudoDocument = parse(/* GraphQL */ `
  mutation AdminLoopayApproveRecaudo($id: ID!, $input: ApproveRecaudoInput!) {
    adminLoopay_approveRecaudo(id: $id, input: $input) {
      ${RECAUDO_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  ApproveRecaudoMutation,
  ApproveRecaudoMutationVariables
>;

export interface RejectRecaudoMutation {
  adminLoopay_rejectRecaudo: AdminRecaudo;
}

export interface RejectRecaudoMutationVariables {
  id: string;
  input: AdminRejectRecaudoInput;
}

export const RejectRecaudoDocument = parse(/* GraphQL */ `
  mutation AdminLoopayRejectRecaudo($id: ID!, $input: RejectRecaudoInput!) {
    adminLoopay_rejectRecaudo(id: $id, input: $input) {
      ${RECAUDO_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  RejectRecaudoMutation,
  RejectRecaudoMutationVariables
>;

export interface ReverseRecaudoMutation {
  adminLoopay_reverseRecaudo: AdminRecaudo;
}

export interface ReverseRecaudoMutationVariables {
  id: string;
  input: AdminReverseRecaudoInput;
}

export const ReverseRecaudoDocument = parse(/* GraphQL */ `
  mutation AdminLoopayReverseRecaudo($id: ID!, $input: ReverseRecaudoInput!) {
    adminLoopay_reverseRecaudo(id: $id, input: $input) {
      ${RECAUDO_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  ReverseRecaudoMutation,
  ReverseRecaudoMutationVariables
>;
