/**
 * Auth Module - Hello Query
 * 
 * Simple test query to verify GraphQL connection.
 */

import { gql } from '@/graphql/generated';

/**
 * Test query to verify GraphQL server connection
 * 
 * @example
 * ```tsx
 * import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
 * import { AuthHelloDocument } from '@/graphql/queries/auth';
 * 
 * function TestComponent() {
 *   const { data, isLoading } = useGraphQLQuery(
 *     ['auth', 'hello'],
 *     AuthHelloDocument
 *   );
 * 
 *   return <div>{data?.auth_hello}</div>;
 * }
 * ```
 */
export const AuthHelloDocument = gql(`
  query AuthHello {
    auth_hello
  }
`);
