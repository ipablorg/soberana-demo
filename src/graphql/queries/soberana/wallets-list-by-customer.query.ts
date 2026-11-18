/**
 * Wallets List By Customer Query
 *
 * Fetches all wallets for a given customer with pagination.
 */

import { gql } from '@/graphql/generated';

export const WalletsListByCustomer = gql(`
  query wallets_listByCustomer($customerId: String!) {
    wallets_listByCustomer(customerId: $customerId) {
      default_wallet {
        currency
        chain
      }
      data {
        id
        customer_id
        currency
        chain
        status
        alias
        address
        created_at
      }
      has_more
      page
      page_size
      total
      total_pages
    }
  }
`);
