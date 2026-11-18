/**
 * Beneficiary Get Query
 *
 * Fetches a single beneficiary by ID for a given customer.
 */

import { gql } from '@/graphql/generated';

export const BeneficiaryGet = gql(`
  query beneficiaries_findById($id: String!, $customerId: String!) {
    beneficiaries_findById(id: $id, customerId: $customerId) {
      id
      customer_id
      payment_rail
      rail {
        id
        code
        name
        currency
        country
      }
      bank_details
      country
      relationship
      holder_type
      beneficiary_name
      tax_id
      currency
      alias
      is_favorite
      verification_status
      rail_code
      provider_code
      review_status
      review_reason
      masked_account_number
      bank_name
      bank_code
      account_number
      routing_number
      iban
      clabe
      pix_key
      bic
      created_at
      updated_at
    }
  }
`);
