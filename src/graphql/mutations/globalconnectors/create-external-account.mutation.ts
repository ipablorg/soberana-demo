/**
 * GlobalConnectors - Create External Account Mutation
 * 
 * Creates an external bank account for receiving/sending funds.
 * Supports: US (ACH), IBAN (SEPA), CLABE (SPEI), PIX
 */

import { gql } from 'graphql-request';

export const CreateExternalAccountDocument = gql`
  mutation CreateExternalAccount($customerId: String!, $input: CreateExternalAccountInput!) {
    globalconnectors_createExternalAccount(customerId: $customerId, input: $input) {
      externalAccountId
      currency
      accountType
      accountOwnerName
      bankName
      status
    }
  }
`;
