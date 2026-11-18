/**
 * Companies Count By State Query
 * 
 * Fetches company count statistics grouped by state for a specific country.
 * Used for KPI cards in Companies Dashboard.
 */

import { gql } from '@/graphql/generated';

export const CompaniesCountByStateDocument = gql(`
  query Companies_countByState($countryId: Int!) {
    companies_countByState(countryId: $countryId) {
      all
      initial
      active
      debt
      invalid
      penalized
      verified
    }
  }
`);
