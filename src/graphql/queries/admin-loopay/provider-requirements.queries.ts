/**
 * admin-loopay provider requirement queries (S21): the review queue of what
 * customers uploaded for VA providers, its counts (sidebar badge and landing
 * banner) and the signed URL of an uploaded document.
 *
 * Gate: `@StaffAccess('OPS_COMMERCIAL')`; LOOPAY_ADMIN passes.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import type {
  AdminProviderRequirementCounts,
  AdminProviderRequirementsPage,
  ProviderRequirementFilterInput,
} from '@/graphql/types/admin-loopay';

/** Selection of `AdminProviderRequirementEntity`, shared by the queue and the review mutation. */
export const ADMIN_PROVIDER_REQUIREMENT_FIELDS = `
  id
  endorsementId
  customerId
  provider
  railCode
  source
  blockerCode
  key
  group
  kind
  status
  documents {
    id
    fileName
    mimeType
    uploadedAt
  }
  value
  rejectReason
  requestedAt
  updatedAt
  dueAt
  options
  handling
  customerName
  customerEmail
  clientId
  clientName
  reviewedBy
  reviewedAt
  submittedAt
`;

export interface ListProviderRequirementsQuery {
  adminLoopay_listProviderRequirements: AdminProviderRequirementsPage;
}

export interface ListProviderRequirementsQueryVariables {
  filter?: ProviderRequirementFilterInput;
  page?: number;
  pageSize?: number;
}

export const ListProviderRequirementsDocument = parse(/* GraphQL */ `
  query AdminLoopayListProviderRequirements(
    $filter: ProviderRequirementFilterInput
    $page: Int
    $pageSize: Int
  ) {
    adminLoopay_listProviderRequirements(filter: $filter, page: $page, pageSize: $pageSize) {
      items {
        ${ADMIN_PROVIDER_REQUIREMENT_FIELDS}
      }
      total
    }
  }
`) as unknown as TypedDocumentNode<
  ListProviderRequirementsQuery,
  ListProviderRequirementsQueryVariables
>;

export interface ProviderRequirementCountsQuery {
  adminLoopay_providerRequirementCounts: AdminProviderRequirementCounts;
}

export const ProviderRequirementCountsDocument = parse(/* GraphQL */ `
  query AdminLoopayProviderRequirementCounts {
    adminLoopay_providerRequirementCounts {
      awaitingCustomer
      pendingReview
      readyToSubmit
    }
  }
`) as unknown as TypedDocumentNode<ProviderRequirementCountsQuery, Record<string, never>>;

export interface GetProviderRequirementDocumentUrlQuery {
  adminLoopay_getProviderRequirementDocumentUrl: string;
}

export interface GetProviderRequirementDocumentUrlQueryVariables {
  documentId: string;
}

export const GetProviderRequirementDocumentUrlDocument = parse(/* GraphQL */ `
  query AdminLoopayGetProviderRequirementDocumentUrl($documentId: String!) {
    adminLoopay_getProviderRequirementDocumentUrl(documentId: $documentId)
  }
`) as unknown as TypedDocumentNode<
  GetProviderRequirementDocumentUrlQuery,
  GetProviderRequirementDocumentUrlQueryVariables
>;
