/**
 * admin-loopay beneficiary review mutations.
 *
 * `adminLoopay_reviewBeneficiary` carries `@RequiresRecentAuth`;
 * `adminLoopay_linkBeneficiaryProviderId` does not.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import type {
  AdminBeneficiaryEntity,
  AdminBeneficiaryProviderLink,
  AdminBeneficiaryReviewResponse,
  AdminLinkBeneficiaryProviderInput,
  AdminReviewBeneficiaryInput,
} from '@/graphql/types/admin-loopay';

export interface ReviewBeneficiaryMutation {
  adminLoopay_reviewBeneficiary: AdminBeneficiaryReviewResponse;
}

export interface ReviewBeneficiaryMutationVariables {
  id: string;
  input: AdminReviewBeneficiaryInput;
}

export const ReviewBeneficiaryDocument = parse(/* GraphQL */ `
  mutation AdminLoopayReviewBeneficiary(
    $id: ID!
    $input: ReviewBeneficiaryInput!
  ) {
    adminLoopay_reviewBeneficiary(id: $id, input: $input) {
      id
      customer_id
      previous_status
      status
      review_reason
      reviewed_by
      reviewed_at
    }
  }
`) as unknown as TypedDocumentNode<
  ReviewBeneficiaryMutation,
  ReviewBeneficiaryMutationVariables
>;

export interface LinkBeneficiaryProviderIdMutation {
  adminLoopay_linkBeneficiaryProviderId: AdminBeneficiaryProviderLink;
}

export interface LinkBeneficiaryProviderIdMutationVariables {
  id: string;
  input: AdminLinkBeneficiaryProviderInput;
}

export const LinkBeneficiaryProviderIdDocument = parse(/* GraphQL */ `
  mutation AdminLoopayLinkBeneficiaryProviderId(
    $id: ID!
    $input: LinkBeneficiaryProviderInput!
  ) {
    adminLoopay_linkBeneficiaryProviderId(id: $id, input: $input) {
      id
      customer_id
      provider_id
      provider_code
      provider_beneficiary_id
      linked_at
    }
  }
`) as unknown as TypedDocumentNode<
  LinkBeneficiaryProviderIdMutation,
  LinkBeneficiaryProviderIdMutationVariables
>;

export interface DeactivateBeneficiaryMutation {
  adminLoopay_deactivateBeneficiary: AdminBeneficiaryEntity;
}

export interface DeactivateBeneficiaryMutationVariables {
  id: string;
}

export const DeactivateBeneficiaryDocument = parse(/* GraphQL */ `
  mutation AdminLoopayDeactivateBeneficiary($id: ID!) {
    adminLoopay_deactivateBeneficiary(id: $id) {
      id
      customerId
      clientId
      customerExternalId
      customerEmail
      railId
      railCode
      railName
      railCountry
      providerId
      providerCode
      providerName
      relationship
      holderType
      holderName
      holderTaxId
      currency
      bankDetails
      alias
      status
      isFavorite
      providerBeneficiaryId
      providerMetadata
      createdAt
      updatedAt
    }
  }
`) as unknown as TypedDocumentNode<
  DeactivateBeneficiaryMutation,
  DeactivateBeneficiaryMutationVariables
>;

export interface ReactivateBeneficiaryMutation {
  adminLoopay_reactivateBeneficiary: AdminBeneficiaryEntity;
}

export interface ReactivateBeneficiaryMutationVariables {
  id: string;
}

export const ReactivateBeneficiaryDocument = parse(/* GraphQL */ `
  mutation AdminLoopayReactivateBeneficiary($id: ID!) {
    adminLoopay_reactivateBeneficiary(id: $id) {
      id
      customerId
      clientId
      customerExternalId
      customerEmail
      railId
      railCode
      railName
      railCountry
      providerId
      providerCode
      providerName
      relationship
      holderType
      holderName
      holderTaxId
      currency
      bankDetails
      alias
      status
      isFavorite
      providerBeneficiaryId
      providerMetadata
      createdAt
      updatedAt
    }
  }
`) as unknown as TypedDocumentNode<
  ReactivateBeneficiaryMutation,
  ReactivateBeneficiaryMutationVariables
>;
