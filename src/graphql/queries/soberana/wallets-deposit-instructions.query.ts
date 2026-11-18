/**
 * Wallet Deposit Instructions Query
 *
 * Fetches virtual account bank details for receiving fiat deposits.
 * Uses VirtualAccountItem typed fields from the backend schema.
 * `bic` + `payment_rails` complete the international-wire metadata,
 * `network` exposes the wallet's crypto deposit network, and
 * `linked_manually` / `linked_at` mark an account Loopay staff registered by hand (S22).
 */

import { gql } from '@/graphql/generated';

export const WalletsDepositInstructions = gql(`
  query wallets_depositInstructions($walletId: String!, $customerId: String!) {
    wallets_depositInstructions(walletId: $walletId, customerId: $customerId) {
      customer_id
      wallet_id
      network
      virtual_accounts {
        id
        payment_rail
        currency
        status
        account_number
        account_type
        bank_name
        beneficiary_address
        beneficiary_name
        clabe
        iban
        nit
        reference
        routing_number
        swift_code
        bic
        sort_code
        br_code
        account_holder_name
        bank_address
        bank_beneficiary_name
        bank_beneficiary_address
        payment_rails
        linked_manually
        linked_at
      }
    }
  }
`);
