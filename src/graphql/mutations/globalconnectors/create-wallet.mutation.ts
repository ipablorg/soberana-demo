/**
 * GlobalConnectors - Create Wallet Mutation
 * 
 * Creates a blockchain wallet for crypto operations.
 * Supported chains: BASE, ETHEREUM, SOLANA, POLYGON
 */

import { gql } from 'graphql-request';

export const CreateWalletDocument = gql`
  mutation CreateWallet($customerId: String!, $input: CreateWalletInput!) {
    globalconnectors_createWallet(customerId: $customerId, input: $input) {
      walletId
      address
      chain
      currency
      balance
      created_at
    }
  }
`;
