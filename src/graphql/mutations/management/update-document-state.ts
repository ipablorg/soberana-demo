import { gql } from '@/graphql/generated';

/**
 * Update Document State mutation
 *
 * Updates the state, requirement status, expiration date, and alert message of a company document.
 */
export const UpdateDocumentStateDocument = gql(`
  mutation UpdateDocumentState($input: UpdateDocumentStateInput!) {
    companies_updateDocumentState(input: $input) {
      alertId
      alertMessage
      message
      stateDocument
      success
      uploadDocId
      expirationDate
      isRequired
      requirementUpdated
    }
  }
`);
