/**
 * Transactions List Query
 *
 * Fetches a paginated list of transactions. Use input.type = "WITHDRAWAL"
 * and input.wallet_id to filter off-ramp transactions for a specific wallet.
 */

import { gql } from '@/graphql/generated';

export const TransactionsList = gql(`
  query transactions_list($input: ListTransactionsInput!) {
    transactions_list(input: $input) {
      data {
        id
        type
        status
        amount
        currency
        description
        metadata
        created_at
        completed_at
      }
      total
      has_more
    }
  }
`);
