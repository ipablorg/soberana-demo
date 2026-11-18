import { gql } from '@/graphql/generated';

/**
 * Create Company Product mutation
 *
 * Creates a new product association for a company.
 */
export const CreateCompanyProductDocument = gql(`
  mutation CreateCompanyProduct($input: CreateCompanyProductInput!) {
    companies_createCompanyProduct(input: $input) {
      active
      companyId
      companyProductId
      emailsToNotify
      message
      productId
      signators
      slug
      success
      uid
    }
  }
`);
