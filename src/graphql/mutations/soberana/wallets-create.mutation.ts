/**
 * Create Wallet Mutation
 *
 * Creates a new blockchain wallet for a customer.
 */

import { gql } from '@/graphql/generated';

export const WalletsCreate = gql(`
  mutation wallets_create($input: CreateWalletInput!) {
    wallets_create(input: $input) {
      id
      customer_id
      currency
      chain
      status
      alias
      address
      created_at
      updated_at
    }
  }
`);
