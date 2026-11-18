/**
 * Wallet Transactions Query
 *
 * Fetches paginated transactions for a specific wallet with optional filters.
 */

import { gql } from '@/graphql/generated';

export const WalletsTransactions = gql(`
  query wallets_transactions($id: String!, $filters: TransactionListFiltersInput) {
    wallets_transactions(id: $id, filters: $filters) {
      transactions {
        id
        amount
        currency
        type
        status
        description
        external_reference
        created_at
        completed_at
        fee
        fee_currency
        refunded
        source
        destination
      }
      has_more
      page
      page_size
      total
      total_pages
    }
  }
`);
