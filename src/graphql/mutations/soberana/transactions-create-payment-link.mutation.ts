/**
 * Create Payment Link Mutation
 *
 * Generates a payment link for on-ramp (fiat deposits).
 */

import { gql } from '@/graphql/generated';

export const TransactionsCreatePaymentLink = gql(`
  mutation transactions_createPaymentLink($input: CreatePaymentLinkInput!) {
    transactions_createPaymentLink(input: $input) {
      payment_url
      payment_link_id
      expires_at
    }
  }
`);
