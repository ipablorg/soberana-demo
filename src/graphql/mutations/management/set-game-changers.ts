import { gql } from '@/graphql/generated';

export const SetGameChangersDocument = gql(`
  mutation SetGameChangers($input: SetGameChangersInput!) {
    companies_setGameChangers(input: $input) {
      success
      companyId
      gameChangers
      message
    }
  }
`);
