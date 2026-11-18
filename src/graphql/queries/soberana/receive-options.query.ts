/**
 * Receive Options Query
 *
 * Every country/currency/rail the customer can receive on, with the state of
 * the virtual-account request (available | requested | active | rejected).
 */

import { gql } from '@/graphql/generated';

export const VirtualAccountsReceiveOptions = gql(`
  query virtualAccounts_receiveOptions($country: String) {
    virtualAccounts_receiveOptions(country: $country) {
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
      eligible
      ineligibleReason
      blockers {
        code
        category
        message
      }
    }
  }
`);
