/**
 * Custom Hook: useGraphQLMutation
 * 
 * Wrapper around TanStack Query's useMutation for GraphQL mutations.
 * Provides type-safe GraphQL mutations with automatic cache invalidation.
 */

import { useMutation, type UseMutationOptions, type UseMutationResult } from '@tanstack/react-query';
import { graphqlClient } from '@/shared/lib/graphql-client';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { DocumentNode } from 'graphql';

/**
 * Execute a GraphQL mutation with TanStack Query
 * 
 * @param document - GraphQL mutation document (from codegen or @apollo/client)
 * @param options - TanStack Query mutation options (optional)
 * 
 * @returns UseMutationResult with mutate, mutateAsync, status states
 * 
 * @example
 * ```tsx
 * import { graphql } from '@/graphql/generated';
 * 
 * const SignInDocument = graphql(`
 *   mutation SignIn($email: String!, $password: String!) {
 *     auth_signIn(email: $email, password: $password) {
 *       token
 *       user {
 *         id
 *         email
 *       }
 *     }
 *   }
 * `);
 * 
 * function LoginForm() {
 *   const signIn = useGraphQLMutation(SignInDocument, {
 *     onSuccess: (data) => {
 *       setAuthToken(data.auth_signIn.token);
 *       navigate('/dashboard');
 *     },
 *     onError: (error) => {
 *       toast.error('Login failed: ' + error.message);
 *     }
 *   });
 * 
 *   const handleSubmit = (values) => {
 *     signIn.mutate({
 *       email: values.email,
 *       password: values.password
 *     });
 *   };
 * 
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {signIn.isPending && <Spinner />}
 *       {signIn.error && <Error message={signIn.error.message} />}
 *       // form fields here
 *     </form>
 *   );
 * }
 * ```
 */
export function useGraphQLMutation<TResult = any, TVariables = any>(
  document: TypedDocumentNode<TResult, TVariables> | DocumentNode,
  options?: Omit<
    UseMutationOptions<TResult, Error, TVariables>,
    'mutationFn'
  >
): UseMutationResult<TResult, Error, TVariables> {
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      return graphqlClient.request<TResult>(document as any, variables as any ?? undefined);
    },
    ...options,
  });
}

/**
 * Type helper for mutation variables
 * 
 * @example
 * ```ts
 * type Variables = MutationVariables<typeof SignInDocument>;
 * ```
 */
export type MutationVariables<T> = T extends TypedDocumentNode<unknown, infer V> ? V : never;

/**
 * Type helper for mutation result
 * 
 * @example
 * ```ts
 * type Result = MutationResult<typeof SignInDocument>;
 * ```
 */
export type MutationResult<T> = T extends TypedDocumentNode<infer R, unknown> ? R : never;
