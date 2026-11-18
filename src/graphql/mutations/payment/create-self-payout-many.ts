/**
 * Create Self PayOut Many Mutation
 *
 * Creates multiple payout transactions for a company.
 */

import { gql } from '@/graphql/generated';

export const CreateSelfPayOutMany = gql(`
  mutation CreateSelfPayOutMany($input: CreateSelfPayOutManyInput!) {
    payout_createSelfPayOutMany(input: $input) {
      
      count
    }
  }
`);
