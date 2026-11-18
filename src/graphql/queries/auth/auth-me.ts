/**
 * Auth Module - Get Current User Query
 * 
 * Query to get the currently authenticated user's full profile.
 * This replaces the REST /api/auth/me endpoint.
 */

import { gql } from '@/graphql/generated';

/**
 * Get current authenticated user
 * 
 * Fetches complete user profile including all roles and permissions.
 * Requires valid JWT token in Authorization header.
 * 
 * @example
 * ```tsx
 * import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
 * import { AuthMeDocument } from '@/graphql/queries/auth';
 * 
 * function useCurrentUser() {
 *   return useGraphQLQuery(
 *     ['auth', 'me'],
 *     AuthMeDocument,
 *     undefined,
 *     {
 *       // Only fetch if we have a token
 *       enabled: hasAuthToken(),
 *       // Refetch on window focus
 *       refetchOnWindowFocus: true,
 *       // Cache for 5 minutes
 *       staleTime: 5 * 60 * 1000,
 *     }
 *   );
 * }
 * ```
 */
export const AuthMeDocument = gql(`
  query AuthMe {
    auth_me {
      id
      auth_uid
      email
      name
      roles
      staff_roles
      company_roles
      company_user {
        company_id
        role
      }
      has_accepted_latest_terms
      client_id
      customer_profile_id
      kyc_status
      company_name
    }
  }
`);
