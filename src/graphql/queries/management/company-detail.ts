/**
 * Company Detail Query
 * Fetches comprehensive company information including products and documents
 */

import { gql } from '@/graphql/generated';

export const CompanyDetailDocument = gql(`
  query CompanyDetail($companyId: Int!) {
    companies_companyDetail(companyId: $companyId) {
      id
      documentNumber
      createdAt
      name
      slug
      stateCompany
      stateStudyCompany
      countryName
      countryId
      documentType
      updatedAt
      companyProducts {
        id
        balance
        active
        productName
        slug
      }
      uploadDocs {
        titleDocument
        isMandatory
        uploadedFile {
          id
          stateDocument
          expirationDate
          alerts {
            log
          }
          fileRecords {
            mimetype
            url
          }
        }
      }
    }
  }
`);
