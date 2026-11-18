/**
 * GlobalConnectors - Create Transfer Mutation
 * 
 * Creates a transfer between payment rails.
 * Supports both flexible_amount (receive) and fixed amount (send) modes.
 */

import { gql } from 'graphql-request';

export const CreateTransferDocument = gql`
  mutation CreateTransfer($input: CreateTransferInput!) {
    globalconnectors_createTransfer(input: $input) {
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
    }
  }
`;
