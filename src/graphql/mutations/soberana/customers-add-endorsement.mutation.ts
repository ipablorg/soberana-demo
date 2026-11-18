/**
 * Add Endorsement Mutation
 *
 * Requests a new payment rail (channel) for the customer — the
 * virtual-account request of money-flow v2. Response carries the full
 * lifecycle truth: ops-review `status` (pending until operations
 * approves; auto-approved in dev), backend-owned `readiness` +
 * `artifact_type`, and recovery links (`kyc_link` / `tos_link`) when
 * the rail still needs user action.
 */

import { gql } from 'graphql-request';

export const CustomersAddEndorsement = gql`
  mutation customers_addEndorsement($id: String!, $input: AddEndorsementInput!) {
    customers_addEndorsement(id: $id, input: $input) {
      id
      payment_rail
      status
      created_at
      country
      available_countries
      kyc_link
      tos_link
      readiness
      artifact_type
    }
  }
`;
