/**
 * Quotes Get Rate Query
 *
 * Fetches an indicative exchange rate for a currency pair.
 */

import { gql } from '@/graphql/generated';

export const QuotesGetRate = gql(`
  query quotes_getRate($input: GetQuoteInput!) {
    quotes_getRate(input: $input) {
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
