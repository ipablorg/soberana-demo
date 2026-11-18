/**
 * useAuth Hook
 * 
 * Convenient hook for accessing authentication state and actions.
 * Wraps the Zustand auth store with a cleaner API.
 */

import { useAuthStore, selectIsAuthenticated, selectUser, selectIsStaff } from '@/shared/stores/auth-store';
import type { AuthUser } from '@/shared/types/auth.types';

/**
 * Hook for authentication
 * 
 * Provides access to auth state and helper methods.
 * 
 * @returns Authentication state and methods
 * 
 * @example
 * ```tsx
 * function Profile() {
 *   const { user, isAuthenticated, isStaff, logout } = useAuth();
 *   
 *   if (!isAuthenticated) {
 *     return <Navigate to="/login" />;
 *   }
 *   
 *   return (
 *     <div>
 *       <h1>{user?.name}</h1>
 *       {isStaff && <AdminPanel />}
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth() {
  const user = useAuthStore(selectUser);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isRestoringSession = useAuthStore((state) => state.isRestoringSession);
  const sessionRecovery = useAuthStore((state) => state.sessionRecovery);

  // Actions
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setLoading = useAuthStore((state) => state.setLoading);
  
  // Role helpers
  const isStaff = useAuthStore(selectIsStaff);
  const canAccessAllCompanies = useAuthStore((state) => state.canAccessAllCompanies());
  const hasRole = useAuthStore((state) => state.hasRole);
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
  const hasAllRoles = useAuthStore((state) => state.hasAllRoles);
  
  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    isRestoringSession,
    sessionRecovery,

    // Actions
    setAuth,
    logout: clearAuth,
    setLoading,
    
    // Role helpers
    isStaff,
    canAccessAllCompanies,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  };
}

/**
 * Hook to require authentication
 * 
 * Returns user if authenticated, null otherwise.
 * Useful for components that require auth.
 * 
 * @returns Authenticated user or null
 * 
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   const user = useRequireAuth();
 *   
 *   if (!user) {
 *     return <Navigate to="/login" />;
 *   }
 *   
 *   return <div>Welcome {user.name}</div>;
 * }
 * ```
 */
export function useRequireAuth(): AuthUser | null {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore(selectUser);
  
  return isAuthenticated ? user : null;
}

/**
 * Hook to check if user has required roles
 * 
 * @param requiredRoles - Array of role names that user must have
 * @param requireAll - If true, user must have ALL roles. If false, user must have at least ONE role.
 * @returns true if user has required roles
 * 
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const hasAccess = useHasRoles(['STAFF_ADMIN', 'STAFF_COMPLIANCE']);
 *   
 *   if (!hasAccess) {
 *     return <div>Access denied</div>;
 *   }
 *   
 *   return <AdminDashboard />;
 * }
 * ```
 */
export function useHasRoles(requiredRoles: string[], requireAll = false): boolean {
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
  const hasAllRoles = useAuthStore((state) => state.hasAllRoles);
  
  if (requireAll) {
    return hasAllRoles(requiredRoles);
  }
  
  return hasAnyRole(requiredRoles);
}
