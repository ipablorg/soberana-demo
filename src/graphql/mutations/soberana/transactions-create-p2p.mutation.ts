/**
 * Create P2P Transfer Mutation
 *
 * Initiates an internal transfer between wallets in the system.
 */

import { gql } from '@/graphql/generated';

export const TransactionsCreateP2P = gql(`
  mutation transactions_createP2P($input: CreateP2PInput!) {
    transactions_createP2P(input: $input) {
      transaction_id
      status
      message
    }
  }
`);
