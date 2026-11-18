/**
 * List Customer Endorsements Query
 *
 * Fetches the customer's active payment rail endorsements.
 * An endorsement represents an activated channel/rail for receiving funds.
 * `readiness` + `artifact_type` are the backend-owned lifecycle truth
 * (money-flow v2): readiness says whether the rail can actually serve
 * receives today, artifact_type says what backs it (virtual account,
 * payment link, or nothing yet).
 */

import { gql } from 'graphql-request';

export const CustomersListEndorsements = gql`
  query customers_listEndorsements($id: String!) {
    customers_listEndorsements(id: $id) {
      data {
        id
        payment_rail
        status
        created_at
        readiness
        artifact_type
      }
      total
    }
  }
`;
