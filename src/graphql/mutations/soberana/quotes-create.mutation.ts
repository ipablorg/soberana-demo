/**
 * Create Quote Mutation
 *
 * Creates a locked exchange rate quote for a currency conversion.
 */

import { gql } from '@/graphql/generated';

export const QuotesCreate = gql(`
  mutation quotes_create($input: CreateQuoteInput!) {
    quotes_create(input: $input) {
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
