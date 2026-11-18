/**
 * Wallets Available Chains Query
 *
 * Fetches the list of supported blockchain chains for wallet creation.
 */

import { gql } from '@/graphql/generated';

export const WalletsAvailableChains = gql(`
  query wallets_availableChains {
    wallets_availableChains {
      chains
      default_chain
      currency
    }
  }
`);
