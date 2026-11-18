/**
 * Create Transfer Mutation
 *
 * Initiates a crypto transfer to an external blockchain address using the
 * direct-transfer contract fields mirrored by the frontend (`to_address`,
 * `amount`, `currency`, `chain`, optional `client_reference_id`).
 */

import { gql } from '@/graphql/generated';

export const TransactionsCreateTransfer = gql(`
  mutation transactions_createTransfer($input: CreateTransferInput!) {
    transactions_createTransfer(input: $input) {
      transaction_id
      status
      message
    }
  }
`);
