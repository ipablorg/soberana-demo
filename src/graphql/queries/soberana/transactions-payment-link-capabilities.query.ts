/**
 * Payment Link Capabilities Query
 *
 * Fetches supported currencies, methods, and rules for payment links.
 */

import { gql } from '@/graphql/generated';

export const TransactionsPaymentLinkCapabilities = gql(`
  query transactions_paymentLinkCapabilities {
    transactions_paymentLinkCapabilities {
      supported_currencies
      supported_payment_methods
      payment_link_rails
      capabilities {
        currency
        payment_methods
        minimum_amount
        description
      }
      minimum_amounts
      catalog_rules {
        currencies
        minimum_amounts
      }
      provider_rules {
        currencies
        payment_methods
        capabilities {
          currency
          payment_methods
          minimum_amount
          description
        }
      }
    }
  }
`);
