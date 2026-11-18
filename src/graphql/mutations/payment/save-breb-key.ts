/**
 * Save Breb Key Mutation
 *
 * Mutation to save a Breb key to a company product.
 */

import { gql } from '@/graphql/generated';

export const SaveBrebKey = gql(`
  mutation SaveBrebKey($input: SaveBrebKeyInput!) {
    companies_saveBrebKeyToCompanyProduct(input: $input) {
      id
      slug
      uid
      active
      balance
      metaData
      updatedAt
      product {
        name
      }
      company {
        name
      }
    }
  }
`);
