/**
 * Protected Route Component
 *
 * HOC for route protection with role-based access control.
 * Redirects to login if not authenticated or to unauthorized if insufficient permissions.
 *
 * ⚡ DEV MODE: Bypasses authentication when mock mode is enabled.
 */

import { ViewAsOnboardingNotice } from '@/shared/components/common/view-as-onboarding-notice';
import { selectIsViewingAs, useViewAsStore } from '@/shared/stores/view-as-store';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/use-auth';
import { isDevMockMode } from '@/shared/lib/dev-config';
import { LoadingScreen } from '@/shared/components/common/loading-screen';
import { PostLoginTransition } from '@/shared/components/common/post-login-transition';
import { SessionRecoveryScreen } from '@/shared/components/common/session-recovery-screen';
import { retrySessionRestore } from '@/shared/lib/session-restore';
import { canRestoreFirebaseUser } from '@/app/providers/session-restore-policy';
import { useLayoutEffect, useState, type ReactNode } from 'react';
import { useKYC } from '@/shared/hooks/useKYC';
import { useRequireMfaEnrollment } from '@/shared/hooks/require-mfa-enrollment';
import { MfaEnrollmentRequired } from '@/shared/components/common/mfa-enrollment-required';
import { StaffMfaAlert } from '@/shared/components/common/staff-mfa-alert';
import { isStaffMfaOptional } from '@/modules/common/auth/api/auth-enforcement';
import { getHomeRoute, TENANT_HOME_ROUTE } from '@/shared/lib/tenant-roles';
import { queryClient } from '@/shared/lib/query-client';
import {
  selectHasPendingActAs,
  selectIsActAsActive,
  useActAsStore,
} from '@/shared/stores/act-as-store';
import { shouldGateSuiteOnboarding, SUITE_ONBOARDING_REDIRECT_PATH } from './suite-onboarding-gate';

interface ProtectedRouteProps {
  /** Component/element to render if authorized */
  children: ReactNode;
  requiredRoles?: string[];
  requiredAllRoles?: string[];
  requireStaff?: boolean;
  requireAllCompanies?: boolean;
  isAuthorized?: () => boolean;
  unauthorizedRedirect?: string;
  loginRedirect?: string;
  enforceOnboardingGate?: boolean;
  skipOnboardingGate?: boolean;
}

const UNAUTHORIZED_ROUTE = '/unauthorized';
const LOGIN_ROUTE = '/login';

