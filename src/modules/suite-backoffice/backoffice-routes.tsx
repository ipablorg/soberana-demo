import { lazy, Suspense, type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { BackofficeLayout } from '@/modules/suite-backoffice/layouts/backoffice-layout';
import { StaffRoute } from '@/app/routes/protected-route';
import { useAuthStore } from '@/shared/stores/auth-store';
import {
  canAccessBackofficeRoute,
  getBackofficeAccess,
  getBackofficeLandingRoute,
} from '@/shared/config/backoffice-modes.config';

// Move feature pages (manual ops queues)
const RecaudosQueue = lazy(() => import('@/modules/suite-backoffice/features/move/pages/recaudos-queue'));
const DispersionesQueue = lazy(() => import('@/modules/suite-backoffice/features/move/pages/dispersiones-queue'));

// Compliance feature pages (manual review queues)
const ComplianceReview = lazy(() => import('@/modules/suite-backoffice/features/compliance-review/pages/review'));
const EndorsementsQueue = lazy(() => import('@/modules/suite-backoffice/features/compliance-review/pages/endorsements-queue'));
const BeneficiariesQueue = lazy(() => import('@/modules/suite-backoffice/features/compliance-review/pages/beneficiaries-queue'));

// Virtual accounts & wallet ops
const VirtualAccounts = lazy(() => import('@/modules/suite-backoffice/features/virtual-accounts/pages/virtual-accounts'));

// Clients (tenant management)
const ClientsList = lazy(() => import('@/modules/suite-backoffice/features/clients/pages/clients-list'));

// Customer 360
const Customer360 = lazy(() => import('@/modules/suite-backoffice/features/customers/pages/customer-360'));

// Transactions explorer
const TransactionExplorer = lazy(() => import('@/modules/suite-backoffice/features/transactions/pages/transaction-explorer'));

// Platform config (PLATFORM_ADMIN only)
const PlatformConfig = lazy(() => import('@/modules/suite-backoffice/features/platform-config/pages/platform-config'));

// Staff user management (LOOPAY_ADMIN only — superuser is bootstrap-only)
const StaffUsers = lazy(() => import('@/modules/suite-backoffice/features/staff-users/pages/staff-users'));

// Commercial onboarding, fee schedules and fee ledger (OPS_COMMERCIAL / LOOPAY_ADMIN)
const CommercialClients = lazy(() => import('@/modules/suite-backoffice/features/commercial/pages/commercial-clients'));
const ClientCommercialNew = lazy(() => import('@/modules/suite-backoffice/features/commercial/pages/client-commercial-new'));
const ClientCommercialDetail = lazy(() => import('@/modules/suite-backoffice/features/commercial/pages/client-commercial-detail'));

// Provider requirements review queue (S21, OPS_COMMERCIAL / LOOPAY_ADMIN)
const ProviderRequirementsQueue = lazy(() => import('@/modules/suite-backoffice/features/provider-requirements/pages/provider-requirements-queue'));

const NotFound = lazy(() => import('@/modules/common/errors/pages/not-found'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const NO_STAFF_ROLES: readonly string[] = [];
const FALLBACK_LANDING_ROUTE = '/backoffice/compliance-review';

/**
 * Renders the page only when the signed-in roles may use the section (same
 * role map as the sidebar); otherwise the not-found page, so a role never sees
 * a section shell whose requests the backend rejects with FORBIDDEN.
 */
function RoleGuard({ url, children }: { url: string; children: ReactNode }) {
  const staffRoles = useAuthStore((state) => state.user?.staff_roles ?? NO_STAFF_ROLES);

  if (!canAccessBackofficeRoute(url, staffRoles)) {
    return <Suspense fallback={<LoadingFallback />}><NotFound /></Suspense>;
  }

  return <>{children}</>;
}

/** `/backoffice` sends each role to the first section it can open. */
function BackofficeIndexRedirect() {
  const staffRoles = useAuthStore((state) => state.user?.staff_roles ?? NO_STAFF_ROLES);
  const target = getBackofficeLandingRoute(getBackofficeAccess(staffRoles));

  return <Navigate to={target ?? FALLBACK_LANDING_ROUTE} replace />;
}

function guarded(url: string, page: ReactNode) {
  return (
    <RoleGuard url={url}>
      <Suspense fallback={<LoadingFallback />}>{page}</Suspense>
    </RoleGuard>
  );
}

export function SuiteBackofficeRoutes() {
  // The platform route is not registered at all without the role, so a direct
  // visit falls through to the not-found route below.
  // Platform config and the staff directory are super-admin (LOOPAY_ADMIN)
  // work; the commercial section only exists for OPS_COMMERCIAL / LOOPAY_ADMIN.
  const staffRoles = useAuthStore((state) => state.user?.staff_roles ?? NO_STAFF_ROLES);
  const { canAccessPlatformConfig, canManageStaffUsers, canAccessCommercial } =
    getBackofficeAccess(staffRoles);

  return (
    <Routes>
      {/* Default route redirects to companies (protected) */}
      {/* Default route lands on the manual ops center; the legacy companies
          dashboard predates Round 3 and is not the staff entry point. */}
      <Route index element={<StaffRoute><BackofficeIndexRedirect /></StaffRoute>} />
      
      {/* Protected backoffice routes (Staff only) */}
      <Route element={<StaffRoute><BackofficeLayout /></StaffRoute>}>
        {/* Move mode routes - Flatten to avoid nesting issues */}
        <Route path="move" element={<Navigate to="/backoffice/move/recaudos" replace />} />
        <Route path="move/recaudos" element={guarded('/backoffice/move/recaudos', <RecaudosQueue />)} />
        <Route path="move/dispersiones" element={guarded('/backoffice/move/dispersiones', <DispersionesQueue />)} />

        {/* Compliance manual review queues */}
        <Route path="compliance-review" element={guarded('/backoffice/compliance-review', <ComplianceReview />)} />
        <Route path="compliance" element={<Navigate to="/backoffice/compliance-review" replace />} />
        <Route path="compliance/endorsements" element={guarded('/backoffice/compliance/endorsements', <EndorsementsQueue />)} />
        <Route path="compliance/beneficiaries" element={guarded('/backoffice/compliance/beneficiaries', <BeneficiariesQueue />)} />

        {/* Virtual accounts & wallet ops */}
        <Route path="virtual-accounts" element={guarded('/backoffice/virtual-accounts', <VirtualAccounts />)} />

        {/* Provider requirements: what customers uploaded for VA providers */}
        <Route path="provider-requirements" element={guarded('/backoffice/provider-requirements', <ProviderRequirementsQueue />)} />

        {/* Clients (tenant management) */}
        <Route path="clients" element={guarded('/backoffice/clients', <ClientsList />)} />

        {/* Customer 360 */}
        <Route path="customers" element={guarded('/backoffice/customers', <Customer360 />)} />

        {/* Transactions explorer */}
        <Route path="transactions" element={guarded('/backoffice/transactions', <TransactionExplorer />)} />

        {/* Provider & platform config: only exists for PLATFORM_ADMIN / LOOPAY_ADMIN */}
        {canAccessPlatformConfig ? (
          <Route path="platform" element={<Suspense fallback={<LoadingFallback />}><PlatformConfig /></Suspense>} />
        ) : null}
        {canAccessCommercial ? (
          <>
            <Route path="commercial" element={<Navigate to="/backoffice/commercial/clients" replace />} />
            <Route path="commercial/clients" element={<Suspense fallback={<LoadingFallback />}><CommercialClients /></Suspense>} />
            <Route path="commercial/clients/new" element={<Suspense fallback={<LoadingFallback />}><ClientCommercialNew /></Suspense>} />
            <Route path="commercial/clients/:clientId" element={<Suspense fallback={<LoadingFallback />}><ClientCommercialDetail /></Suspense>} />
          </>
        ) : null}
        {canManageStaffUsers ? (
          <Route path="platform/staff-users" element={<Suspense fallback={<LoadingFallback />}><StaffUsers /></Suspense>} />
        ) : null}
      </Route>

      {/* Unknown backoffice paths. Wrapped in StaffRoute so the auth/roles load
          finishes before deciding (a role-gated route registers once roles arrive). */}
      <Route path="*" element={<StaffRoute><Suspense fallback={<LoadingFallback />}><NotFound /></Suspense></StaffRoute>} />
    </Routes>
  );
}
