/**
 * Create Dispersion Mutation
 *
 * Money-flow v2 outbound send: debits the source wallet and creates
 * the ops-vault transfer SYNCHRONOUSLY at customer request; the
 * transaction stays PENDING until operations settles the payout
 * manually. The amount is source-denominated (wallet currency, e.g.
 * USDT) — the payout estimate is decided later by operations, so
 * quotes shown upstream are indicative only.
 */

import { gql } from '@/graphql/generated';

export const CreateDispersion = gql(`
  mutation transactions_createDispersion($input: CreateDispersionInput!) {
    transactions_createDispersion(input: $input) {
      transaction_id
      status
      message
    }
  }
`);
