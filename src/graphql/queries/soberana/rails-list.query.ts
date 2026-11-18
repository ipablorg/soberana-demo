/**
 * Rails List Query
 *
 * Kept as a raw GraphQL document string instead of generated `gql(...)`
 * because this selection set is broader than the currently generated
 * operation registry and must stay aligned with rail-first form needs.
 */

export const RAILS_LIST_QUERY = /* GraphQL */ `
  query rails_list {
    rails_list {
      data {
        code
        currency
        country
        available_countries
        is_assignable
        type
        enabled_capabilities
        limits {
          min_amount
          max_amount
          daily_limit
          source
        }
        name
        description
      }
    }
  }
`;
