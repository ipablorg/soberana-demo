/**
 * GlobalConnectors - Get Exchange Rate Query
 * 
 * Gets the current exchange rate between two currencies using the Quotes API.
 */

import { gql } from 'graphql-request';

export const GetExchangeRateDocument = gql`
  query GetExchangeRate($input: GetQuoteInput!) {
    quotes_getRate(input: $input) {
      id
      from_currency
      to_currency
      rate
      created_at
    }
  }
`;
