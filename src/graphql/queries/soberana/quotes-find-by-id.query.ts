/**
 * Quotes Find By ID Query
 *
 * Fetches a specific quote by its UUID.
 */

import { gql } from '@/graphql/generated';

export const QuotesFindById = gql(`
  query quotes_findById($id: String!) {
    quotes_findById(id: $id) {
      id
      from_currency
      to_currency
      from_amount
      to_amount
      rate
      fee
      expires_at
      created_at
    }
  }
`);
