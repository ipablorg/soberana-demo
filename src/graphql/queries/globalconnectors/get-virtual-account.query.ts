/**
 * GlobalConnectors - Get Virtual Account Query
 * 
 * Retrieves virtual account information with deposit instructions.
 */

import { gql } from 'graphql-request';

export const GetVirtualAccountDocument = gql`
  query GetVirtualAccount($customerId: String!, $virtualAccountId: String!) {
    globalconnectors_getVirtualAccount(
      customerId: $customerId
      virtualAccountId: $virtualAccountId
    ) {
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
