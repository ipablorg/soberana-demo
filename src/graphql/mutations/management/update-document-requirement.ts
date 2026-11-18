import { gql } from '@/graphql/generated';

/**
 * Update Document Requirement mutation
 *
 * Updates whether a document is required or optional for cases where
 * the document hasn't been uploaded yet (no uploadDocId available).
 */
export const UpdateDocumentRequirementDocument = gql(`
  mutation UpdateDocumentRequirement($input: UpdateDocumentRequirementInput!) {
    companies_updateDocumentRequirement(input: $input) {
      isRequired
      message
      success
      titleDocument
      companyId
    }
  }
`);
