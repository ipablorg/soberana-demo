/**
 * Companies List Query
 * Fetches paginated list of companies filtered by country
 */

import { gql } from '@/graphql/generated';

export const CompaniesListByCountryDocument = gql(`
  query Companies_listByCountry($countryId: Int!, $filters: CompanyFiltersInput!) {
    companies_listByCountry(countryId: $countryId, filters: $filters) {
      companies {
        countryId
        countryName
        documentNumber
        documentTypeName
        firstUserEmail
        firstUserName
        id
        name
        slug
        stateCompany
        stateStudyCompany
        createdAt
      }
      hasMore
      page
      pageSize
      total
      totalPages
    }
  }
`);
