/**
 * Request Virtual Account Mutation
 *
 * Asks for a virtual account on a country/currency/rail option. Idempotent:
 * `created: false` means an existing request or account was returned.
 */

import { gql } from '@/graphql/generated';

export const VirtualAccountsRequest = gql(`
  mutation virtualAccounts_request($input: RequestVirtualAccountInput!) {
    virtualAccounts_request(input: $input) {
      created
      request {
        country
        currency
        railCode
        railName
        provider
        providers
        status
        requestId
        virtualAccountId
        vaRequestState
        reason
        blockers {
          code
          category
          message
        }
      }
    }
  }
`);
