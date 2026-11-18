/**
 * Create Off-Ramp Mutation
 *
 * Initiates an off-ramp transaction (crypto → fiat) to a beneficiary.
 */

import { gql } from '@/graphql/generated';

export const CreateOffRamp = gql(`
  mutation transactions_createOffRamp($input: CreateOffRampInput!) {
    transactions_createOffRamp(input: $input) {
      transaction_id
      status
      message
    }
  }
`);
