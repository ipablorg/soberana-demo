/**
 * Authentication Store (Zustand)
 *
 * Centralized state management for authentication.
 * The Firebase JWT is kept in memory only — it is never written to
 * localStorage, which prevents token theft from there. On app boot the store
 * is empty; `startSessionRestore` (shared/lib/session-restore) asks the
 * Firebase SDK's own persisted session for a fresh ID token and feeds it back
 * through `restoreToken`, so a reload is transparent when Firebase still has
 * the user. `isRestoringSession` keeps route guards from redirecting to login
 * while that is in flight, and every `clearAuth` also signs Firebase out so a
 * logged-out user is not restored. When confirming the restored token is slow,
 * `sessionRecovery` flips to `'slow'` so the UI can offer retry / login instead
 * of dropping the session.
 */

import { create } from 'zustand';
import type { AuthStore, AuthUser } from '@/shared/types/auth.types';
import { setAuthToken, clearHeaders } from '@/shared/lib/graphql-client';
import { clearKycLink } from '@/shared/hooks/useKYC';
import {
  clearCustomerTypeRegistry,
  clearStoredCustomerContext,
  storeCustomerContext,
} from '@/shared/lib/kyc/customer-context';
import { queryClient } from '@/shared/lib/query-client';
import { resetIndicativeRateCache } from '@/shared/lib/indicative-rate';

/**
 * Side-effect hooks to run during `clearAuth`. Populated via
 * `registerLogoutHook`, not direct imports, so that modules whose
 * dependency graph sits *below* `auth-store` (e.g. Zentinel auth,
 * which already imports from `zentinel-client` which imports from
 * `auth-store`) can still participate in logout without creating a
 * circular import. Each hook is called synchronously, in registration
 * order, and exceptions are swallowed so a misbehaving hook cannot
 * block the rest of `clearAuth` from firing.
 */
const logout_hooks = new Set<() => void>();

/**
 * Register a callback to run at the start of every `clearAuth`.
 * Returns an unsubscribe function for symmetry with typical listener
 * APIs, though in practice hooks are registered once at app init and
 * never removed.
 */
export function registerLogoutHook(hook: () => void): () => void {
  logout_hooks.add(hook);
  return () => {
    logout_hooks.delete(hook);
  };
}

/**
 * Authentication store with Zustand
 *
 * @example
 * ```tsx
 * import { useAuthStore } from '@/shared/stores/auth-store';
 *
 * function Profile() {
 *   const user = useAuthStore((state) => state.user);
 *   const isStaff = useAuthStore((state) => state.isStaff());
 *
 *   return <div>{user?.name}</div>;
 * }
 * ```
 */
export const useAuthStore = create<AuthStore>()((set, get) => ({
  // State
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  // True until boot-time restoration (see `startSessionRestore`) settles, so
  // guards do not redirect to /login before Firebase has answered.
  isRestoringSession: true,
  // 'slow' while a restored token waits too long for `auth_me` (see above).
  sessionRecovery: 'idle',

  // Actions
  setAuth: (user: AuthUser, token: string) => {
    // Set token in GraphQL client
    setAuthToken(token);
    storeCustomerContext({
      customerType: null,
      businessName: user.company_name ?? null,
    });

    // Update store state
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
      // A signed-in user (fresh login or restored) ends any pending restore.
      isRestoringSession: false,
      sessionRecovery: 'idle',
    });
  },

  setToken: (token: string) => {
    // A refresh that resolves after logout must not revive the session.
    if (!get().isAuthenticated) return;

    // Deliberately does NOT go through setAuth: that rewrites the
    // persisted customer context (customer type / business name).
    setAuthToken(token);
    set({ token });
  },

  restoreToken: (token: string) => {
    // Never overwrite a live session, and never act once restoration has
    // ended (logout, give-up, sign-in): a late Firebase answer is stale. A
    // token that `auth_me` has not confirmed yet may be replaced, which is
    // how "Reintentar" hands over a freshly refreshed Firebase token.
    const { isAuthenticated, isRestoringSession } = get();
    if (isAuthenticated || !isRestoringSession) return false;

    // Header + token only. `isAuthenticated` stays false until `auth_me`
    // answers and `setAuth` runs, which also keeps the customer context
    // rewrite in the one place that already owns it.
    setAuthToken(token);
    set({ token });
    return true;
  },

  endSessionRestore: () => {
    set({ isRestoringSession: false, sessionRecovery: 'idle' });
  },

  markSessionRecoverySlow: () => {
    const { token, isAuthenticated, isRestoringSession } = get();
    // Only a restored token that `auth_me` has not confirmed can be "slow".
    if (!token || isAuthenticated || !isRestoringSession) return;
    set({ sessionRecovery: 'slow' });
  },

  clearAuth: () => {
    // Run registered logout hooks first (e.g. Zentinel drops its
    // in-memory JWT). Order matters: any hook that still needs the
    // Soberana token to make a final call must fire before we
    // clear the GraphQL headers below.
    for (const hook of logout_hooks) {
      try {
        hook();
      } catch {
        // Do not block logout on a misbehaving hook.
      }
    }
    // Clear GraphQL client headers
    clearHeaders();
    // Clear KYC link from localStorage
    clearKycLink();
    // Drop customer-type/business-name PII from localStorage so it
    // does not survive logout on a shared device.
    clearCustomerTypeRegistry();
    clearStoredCustomerContext();
    // Clear React Query cache (prevents stale user data across sessions)
    queryClient.clear();
    // Unpriced pairs are cached per session, outside React Query.
    resetIndicativeRateCache();

    // Clear store state
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      // Logging out (or a failed restore) means "nothing left to restore".
      isRestoringSession: false,
      sessionRecovery: 'idle',
    });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  // Role helper methods
  isStaff: () => {
    const { user } = get();
    return user ? user.staff_roles.length > 0 : false;
  },

  canAccessAllCompanies: () => {
    const { user } = get();
    return user ? user.roles.includes('ALL_COMPANIES') : false;
  },

  hasRole: (role: string) => {
    const { user } = get();
    return user ? user.roles.includes(role) : false;
  },

  hasAnyRole: (roles: string[]) => {
    const { user } = get();
    if (!user) return false;
    return roles.some((role) => user.roles.includes(role));
  },

  hasAllRoles: (roles: string[]) => {
    const { user } = get();
    if (!user) return false;
    return roles.every((role) => user.roles.includes(role));
  },
}));

/**
 * Initialize auth from in-memory state.
 *
 * With the token kept in memory only (no localStorage persistence), this is
 * a no-op on a fresh page load: the store is empty. Rebuilding the session
 * from Firebase's persisted user is `startSessionRestore`'s job. Kept for
 * backward compatibility with any call sites that invoke it on boot.
 */
export const initializeAuth = () => {
  const state = useAuthStore.getState();

  if (state.token && !state.isAuthenticated) {
    setAuthToken(state.token);
    useAuthStore.setState({
      isAuthenticated: true,
      isLoading: true,
    });
  }
};

/**
 * Selectors for common auth checks
 *
 * @example
 * ```tsx
 * const isAuthenticated = useAuthStore(selectIsAuthenticated);
 * const isStaff = useAuthStore(selectIsStaff);
 * ```
 */
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectUser = (state: AuthStore) => state.user;
export const selectToken = (state: AuthStore) => state.token;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
export const selectIsStaff = (state: AuthStore) => state.isStaff();
export const selectCanAccessAllCompanies = (state: AuthStore) => state.canAccessAllCompanies();
