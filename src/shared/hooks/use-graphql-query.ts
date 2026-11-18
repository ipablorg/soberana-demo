/**
 * Custom Hook: useGraphQLQuery
 * 
 * Wrapper around TanStack Query's useQuery for GraphQL operations.
 * Provides type-safe GraphQL queries with automatic caching and refetching.
 */

import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import { graphqlClient } from '@/shared/lib/graphql-client';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

/**
 * Execute a GraphQL query with TanStack Query
 * 
 * @param queryKey - Unique key for caching (e.g., ['auth', 'me'])
 * @param document - GraphQL query document (from codegen)
 * @param variables - Query variables (optional)
 * @param options - TanStack Query options (optional)
 * 
 * @returns UseQueryResult with data, loading, error states
 * 
 * @example
 * ```tsx
 * import { graphql } from '@/graphql/generated';
 * 
 * const AuthMeDocument = graphql(`
 *   query AuthMe {
 *     auth_me {
 *       id
 *       email
 *       roles
 *     }
 *   }
 * `);
 * 
 * function Profile() {
 *   const { data, isLoading, error } = useGraphQLQuery(
 *     ['auth', 'me'],
 *     AuthMeDocument
 *   );
 * 
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 * 
 *   return <div>Hello, {data.auth_me.email}</div>;
 * }
 * ```
 */
export function useGraphQLQuery<TResult, TVariables>(
  queryKey: unknown[],
  document: TypedDocumentNode<TResult, TVariables>,
  ...[variables, options]: TVariables extends Record<string, never>
    ? [variables?: undefined, options?: Omit<UseQueryOptions<TResult>, 'queryKey' | 'queryFn'>]
    : [variables: TVariables, options?: Omit<UseQueryOptions<TResult>, 'queryKey' | 'queryFn'>]
): UseQueryResult<TResult> {
  return useQuery({
    queryKey: variables ? [...queryKey, variables] : queryKey,
    queryFn: async () => {
      return graphqlClient.request(document, variables ?? undefined);
    },
    ...options,
  } as UseQueryOptions<TResult>);
}

/**
 * Type helper for query variables
 * 
 * @example
 * ```ts
 * type Variables = QueryVariables<typeof GetUserDocument>;
 * ```
 */
export type QueryVariables<T> = T extends TypedDocumentNode<unknown, infer V> ? V : never;

/**
 * Type helper for query result
 * 
 * @example
 * ```ts
 * type Result = QueryResult<typeof GetUserDocument>;
 * ```
 */
export type QueryResult<T> = T extends TypedDocumentNode<infer R, unknown> ? R : never;
