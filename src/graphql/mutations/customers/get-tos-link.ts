import { gql } from 'graphql-request';

/**
 * GetTosLink Mutation
 *
 * Requests a ToS/KYC verification link from Bridge.
 * Required input fields (verified via introspection 2026-04-08):
 *   - email: String!
 *   - redirect_uri: String!
 * kyc_provider is deprecated and ignored by the backend, so it is not sent.
 */
export const GetTosLinkDocument = gql`
  mutation GetTosLink($input: GetTosLinkInput!) {
    customers_getTosLink(input: $input) {
      tos_url
    }
  }
`;
