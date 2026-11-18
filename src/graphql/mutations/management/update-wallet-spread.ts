/**
 * Update Wallet Spread Mutation
 * Updates the spread percentage for a company's custody wallet
 */

import { gql } from '@/graphql/generated';

export const UpdateWalletSpreadDocument = gql(`
  mutation UpdateWalletSpread($input: UpdateWalletSpreadInput!) {
    companies_updateWalletSpread(input: $input) {
      clientId
      message
      spread
      success
    }
  }
`);
