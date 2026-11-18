/**
 * Mock GraphQL Hook
 * 
 * Utility hook to return mock data instead of real GraphQL queries when in dev mock mode.
 * Useful for developing UI without backend.
 * 
 * @example
 * ```tsx
 * import { useMockableQuery } from '@/shared/hooks/use-mock-graphql';
 * import { GetBalancesDocument } from '@/graphql/queries/payment';
 * 
 * function useBalances() {
 *   return useMockableQuery(
 *     ['balances'],
 *     GetBalancesDocument,
 *     undefined,
 *     {
 *       mockData: mockAccounts, // From mock-data.ts
 *     }
 *   );
 * }
 * ```
 */

import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import { graphqlClient } from '@/shared/lib/graphql-client';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { isDevMockMode } from '@/shared/lib/dev-config';

interface MockableQueryOptions<TResult> extends Omit<UseQueryOptions<TResult>, 'queryKey' | 'queryFn'> {
  /** Mock data to return when in dev mock mode */
  mockData?: TResult;
  /** Delay in ms before returning mock data (simulates network) */
  mockDelay?: number;
}

/**
 * Mockable GraphQL Query Hook
 * 
 * Works like useGraphQLQuery but returns mock data in dev mock mode.
 * 
 * @param queryKey - TanStack Query key
 * @param document - GraphQL document
 * @param variables - Query variables
 * @param options - Query options with optional mockData
 * @returns Query result with data, loading, error states
 */
export function useMockableQuery<TResult, TVariables>(
  queryKey: unknown[],
  document: TypedDocumentNode<TResult, TVariables>,
  variables?: TVariables,
  options?: MockableQueryOptions<TResult>
): UseQueryResult<TResult> {
  const { mockData, mockDelay = 300, ...queryOptions } = options || {};

  return useQuery({
    queryKey: variables ? [...queryKey, variables] : queryKey,
    queryFn: async () => {
      // Return mock data if in dev mock mode and mock data provided
      if (isDevMockMode() && mockData) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, mockDelay));
        
        return mockData;
      }

      // Real GraphQL query
      return graphqlClient.request(document, variables ?? undefined);
    },
    ...queryOptions,
  } as UseQueryOptions<TResult>);
}

/**
 * Create a mock-aware query hook
 * 
 * Wrapper to create custom hooks that automatically use mock data in dev mode.
 * 
 * @example
 * ```tsx
 * export const useBalances = createMockableQueryHook(
 *   'balances',
 *   GetBalancesDocument,
 *   mockAccounts
 * );
 * ```
 */
export function createMockableQueryHook<TResult, TVariables = Record<string, never>>(
  queryKey: string,
  document: TypedDocumentNode<TResult, TVariables>,
  mockData: TResult
) {
  return (
    variables?: TVariables,
    options?: MockableQueryOptions<TResult>
  ) => {
    return useMockableQuery(
      [queryKey, ...(variables ? [variables] : [])],
      document,
      variables,
      {
        mockData,
        ...options,
      }
    );
  };
}

/**
 * Check if query should use mock data
 * 
 * @returns true if in dev mock mode and mock data is available
 */
export function shouldUseMockData<T>(mockData?: T): boolean {
  return isDevMockMode() && mockData !== undefined;
}
