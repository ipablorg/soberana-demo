/**
 * Beneficiaries List Query
 *
 * Fetches all beneficiaries for a given customer.
 * Returns Array<BeneficiaryEntity>.
 */

import { gql } from '@/graphql/generated';

export const BeneficiariesList = gql(`
  query beneficiaries_list($customerId: String!) {
    beneficiaries_list(customerId: $customerId) {
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
      bank_details
      created_at
      updated_at
    }
  }
`);
