/**
 * Beneficiaries Delete Mutation
 *
 * Deletes a beneficiary scoped to customer/client authorization.
 */

export const BENEFICIARIES_DELETE_MUTATION = /* GraphQL */ `
  mutation DeleteBeneficiary($id: String!, $customerId: String!) {
    beneficiaries_delete(id: $id, customerId: $customerId) {
      success
      id
      provider_external_deleted
      provider_code
    }
  }
`;
