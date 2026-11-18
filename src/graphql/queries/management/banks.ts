/**
 * Management Module - Banks Query
 *
 * Query to fetch all banks from the backend.
 */

import { gql } from 'graphql-request';

/**
 * Get all banks
 *
 * @example
 * ```tsx
 * import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
 * import { GetBanksDocument } from '@/graphql/queries/management';
 *
 * function Component() {
 *   const { data, isLoading } = useGraphQLQuery(
 *     ['management', 'banks'],
 *     GetBanksDocument
 *   );
 *
 *   return <div>Banks: {data?.bankBases.length}</div>;
 * }
 * ```
 */
export const GetBanksDocument = gql`
  query GetBanks {
    banks {
      id
      name
      active
      countryId
      alternativeName
    }
  }
`;
