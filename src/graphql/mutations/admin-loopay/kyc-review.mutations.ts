/**
 * admin-loopay KYC review mutations.
 *
 * `adminLoopay_reviewKyc` carries `@RequiresRecentAuth` on the backend; the
 * 403 `REAUTH_REQUIRED` it can answer with is handled globally by the
 * `withRecentAuth` wrapper around `graphqlClient.request`, so these hooks only
 * have to let the error propagate.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import type {
  AdminKycReviewResponse,
  AdminRequestKycAdditionalInfoInput,
  AdminReviewKycInput,
} from '@/graphql/types/admin-loopay';

const KYC_REVIEW_RESULT_FIELDS = `
  customer_id
  previous_kyc_status
  kyc_status
  customer_status
  wallet {
    id
    chain
    currency
    address
  }
  wallet_error
  reviewed_by
  reviewed_at
`;

export interface ReviewKycMutation {
  adminLoopay_reviewKyc: AdminKycReviewResponse;
}

export interface ReviewKycMutationVariables {
  customerId: string;
  input: AdminReviewKycInput;
}

export const ReviewKycDocument = parse(/* GraphQL */ `
  mutation AdminLoopayReviewKyc($customerId: ID!, $input: ReviewKycInput!) {
    adminLoopay_reviewKyc(customerId: $customerId, input: $input) {
      ${KYC_REVIEW_RESULT_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  ReviewKycMutation,
  ReviewKycMutationVariables
>;

export interface RequestKycAdditionalInfoMutation {
  adminLoopay_requestKycAdditionalInfo: AdminKycReviewResponse;
}

export interface RequestKycAdditionalInfoMutationVariables {
  customerId: string;
  input: AdminRequestKycAdditionalInfoInput;
}

export const RequestKycAdditionalInfoDocument = parse(/* GraphQL */ `
  mutation AdminLoopayRequestKycAdditionalInfo(
    $customerId: ID!
    $input: RequestKycAdditionalInfoInput!
  ) {
    adminLoopay_requestKycAdditionalInfo(
      customerId: $customerId
      input: $input
    ) {
      ${KYC_REVIEW_RESULT_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  RequestKycAdditionalInfoMutation,
  RequestKycAdditionalInfoMutationVariables
>;
