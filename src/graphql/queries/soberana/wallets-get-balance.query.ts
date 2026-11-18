/**
 * Wallet Get Balance Query
 *
 * Fetches real-time balance for a specific wallet.
 */

import { gql } from '@/graphql/generated';

export const WalletsGetBalance = gql(`
  query wallets_getBalance($id: String!) {
    wallets_getBalance(id: $id) {
      wallet_id
      currency
      available_balance
      spendable_balance
      pending_balance
      total_balance
      updated_at
    }
  }
`);
