/**
 * GlobalConnectors - Get Customer Query
 * 
 * Retrieves customer information from GlobalConnectors.
 */

import { gql } from 'graphql-request';

export const GetCustomerDocument = gql`
  query GetCustomer($customerId: String!) {
    globalconnectors_getCustomer(customerId: $customerId) {
      customerId
      email
      status
      kycLink
      type
      full_name
    }
  }
`;
