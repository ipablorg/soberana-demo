/**
 * admin-loopay dispersiones mutations.
 *
 * All four carry `@RequiresRecentAuth` on the backend.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import type {
  AdminApproveDispersionInput,
  AdminCompleteDispersionInput,
  AdminDispersion,
  AdminFailDispersionInput,
  AdminRejectDispersionInput,
} from '@/graphql/types/admin-loopay';

/** Mirrors `CancelDispersionInput` (v2 only). */
export interface AdminCancelDispersionInput {
  reason: string;
  return_reference?: string;
}

const DISPERSION_FIELDS = `
  id
  reference_code
  customer_id
  customer_email
  client_id
  wallet_id
  amount
  currency
  status
  held_amount
  funds_location
  beneficiary {
    id
    holder_name
    rail_code
    currency
    bank_details
  }
  created_at
  review_reason
  reviewed_at
  quote_rate
  quote_source_amount
  quote_source_currency
  quote_target_amount
  quote_target_currency
  fee_amount
  fee_source
  fee_currency
  settlement_amount
  settlement_currency
  settlement_rate
  settlement_bank_rate
  settlement_fees
  settlement_external_reference
`;

export interface ApproveDispersionMutation {
  adminLoopay_approveDispersion: AdminDispersion;
}

export interface ApproveDispersionMutationVariables {
  id: string;
  input: AdminApproveDispersionInput;
}

export const ApproveDispersionDocument = parse(/* GraphQL */ `
  mutation AdminLoopayApproveDispersion(
    $id: ID!
    $input: ApproveDispersionInput!
  ) {
    adminLoopay_approveDispersion(id: $id, input: $input) {
      ${DISPERSION_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  ApproveDispersionMutation,
  ApproveDispersionMutationVariables
>;

export interface CompleteDispersionMutation {
  adminLoopay_completeDispersion: AdminDispersion;
}

export interface CompleteDispersionMutationVariables {
  id: string;
  input: AdminCompleteDispersionInput;
}

export const CompleteDispersionDocument = parse(/* GraphQL */ `
  mutation AdminLoopayCompleteDispersion(
    $id: ID!
    $input: CompleteDispersionInput!
  ) {
    adminLoopay_completeDispersion(id: $id, input: $input) {
      ${DISPERSION_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  CompleteDispersionMutation,
  CompleteDispersionMutationVariables
>;

export interface RejectDispersionMutation {
  adminLoopay_rejectDispersion: AdminDispersion;
}

export interface RejectDispersionMutationVariables {
  id: string;
  input: AdminRejectDispersionInput;
}

export const RejectDispersionDocument = parse(/* GraphQL */ `
  mutation AdminLoopayRejectDispersion(
    $id: ID!
    $input: RejectDispersionInput!
  ) {
    adminLoopay_rejectDispersion(id: $id, input: $input) {
      ${DISPERSION_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  RejectDispersionMutation,
  RejectDispersionMutationVariables
>;

export interface FailDispersionMutation {
  adminLoopay_failDispersion: AdminDispersion;
}

export interface FailDispersionMutationVariables {
  id: string;
  input: AdminFailDispersionInput;
}

export const FailDispersionDocument = parse(/* GraphQL */ `
  mutation AdminLoopayFailDispersion($id: ID!, $input: FailDispersionInput!) {
    adminLoopay_failDispersion(id: $id, input: $input) {
      ${DISPERSION_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  FailDispersionMutation,
  FailDispersionMutationVariables
>;

export interface CancelDispersionMutation {
  adminLoopay_cancelDispersion: AdminDispersion;
}

export interface CancelDispersionMutationVariables {
  id: string;
  input: AdminCancelDispersionInput;
}

export const CancelDispersionDocument = parse(/* GraphQL */ `
  mutation AdminLoopayCancelDispersion(
    $id: ID!
    $input: CancelDispersionInput!
  ) {
    adminLoopay_cancelDispersion(id: $id, input: $input) {
      ${DISPERSION_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  CancelDispersionMutation,
  CancelDispersionMutationVariables
>;

/**
 * #413 retries of an approved withdrawal (recent sign-in and second factor):
 * the BLOCKED Mesta placement or funding, and the custody return of a
 * withdrawal still RETURNING whose last attempt failed or never started.
 */
export interface RetryDispersionFundingMutation {
  adminLoopay_retryDispersionFunding: AdminDispersion;
}

export interface RetryDispersionFundingMutationVariables {
  id: string;
}

export const RetryDispersionFundingDocument = parse(/* GraphQL */ `
  mutation AdminLoopayRetryDispersionFunding($id: ID!) {
    adminLoopay_retryDispersionFunding(id: $id) {
      ${DISPERSION_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  RetryDispersionFundingMutation,
  RetryDispersionFundingMutationVariables
>;

export interface RetryDispersionReturnMutation {
  adminLoopay_retryDispersionReturn: AdminDispersion;
}

export interface RetryDispersionReturnMutationVariables {
  id: string;
}

export const RetryDispersionReturnDocument = parse(/* GraphQL */ `
  mutation AdminLoopayRetryDispersionReturn($id: ID!) {
    adminLoopay_retryDispersionReturn(id: $id) {
      ${DISPERSION_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  RetryDispersionReturnMutation,
  RetryDispersionReturnMutationVariables
>;
