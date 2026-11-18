import { gql } from '@/graphql/generated';

/**
 * Update Company State mutation
 *
 * Updates the company state and/or documentation state of a company.
 */
export const UpdateCompanyStateDocument = gql(`
  mutation UpdateCompanyState($companiesUpdateCompanyStateInput2: UpdateCompanyStateInput!) {
    companies_updateCompanyState(input: $companiesUpdateCompanyStateInput2) {
      companyId
      message
      stateCompany
      stateStudyCompany
      success
    }
  }
`);
