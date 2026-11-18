/**
 * Rails Catalogue Query
 *
 * Country -> rail -> direction -> provider availability. One document feeds
 * the "where do I send / where do I receive" selectors (beneficiaries, send).
 * `country` is optional (ISO2 or ISO3); omit it for every country.
 */

import { gql } from '@/graphql/generated';

export const RailsCatalogue = gql(`
  query rails_catalogue($country: String) {
    rails_catalogue(country: $country) {
      countries {
        country
        rails {
          code
          name
          currency
          directions
          beneficiary_supported
          providers {
            code
            directions
            available
          }
        }
      }
    }
  }
`);
