/**
 * Products List Query
 * Fetches list of all available products filtered by country
 * 
 * Products can be wallets (crypto) or bank accounts (fiat) that can be
 * associated with companies.
 */

import { gql } from '@/graphql/generated';

export const ProductsListDocument = gql(`
  query Products($countryId: Int!) {
    products(countryId: $countryId) {
      id
      name
      slug
      description
      createdAt
      countryId
    }
  }
`);
