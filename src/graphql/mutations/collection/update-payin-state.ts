import { gql } from '@/graphql/generated';

export const UpdatePayinsStateDocument = gql(`
  mutation UpdatePayInStates($input: UpdatePayinsStateInput!) {
    payin_updateManyStates(input: $input) {
      success
      updatedCount
      failedIds
      message
    }
  }
`);
