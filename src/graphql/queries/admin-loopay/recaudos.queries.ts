/**
 * admin-loopay recaudos (inbound deposits) queue query.
 *
 * Mirrors `src/modules/admin-loopay/recaudos/**` on the backend.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import type {
  AdminPaginated,
  AdminPaginationInput,
  AdminRecaudo,
  AdminRecaudoQueueFilters,
} from '@/graphql/types/admin-loopay';

export interface ListPendingRecaudosQuery {
  adminLoopay_listPendingRecaudos: AdminPaginated<AdminRecaudo>;
}

export interface ListPendingRecaudosQueryVariables {
  filter?: AdminRecaudoQueueFilters;
  pagination?: AdminPaginationInput;
}

export const ListPendingRecaudosDocument = parse(/* GraphQL */ `
  query AdminLoopayListPendingRecaudos(
    $filter: RecaudoQueueFiltersInput
    $pagination: PaginationInput
  ) {
    adminLoopay_listPendingRecaudos(filter: $filter, pagination: $pagination) {
      data {
        id
        reference_code
        customer_id
        customer_email
        client_id
        client_name
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
      }
      total
      has_more
    }
  }
`) as unknown as TypedDocumentNode<
  ListPendingRecaudosQuery,
  ListPendingRecaudosQueryVariables
>;
