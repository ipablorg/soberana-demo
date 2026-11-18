/**
 * Quotes Get Indicative Rate Query
 *
 * Fetches an indicative exchange rate for a currency pair without requiring an amount.
 * This is more appropriate for displaying live rates in UI elements like dashboards.
 */

import { gql } from '@/graphql/generated';

export const QuotesGetIndicativeRate = gql(`
  query quotes_getIndicativeRate($input: GetIndicativeRateInput!) {
    quotes_getIndicativeRate(input: $input) {
      from
      to
      rate
    }
  }
`);
