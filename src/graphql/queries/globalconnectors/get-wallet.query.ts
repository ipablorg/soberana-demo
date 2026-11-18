/**
 * GlobalConnectors - Get Wallet Query
 * 
 * Retrieves wallet information.
 */

import { gql } from 'graphql-request';

export const GetWalletDocument = gql`
  query GetWallet($customerId: String!, $walletId: String!) {
    globalconnectors_getWallet(customerId: $customerId, walletId: $walletId) {
      walletId
      address
      chain
      currency
      balance
      created_at
    }
  }
`;
