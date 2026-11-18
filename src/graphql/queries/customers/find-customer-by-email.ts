import { gql } from 'graphql-request';

/**
 * Find customer by email using customers_list with filter.
 * Used as fallback when customers_create fails with "already exists"
 * and auth_me doesn't return customer_profile_id.
 */
export const FindCustomerByEmailDocument = gql`
  query FindCustomerByEmail {
    customers_list {
      data {
        id
        email
        kyc_status
      }
    }
  }
`;
