/**
 * admin-loopay KYC review queries
 *
 * Hand-written documents: `npm run codegen` needs a live backend, so these are
 * parsed at module load and cast to `TypedDocumentNode` to keep call sites
 * type-safe. Field names mirror
 * `src/modules/admin-loopay/kyc-review/**` on the backend.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import type {
  AdminCustomerKycDetail,
  AdminDocumentDownload,
  AdminKycQueueFilters,
  AdminKycQueueItem,
  AdminPaginated,
  AdminPaginationInput,
} from '@/graphql/types/admin-loopay';

export interface ListPendingKycQuery {
  adminLoopay_listPendingKyc: AdminPaginated<AdminKycQueueItem>;
}

export interface ListPendingKycQueryVariables {
  filter?: AdminKycQueueFilters;
  pagination?: AdminPaginationInput;
}

export const ListPendingKycDocument = parse(/* GraphQL */ `
  query AdminLoopayListPendingKyc(
    $filter: KycQueueFiltersInput
    $pagination: PaginationInput
  ) {
    adminLoopay_listPendingKyc(filter: $filter, pagination: $pagination) {
      data {
        id
        client_id
        client_name
        email
        first_name
        last_name
        customer_type
        country
        kyc_status
        customer_status
        submitted_at
        has_documents
        documents_count
      }
      total
      has_more
    }
  }
`) as unknown as TypedDocumentNode<
  ListPendingKycQuery,
  ListPendingKycQueryVariables
>;

export interface GetCustomerKycDataQuery {
  adminLoopay_getCustomerKycData: AdminCustomerKycDetail;
}

export interface GetCustomerKycDataQueryVariables {
  customerId: string;
}

export const GetCustomerKycDataDocument = parse(/* GraphQL */ `
  query AdminLoopayGetCustomerKycData($customerId: ID!) {
    adminLoopay_getCustomerKycData(customerId: $customerId) {
      customer {
        id
        client_id
        email
        first_name
        middle_name
        last_name
        tax_id
        tax_id_type
        country
        kyc_status
        customer_status
        rejection_reasons
        address_details
        kyc_reviewed_by_user_id
        kyc_reviewed_at
        created_at
        updated_at
      }
      kyc_data
      provider_profile
      documents {
        id
        category
        version
        mime_type
        file_size_bytes
        created_at
        document_metadata
      }
      endorsements {
        id
        rail_code
        status
        review_reason
      }
      wallets {
        id
        provider_code
        chain
        currency
        address
        status
      }
    }
  }
`) as unknown as TypedDocumentNode<
  GetCustomerKycDataQuery,
  GetCustomerKycDataQueryVariables
>;

export interface GetDocumentDownloadUrlQuery {
  adminLoopay_getDocumentDownloadUrl: AdminDocumentDownload;
}

export interface GetDocumentDownloadUrlQueryVariables {
  documentId: string;
}

export const GetDocumentDownloadUrlDocument = parse(/* GraphQL */ `
  query AdminLoopayGetDocumentDownloadUrl($documentId: ID!) {
    adminLoopay_getDocumentDownloadUrl(documentId: $documentId) {
      document_id
      url
      expires_in_seconds
    }
  }
`) as unknown as TypedDocumentNode<
  GetDocumentDownloadUrlQuery,
  GetDocumentDownloadUrlQueryVariables
>;
