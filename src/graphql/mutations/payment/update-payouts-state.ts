/**
 * Update Payouts State Mutation
 *
 * Mutation for updating the state of multiple payouts in batch (staff-only)
 */

import { gql } from '@/graphql/generated';

export const UpdatePayoutsStateDocument = gql(`
  mutation Payout_updateManyStates($input: UpdatePayoutsStateInput!) {
    payout_updateManyStates(input: $input) {
      success
      updatedCount
      failedIds
      message
    }
  }
`);