/**
 * Protected Route HOC
 *
 * @example
 * ```tsx
 * // Basic authentication required
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 *
 * // Staff only
 * <ProtectedRoute requireStaff>
 *   <AdminPanel />
 * </ProtectedRoute>
 *
 * // Specific roles required (any)
 * <ProtectedRoute requiredRoles={['COMPANY_ADMIN', 'STAFF_ADMIN']}>
 *   <CompanySettings />
 * </ProtectedRoute>
 *
 * // Multiple roles required (all)
 * <ProtectedRoute requiredAllRoles={['STAFF_ADMIN', 'ALL_COMPANIES']}>
 *   <SystemSettings />
 * </ProtectedRoute>
 *
 * // Custom authorization
 * <ProtectedRoute isAuthorized={() => user?.email.endsWith('@loopay.com')}>
 *   <InternalTools />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  requiredRoles,
  requiredAllRoles,
  requireStaff = false,
  requireAllCompanies = false,
  isAuthorized: customAuthCheck,
  unauthorizedRedirect = UNAUTHORIZED_ROUTE,
  loginRedirect,
  enforceOnboardingGate = false,
  skipOnboardingGate = false,
}: ProtectedRouteProps) {
  const location = useLocation();
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    isRestoringSession,
    sessionRecovery,
    isStaff,
    canAccessAllCompanies,
    hasAnyRole,
    hasAllRoles,
  } = useAuth();

  const finalLoginRedirect = loginRedirect || LOGIN_ROUTE;
  // After a reload the token is rebuilt from Firebase's persisted session;
  // until that settles, "not authenticated" only means "not known yet", so
  // wait instead of redirecting (which would also lose the URL). Already
  // authenticated users are never held back.
  const isLoading = isAuthLoading || (isRestoringSession && !isAuthenticated);

  // ⚡ DEV MODE: Bypass all authentication checks
  if (isDevMockMode()) {
    return <>{children}</>;
  }

  // A restored session the server could not confirm (slow, unreachable) is not
  // a failed one: keep the user on this URL and let them retry or leave, instead
  // of loading forever or bouncing to /login. Checked before the loading state, which stays true
  // while the `auth_me` request is still hanging.
  if (sessionRecovery === 'slow' && !isAuthenticated) {
    return <SessionRecoveryPrompt />;
  }

  // Early return: Loading state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Early return: Not authenticated
  if (!isAuthenticated) {
    return <Navigate to={finalLoginRedirect} state={{ from: location }} replace />;
  }

  // Early return: Staff users bypass KYC check
  if (isStaff) {
    return (
      <PostLoginTransition ready={isAuthenticated && !isLoading}>{children}</PostLoginTransition>
    );
  }

  // Check other authorization rules
  const authChecks = [
    { condition: customAuthCheck && !customAuthCheck(), reason: 'custom' },
    { condition: requireStaff && !isStaff, reason: 'staff' },
    { condition: requireAllCompanies && !canAccessAllCompanies, reason: 'allCompanies' },
    { condition: requiredRoles && !hasAnyRole(requiredRoles), reason: 'roles' },
    { condition: requiredAllRoles && !hasAllRoles(requiredAllRoles), reason: 'allRoles' },
  ];

  const failedCheck = authChecks.find((check) => check.condition);

  if (failedCheck) {
    return <Navigate to={unauthorizedRedirect} state={{ from: location }} replace />;
  }

  const content = (
    <PostLoginTransition ready={isAuthenticated && !isLoading}>{children}</PostLoginTransition>
  );

  if (!enforceOnboardingGate || skipOnboardingGate) {
    return content;
  }

  return <SuiteOnboardingGuard>{content}</SuiteOnboardingGuard>;
}

/**
 * Recovery screen wired to the session: "Intentar nuevamente" re-runs the
 * restoration (fresh Firebase token + `auth_me`; if that finds the session
 * expired it ends on login with the expiry notice), "Volver a ingresar" is the
 * user's explicit choice to drop the session (`clearAuth` also signs Firebase
 * out, and deliberately shows no expiry notice).
 */
function SessionRecoveryPrompt() {
  const { logout } = useAuth();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await retrySessionRestore({ canRestore: canRestoreFirebaseUser });
    } finally {
      setRetrying(false);
    }
  };

  return (
    <SessionRecoveryScreen
      retrying={retrying}
      onRetry={() => void handleRetry()}
      onLogin={logout}
    />
  );
}

function SuiteOnboardingGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isStaff, user } = useAuth();
  const isViewingAs = useViewAsStore(selectIsViewingAs);
  const {
    hasSubmittedApiOnboarding,
    isReadyForSuite,
    isKYCFailed,
    isKYCRejected,
    isLoading,
    kycStatus,
    needsKycRetry,
    needsManualRefresh,
    tosAccepted,
  } = useKYC();

  if (isLoading) {
    return <LoadingScreen />;
  }

  const gated = shouldGateSuiteOnboarding({
    pathname: location.pathname,
    hasFailedKyc: isKYCFailed,
    hasRejectedKyc: isKYCRejected,
    isStaff,
    hasRetryableKyc: needsKycRetry,
    isReadyForSuite,
    kycStatus,
    needsManualRefresh,
    tosAccepted,
    hasAcceptedLatestTerms: user?.has_accepted_latest_terms,
    hasSubmittedApiOnboarding,
  });

  // #415: a super admin viewing a customer never lands in the onboarding wizard.
  if (gated && isViewingAs) {
    return <ViewAsOnboardingNotice kycStatus={kycStatus ?? null} />;
  }

  if (gated) {
    return <Navigate to={SUITE_ONBOARDING_REDIRECT_PATH} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/**
 * Where a tenant admin enrolls a second factor: the tenant security page,
 * outside the enrollment guard (and never the customer settings, which sit
 * behind the `/suite` onboarding gate).
 */
export const TENANT_MFA_SETUP_ROUTE = '/tenant/settings/security';

/**
 * Blocks its children until the signed-in Firebase user has at least one
 * enrolled second factor (staff and tenant surfaces). `setupRoute` is where
 * the blocking screen sends the user to enroll one.
 */
function MfaEnrollmentGuard({
  children,
  setupRoute,
}: {
  children: ReactNode;
  setupRoute?: string;
}) {
  const { isChecking, isEnrolled, recheck } = useRequireMfaEnrollment();

  if (isChecking) {
    return <LoadingScreen />;
  }

  if (!isEnrolled) {
    // Optional mode (deployment choice): let staff in, keep the alert on screen.
    if (isStaffMfaOptional()) {
      return (
        <>
          <StaffMfaAlert />
          {children}
        </>
      );
    }
    return <MfaEnrollmentRequired onRecheck={recheck} setupRoute={setupRoute} />;
  }

  return <>{children}</>;
}

/**
 * Ends an active act-as (epic 2026-11 S5) when a staff surface mounts: "Exit"
 * in the tenant backoffice only navigates to the client detail, and the staff
 * member comes back here, after the tenant tree is gone. Restoring it while
 * still on `/tenant` made the tenant guard redirect it to `/backoffice` first.
 * Also covers leaving `/tenant` any other way (browser back). The tenant
 * responses cached under the synthetic identity are dropped with it.
 */
function ActAsExit({ children }: { children: ReactNode }) {
  const active = useActAsStore(selectIsActAsActive);
  const endActAs = useActAsStore((state) => state.endActAs);

  useLayoutEffect(() => {
    if (!active) return;
    endActAs();
    queryClient.clear();
  }, [active, endActAs]);

  if (active) return <LoadingScreen />;

  return <>{children}</>;
}

/**
 * Staff-only route wrapper. Staff additionally require an enrolled MFA factor.
 */
export function StaffRoute({ children }: { children: ReactNode }) {
  return (
    <ActAsExit>
      <ProtectedRoute requireStaff loginRedirect={LOGIN_ROUTE}>
        <MfaEnrollmentGuard>{children}</MfaEnrollmentGuard>
      </ProtectedRoute>
    </ActAsExit>
  );
}

/**
 * Lets only tenant admins (`auth_me.roles` holds `CLIENT_ADMIN`, not staff)
 * through; anyone else lands on the home of their own app.
 */
function TenantAdminGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const home = getHomeRoute(user);

  if (home !== TENANT_HOME_ROUTE) {
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}

/**
 * Activates a staged act-as (epic 2026-11 S5) once the tenant tree is mounted:
 * the backoffice tree is gone by then, so none of its queries can go out with
 * `x-act-as-client` and none of its staff-only guards sees the synthetic
 * tenant admin. Runs before paint (layout effect); until then nothing below
 * renders as the staff member.
 */
function ActAsActivation({ children }: { children: ReactNode }) {
  const pending = useActAsStore(selectHasPendingActAs);
  const activateActAs = useActAsStore((state) => state.activateActAs);

  useLayoutEffect(() => {
    if (pending) activateActAs();
  }, [pending, activateActAs]);

  if (pending) return <LoadingScreen />;

  return <>{children}</>;
}

/**
 * Tenant backoffice route wrapper (`/tenant/*`): signed in, tenant admin and an
 * enrolled second factor (the backend asks for it on every sensitive tenant
 * mutation, governed by the same `STAFF_MFA_ENFORCEMENT` as staff). The `/suite`
 * onboarding/KYC gate never applies here.
 */
export function TenantRoute({ children }: { children: ReactNode }) {
  return (
    <ActAsActivation>
      <ProtectedRoute loginRedirect={LOGIN_ROUTE}>
        <TenantAdminGuard>
          <MfaEnrollmentGuard setupRoute={TENANT_MFA_SETUP_ROUTE}>{children}</MfaEnrollmentGuard>
        </TenantAdminGuard>
      </ProtectedRoute>
    </ActAsActivation>
  );
}

/**
 * Wrapper of the tenant second-factor enrollment page
 * (`TENANT_MFA_SETUP_ROUTE`): signed in and tenant admin like `TenantRoute`,
 * without the enrollment guard (that page is how the guard gets satisfied)
 * and without the `/suite` onboarding gate.
 */
export function TenantMfaSetupRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute loginRedirect={LOGIN_ROUTE}>
      <TenantAdminGuard>{children}</TenantAdminGuard>
    </ProtectedRoute>
  );
}

/**
 * Company admin route wrapper
 */
export function CompanyAdminRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute requiredRoles={['COMPANY_ADMIN']}>{children}</ProtectedRoute>;
}

/**
 * All companies access route wrapper
 */
export function AllCompaniesRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute requireAllCompanies>{children}</ProtectedRoute>;
}
