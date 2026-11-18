/**
 * admin-loopay beneficiaries review queue query.
 *
 * Mirrors `src/modules/admin-loopay/beneficiaries/**` on the backend.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import type {
  AdminBeneficiaryFiltersInput,
  AdminBeneficiaryQueueFilters,
  AdminBeneficiaryQueueItem,
  AdminBeneficiaryEntity,
  AdminPaginated,
  AdminPaginationInput,
} from '@/graphql/types/admin-loopay';

export interface ListPendingBeneficiariesQuery {
  adminLoopay_listPendingBeneficiaries: AdminPaginated<AdminBeneficiaryQueueItem>;
}

export interface ListPendingBeneficiariesQueryVariables {
  filter?: AdminBeneficiaryQueueFilters;
  pagination?: AdminPaginationInput;
}

export const ListPendingBeneficiariesDocument = parse(/* GraphQL */ `
  query AdminLoopayListPendingBeneficiaries(
    $filter: BeneficiaryQueueFiltersInput
    $pagination: PaginationInput
  ) {
    adminLoopay_listPendingBeneficiaries(
      filter: $filter
      pagination: $pagination
    ) {
      data {
        id
        customer_id
        customer_email
        client_id
        client_name
        rail_code
        currency
        holder_name
        holder_type
        relationship
        bank_details
        created_at
      }
      total
      has_more
    }
  }
`) as unknown as TypedDocumentNode<
  ListPendingBeneficiariesQuery,
  ListPendingBeneficiariesQueryVariables
>;

/**
 * Provider-review fields the back adds to the admin beneficiary read
 * (Phase 8 S2). Declared here until `graphql/types/admin-loopay.ts` carries them.
 */
export interface AdminBeneficiaryReviewFields {
  /** ISO 3166-1 alpha-2 country of the destination account. */
  country?: string | null;
  /** IN_REVIEW | APPROVED | REJECTED. */
  reviewStatus: string;
  reviewReason?: string | null;
  reviewedAt?: string | null;
}

export type AdminReviewedBeneficiary = AdminBeneficiaryEntity & AdminBeneficiaryReviewFields;

export interface ListAllBeneficiariesQuery {
  adminLoopay_listBeneficiaries: AdminPaginated<AdminReviewedBeneficiary>;
}

export interface ListAllBeneficiariesQueryVariables {
  where?: AdminBeneficiaryFiltersInput;
  pagination?: AdminPaginationInput;
}

export const ListAllBeneficiariesDocument = parse(/* GraphQL */ `
  query AdminLoopayListAllBeneficiaries(
    $where: AdminBeneficiaryFiltersInput
    $pagination: PaginationInput
  ) {
    adminLoopay_listBeneficiaries(where: $where, pagination: $pagination) {
      data {
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
        country
        reviewStatus
        reviewReason
        reviewedAt
        createdAt
        updatedAt
      }
      total
      has_more
    }
  }
`) as unknown as TypedDocumentNode<
  ListAllBeneficiariesQuery,
  ListAllBeneficiariesQueryVariables
>;
