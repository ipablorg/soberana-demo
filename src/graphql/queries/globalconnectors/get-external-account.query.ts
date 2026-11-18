/**
 * GlobalConnectors - Get External Account Query
 * 
 * Retrieves external account information.
 */

import { gql } from 'graphql-request';

export const GetExternalAccountDocument = gql`
  query GetExternalAccount($customerId: String!, $externalAccountId: String!) {
    globalconnectors_getExternalAccount(
      customerId: $customerId
      externalAccountId: $externalAccountId
    ) {
      externalAccountId
      currency
      accountType
      accountOwnerName
      bankName
      status
    }
  }
`;
