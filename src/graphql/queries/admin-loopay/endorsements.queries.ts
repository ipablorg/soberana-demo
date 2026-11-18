/**
 * admin-loopay endorsements queue query.
 *
 * Mirrors `src/modules/admin-loopay/endorsements/**` on the backend.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import type {
  AdminEndorsementQueueFilters,
  AdminEndorsementQueueItem,
  AdminPaginated,
  AdminPaginationInput,
} from '@/graphql/types/admin-loopay';

export interface ListPendingEndorsementsQuery {
  adminLoopay_listPendingEndorsements: AdminPaginated<AdminEndorsementQueueItem>;
}

export interface ListPendingEndorsementsQueryVariables {
  filter?: AdminEndorsementQueueFilters;
  pagination?: AdminPaginationInput;
}

export const ListPendingEndorsementsDocument = parse(/* GraphQL */ `
  query AdminLoopayListPendingEndorsements(
    $filter: EndorsementQueueFiltersInput
    $pagination: PaginationInput
  ) {
    adminLoopay_listPendingEndorsements(
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
        rail_name
        currency
        status
        requested_at
        review_reason
      }
      total
      has_more
    }
  }
`) as unknown as TypedDocumentNode<
  ListPendingEndorsementsQuery,
  ListPendingEndorsementsQueryVariables
>;
