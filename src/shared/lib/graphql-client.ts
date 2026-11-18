/**
 * GraphQL Client Configuration
 *
 * Centralized GraphQL client using graphql-request.
 * Handles authentication tokens and company headers.
 */

import { GraphQLClient } from 'graphql-request';
import { withRecentAuth } from '@/shared/lib/reauth';

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:3000/graphql';

/**
 * Global GraphQL client instance
 *
 * This client is shared across the application and maintains
 * headers for authentication and company context.
 */
export const graphqlClient = new GraphQLClient(GRAPHQL_URL, {
  headers: {
    'Content-Type': 'application/json',
  },
  // Don't send credentials (cookies) - we use Authorization header instead
  credentials: 'omit',
});

/**
 * Re-authentication interception
 *
 * Every GraphQL call in the app goes through `graphqlClient.request`, including
 * the hooks that call it directly instead of via `useGraphQLQuery`. Wrapping the
 * method here is what makes the `REAUTH_REQUIRED` prompt-and-retry behaviour
 * consistent across the whole surface rather than per call site.
 */
const requestWithoutReauth = graphqlClient.request.bind(graphqlClient);
graphqlClient.request = withRecentAuth(
  requestWithoutReauth as (...args: unknown[]) => Promise<unknown>
) as typeof graphqlClient.request;

/**
 * Set authentication token in client headers
 *
 * @param token - JWT token from backend
 */
export const setAuthToken = (token: string): void => {
  graphqlClient.setHeader('Authorization', `Bearer ${token}`);
};

/**
 * Set company header for company-specific requests
 *
 * Used by Company users to specify which company they're acting on behalf of.
 * Staff users with ALL_COMPANIES role don't need this.
 *
 * @param companyId - Company ID to set in header
 */
export const setCompanyHeader = (companyId: string): void => {
  graphqlClient.setHeader('x-company-id', companyId);
};

/**
 * View the client app as one customer (LOOPAY_ADMIN and OPS_COMMERCIAL,
 * read-only on the backend, Loopay2/SOBERANA#415). Setting it clears
 * `x-act-as-client`; `null` leaves view-as mode.
 *
 * @param customerProfileId - Customer profile to view, or null to stop
 */
export const setViewAsHeader = (customerProfileId: string | null): void => {
  // The backend refuses both identity headers at once (400 IDENTITY_HEADERS_CONFLICT).
  if (customerProfileId) graphqlClient.setHeader('x-act-as-client', '');
  graphqlClient.setHeader('x-view-as-customer', customerProfileId ?? '');
};

/**
 * Act as a tenant admin of one client (LOOPAY_ADMIN / OPS_COMMERCIAL with a
 * second factor, epic 2026-11 S5): only `tenant_*` and `auth_me` answer under
 * it. Setting it clears `x-view-as-customer`; `null` leaves act-as mode (an
 * empty header counts as absent on the backend).
 *
 * @param clientId - Client to act as, or null to stop
 */
export const setActAsHeader = (clientId: string | null): void => {
  if (clientId) graphqlClient.setHeader('x-view-as-customer', '');
  graphqlClient.setHeader('x-act-as-client', clientId ?? '');
};

/**
 * Clear all authentication and company headers
 *
 * Call this on logout to remove sensitive headers.
 */
export const clearHeaders = (): void => {
  graphqlClient.setHeader('Authorization', '');
  graphqlClient.setHeader('x-company-id', '');
  graphqlClient.setHeader('x-view-as-customer', '');
  graphqlClient.setHeader('x-act-as-client', '');
};

/**
 * Get current headers (for debugging)
 *
 * @returns Current client headers
 */
export const getHeaders = (): Record<string, string> => {
  return graphqlClient.requestConfig.headers as Record<string, string>;
};

/**
 * Check if client has authentication token
 *
 * @returns true if Authorization header is set
 */
export const hasAuthToken = (): boolean => {
  const headers = getHeaders();
  return Boolean(headers.Authorization && headers.Authorization !== '');
};

export default graphqlClient;
