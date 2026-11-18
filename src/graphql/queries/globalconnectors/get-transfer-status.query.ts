/**
 * GlobalConnectors - Get Transfer Status Query
 * 
 * Gets the current status of a transfer.
 */

import { gql } from 'graphql-request';

export const GetTransferStatusDocument = gql`
  query GetTransferStatus($transferId: String!) {
    globalconnectors_getTransferStatus(transferId: $transferId) {
      transferId
      state
      amount
      source {
        payment_rail
        currency
      }
      destination {
        payment_rail
        currency
      }
      created_at
      completed_at
      failure_reason
    }
  }
`;
