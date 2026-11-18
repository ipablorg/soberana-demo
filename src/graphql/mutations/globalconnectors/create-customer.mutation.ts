/**
 * GlobalConnectors - Create Customer Mutation
 * 
 * Creates a customer in GlobalConnectors and initiates KYC process.
 * Returns kycLink for user to complete verification.
 */

import { gql } from 'graphql-request';

export const CreateGlobalConnectorsCustomerDocument = gql`
  mutation CreateGlobalConnectorsCustomer($input: CreateCustomerInput!) {
    globalconnectors_createCustomer(input: $input) {
      customerId
      status
      kycLink
      type
    }
  }
`;
