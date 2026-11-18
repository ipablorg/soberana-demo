/**
 * Beneficiaries Create Mutation
 *
 * Creates a beneficiary via GraphQL (Firebase Bearer token auth).
 * Returns BeneficiaryEntity with selected subfields.
 */

export const BENEFICIARIES_CREATE_MUTATION = /* GraphQL */ `
  mutation CreateBeneficiary($input: CreateBeneficiaryInput!) {
    beneficiaries_create(input: $input) {
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
`;
