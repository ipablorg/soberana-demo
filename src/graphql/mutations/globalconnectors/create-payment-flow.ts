/**
 * GlobalConnectors Mutation: Create Payment Flow
 * 
 * PROTECTED mutation - Requires authentication
 */

import { gql } from 'graphql-request';

export const CREATE_PAYMENT_FLOW = gql`
  mutation CreatePaymentFlow($input: CreatePaymentFlowInput!) {
    globalconnectors_createPaymentFlow(input: $input) {
      customerId
      externalAccountId
      virtualAccountId
      depositInstructions {
        currency
        paymentRail
        iban
        bic
        routingNumber
        accountNumber
        clabe
        pixKey
        bankName
        beneficiaryName
      }
      estimatedDeliveryTime
    }
  }
`;

