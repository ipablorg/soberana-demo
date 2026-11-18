/**
 * GlobalConnectors - Create Virtual Account Mutation
 * 
 * Creates a virtual account with deposit instructions for receiving funds.
 */

import { gql } from 'graphql-request';

export const CreateVirtualAccountDocument = gql`
  mutation CreateVirtualAccount($customerId: String!, $input: CreateVirtualAccountInput!) {
    globalconnectors_createVirtualAccount(customerId: $customerId, input: $input) {
      virtual_account_id
      status
      customer_id
      source_deposit_instructions {
        currency
        payment_rails
        iban
        bic
        clabe
        pix_key
        routing_number
        account_number
        bank_name
        account_holder_name
      }
      created_at
    }
  }
`;
