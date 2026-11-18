/**
 * Authentication Types
 * 
 * Type definitions for authentication and authorization.
 * Based on backend's CurrentUser type from GraphQL schema.
 */

import type { CurrentUser } from '@/graphql/generated/graphql';

/**
 * Authenticated user data
 * 
 * This type represents the current logged-in user with all their roles.
 * It matches the backend's CurrentUser type from the GraphQL schema.
 */
export type AuthUser = CurrentUser;

/**
 * Authentication state
 * 
 * Manages authentication state in the Zustand store.
 */
export interface AuthState {
  /** Currently authenticated user (null if not logged in) */
  user: AuthUser | null;
  
  /** JWT token for API authentication */
  token: string | null;
  
  /** Whether user data is being loaded */
  isLoading: boolean;
  
  /** Authentication status */
  isAuthenticated: boolean;

  /**
   * True from app start until the boot-time session restoration (Firebase
   * persisted session -> ID token -> `auth_me`) has either signed the user in
   * or given up. Route guards wait on it instead of redirecting to login.
   */
  isRestoringSession: boolean;

  /**
   * `'slow'` when a restored token could not be confirmed with `auth_me` in a
   * reasonable time (or `auth_me` failed transiently). The session is kept and
   * the protected route offers "retry" / "go to login" instead of signing the
   * user out. `'idle'` otherwise.
   */
  sessionRecovery: 'idle' | 'slow';
}

/**
 * Authentication actions
 * 
 * Actions for managing authentication state.
 */
export interface AuthActions {
  /**
   * Set authenticated user and token
   * 
   * @param user - User data from backend
   * @param token - JWT token
   */
  setAuth: (user: AuthUser, token: string) => void;

  /**
   * Swap only the session token (store + GraphQL header), e.g. after a
   * silent refresh. Unlike `setAuth` it leaves the user and the persisted
   * customer context untouched, and it is ignored while signed out.
   *
   * @param token - Fresh JWT token
   */
  setToken: (token: string) => void;

  /**
   * Put a token recovered from the Firebase SDK's persisted session in the
   * store (+ GraphQL header) so `auth_me` can run and complete the sign-in.
   * Does not authenticate by itself. Refused (returns `false`) when the user is
   * already authenticated or restoration has already ended, so it can neither
   * overwrite a fresh sign-in nor revive a session that was just closed. It may
   * replace a restored token `auth_me` has not confirmed yet (a retry refreshes
   * it from Firebase).
   *
   * @param token - Fresh Firebase ID token
   */
  restoreToken: (token: string) => boolean;

  /**
   * Mark boot-time session restoration as finished without a session.
   */
  endSessionRestore: () => void;

  /**
   * Flag a restored-but-unconfirmed session as slow so the protected route
   * shows the recovery screen. Keeps the token and Firebase session untouched.
   * Ignored unless a token is waiting for `auth_me` while restoration is open.
   */
  markSessionRecoverySlow: () => void;

  /**
   * Clear authentication state (logout)
   */
  clearAuth: () => void;
  
  /**
   * Set loading state
   * 
   * @param isLoading - Whether auth is loading
   */
  setLoading: (isLoading: boolean) => void;
}

/**
 * Complete auth store type
 */
export type AuthStore = AuthState & AuthActions & {
  // Role helper methods
  
  /**
   * Check if user is a staff member
   * 
   * @returns true if user has staff roles
   */
  isStaff: () => boolean;
  
  /**
   * Check if user can access all companies
   * 
   * @returns true if user has ALL_COMPANIES role
   */
  canAccessAllCompanies: () => boolean;
  
  /**
   * Check if user has a specific role
   * 
   * @param role - Role name to check
   * @returns true if user has the role
   */
  hasRole: (role: string) => boolean;
  
  /**
   * Check if user has any of the specified roles
   * 
   * @param roles - Array of role names
   * @returns true if user has at least one role
   */
  hasAnyRole: (roles: string[]) => boolean;
  
  /**
   * Check if user has all specified roles
   * 
   * @param roles - Array of role names
   * @returns true if user has all roles
   */
  hasAllRoles: (roles: string[]) => boolean;
};

/**
 * User role constants
 * 
 * Common roles used in the application.
 */
export const UserRoles = {
  // Staff roles
  STAFF_ADMIN: 'STAFF_ADMIN',
  STAFF_COMPLIANCE: 'STAFF_COMPLIANCE',
  STAFF_TREASURY: 'STAFF_TREASURY',
  STAFF_SUPPORT: 'STAFF_SUPPORT',
  
  // Company roles
  COMPANY_ADMIN: 'COMPANY_ADMIN',
  COMPANY_USER: 'COMPANY_USER',
  COMPANY_VIEWER: 'COMPANY_VIEWER',
  
  // Special permissions
  ALL_COMPANIES: 'ALL_COMPANIES',
} as const;

export type UserRole = typeof UserRoles[keyof typeof UserRoles];

/**
 * Sign-in credentials
 */
export interface SignInCredentials {
  email: string;
  password: string;
}

/**
 * Sign-in response
 */
export interface SignInResponse {
  token: string;
  user: AuthUser;
}

/**
 * Firebase user data returned when registration is required
 */
export interface FirebaseUser {
  uid: string;
  email: string;
  email_verified: boolean;
  name?: string | null;
  customer_type?: string | null;
  company_name?: string | null;
  picture?: string | null;
  phone_number?: string | null;
}

/**
 * Normal login response
 */
export interface AuthResponseResult {
  __typename?: 'AuthResponse';
  access_token: string;
  user: AuthUser;
}

/**
 * Registration required response
 */
export interface RegistrationRequiredResponse {
  __typename?: 'RegistrationRequired';
  requires_registration: boolean;
  access_token: string;
  firebase_user: FirebaseUser;
}

/**
 * Union result of sign-in
 */
export type AuthSignInResult = AuthResponseResult | RegistrationRequiredResponse;

/**
 * Type guard for RegistrationRequired
 */
export function isRegistrationRequired(result: AuthSignInResult): result is RegistrationRequiredResponse {
  return 'requires_registration' in result && result.requires_registration === true;
}

/**
 * Complete Registration Data Input
 */
export interface CompleteRegistrationInput {
  accessToken: string;
  email: string;
  name: string;
  customerType?: 'individual' | 'business';
  company?: string;
  phone?: string;
  policy?: boolean;
  country?: string;
  identificationNumber?: string;
}
