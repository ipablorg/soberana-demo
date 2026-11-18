/**
 * Management Module - Document Types Query
 *
 * Query to fetch available document types by country from the backend.
 */

import { gql } from 'graphql-request';

/**
 * Get all available document types for a specific country
 *
 * @example
 * ```tsx
 * import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
 * import { DocumentTypesByCountryDocument } from '@/graphql/queries/management';
 *
 * function Component() {
 *   const { data, isLoading } = useGraphQLQuery(
 *     ['management', 'documentTypes', 1],
 *     DocumentTypesByCountryDocument,
 *     { countryId: 1 }
 *   );
 *
 *   return <div>{data?.documentTypesByCountryId.map(dt => dt.type)}</div>;
 * }
 * ```
 */
export const DocumentTypesByCountryDocument = gql`
  query DocumentTypesByCountry($countryId: Int!) {
    documentTypesByCountryId(countryId: $countryId) {
      id
      type
    }
  }
`;
