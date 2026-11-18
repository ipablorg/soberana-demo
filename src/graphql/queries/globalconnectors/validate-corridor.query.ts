/**
 * GlobalConnectors - Validate Corridor Query
 * 
 * Validates if a payment corridor is supported between two currencies.
 */

import { gql } from 'graphql-request';

export const ValidateCorridorDocument = gql`
  query ValidateCorridor($sourceCurrency: String!, $destinationCurrency: String!) {
    globalconnectors_validateCorridor(
      sourceCurrency: $sourceCurrency
      destinationCurrency: $destinationCurrency
    ) {
      id
      description
      sourceCurrency
      destinationCurrency
      sourceCountry
      destinationCountry
      sourceRail
      destinationRail
      settlementCurrency
      flowType
    }
  }
`;
