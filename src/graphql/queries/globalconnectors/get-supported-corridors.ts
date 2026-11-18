/**
 * GlobalConnectors Query: Get Supported Corridors
 * 
 * PUBLIC query - No authentication required
 */

import { gql } from 'graphql-request';

export const GET_SUPPORTED_CORRIDORS = gql`
  query GetSupportedCorridors {
    globalconnectors_supportedCorridors {
      id
      description
      sourceCountry
      sourceCurrency
      sourceRail
      destinationCountry
      destinationCurrency
      destinationRail
      settlementCurrency
      isBidirectional
      flowType
    }
  }
`;

