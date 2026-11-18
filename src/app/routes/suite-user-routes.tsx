import { ViewAsBanner } from '@/shared/components/common/view-as-banner';
import {
  AppLayout,
  type DockSectionNavigationState,
} from '@/modules/suite-user/layouts/app-layout';
import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { ProtectedRoute } from './protected-route';
import { TransactionGuard } from '@/shared/components/common/TransactionGuard';
import { useDynamicIslandStore } from '@/shared/stores/useDynamicIslandStore';

// Dashboard
const ConversationalHome = lazy(
  () => import('@/modules/suite-user/features/dashboard/pages/conversational-home')
);

// MVP Features
const BeneficiariesPage = lazy(
  () => import('@/modules/suite-user/features/beneficiaries/pages/beneficiaries')
);

// KYC
const VerifyIdentityPage = lazy(
  () => import('@/modules/suite-user/features/bridge-kyc/pages/verify-identity-page')
);

// Settings
const Settings = lazy(() => import('@/modules/suite-user/features/settings/pages/settings'));
const SettingsIntegrations = lazy(
  () => import('@/modules/suite-user/features/settings/pages/integrations')
);
const Branding = lazy(() => import('@/modules/suite-user/features/settings/pages/branding'));

// Soberana Card
const SoberanaCard = lazy(
  () => import('@/modules/suite-user/features/soberana-card/pages/soberana-card')
);

// MVP: disabled - Move
// const MoveCollect = lazy(() => import('@/modules/suite-user/features/move/pages/collect'));
// const MovePayIns = lazy(() => import('@/modules/suite-user/features/move/pages/payins/MovePayIns'));
// const MovePayouts = lazy(() => import('@/modules/suite-user/features/move/pages/payouts'));
// const MoveTransfers = lazy(() => import('@/modules/suite-user/features/move/pages/transfers'));

// MVP: disabled - Change
// const ConvertFX = lazy(() => import('@/modules/suite-user/features/change/pages/fx'));
// const ConvertBridge = lazy(() => import('@/modules/suite-user/features/change/pages/bridge'));
// const RateRequestHistory = lazy(() => import('@/modules/suite-user/features/change/pages/rate-request-history'));

// MVP: disabled - Account (Cards)
// const AccountCards = lazy(() => import('@/modules/suite-user/features/account/pages/cards'));
// const CardPro = lazy(() => import('@/modules/suite-user/features/card-pro/pages/card-pro'));

// MVP: disabled - Marketplace
// const Marketplace = lazy(() => import('@/modules/suite-user/features/marketplace/pages/marketplace'));
// const Invest = lazy(() => import('@/modules/suite-user/features/marketplace/pages/invest'));

// MVP: disabled - AI Builder
// const BuildWithAI = lazy(() => import('@/modules/suite-user/features/ai-builder/pages/build-with-ai'));

// MVP: disabled - Automations
// const Automations = lazy(() => import('@/modules/suite-user/features/automations/pages/automations'));

// MVP: disabled - COMEX
// const ComexDashboard = lazy(() => import('@/modules/suite-user/features/comex/pages/comex-dashboard'));
// const NewComexOperation = lazy(() => import('@/modules/suite-user/features/comex/pages/new-operation-wizard'));

// MVP: disabled - Policy
// const PolicyCenter = lazy(() => import('@/modules/suite-user/features/policy/pages/policy-center'));

// MVP: disabled - Connectors
// const ConnectorsMarketplace = lazy(() => import('@/modules/suite-user/features/connectors/pages/connectors-marketplace'));

// MVP: disabled - Analytics
// const Analytics = lazy(() => import('@/modules/suite-user/features/analytics/pages/analytics'));
// const RunHistory = lazy(() => import('@/modules/suite-user/features/analytics/pages/run-history'));
// const Reports = lazy(() => import('@/modules/suite-user/features/analytics/pages/reports'));

// MVP: disabled - Compliance
// const Compliance = lazy(() => import('@/modules/suite-user/features/compliance/pages/compliance'));

// MVP: disabled - Management
// const Counterparties = lazy(() => import('@/modules/suite-user/features/management/pages/counterparties'));
// const Developers = lazy(() => import('@/modules/suite-user/features/management/pages/developers'));

// MVP: disabled - Legacy Dashboard variants
// const Home = lazy(() => import('@/modules/suite-user/features/dashboard/pages/home'));
// const Suite = lazy(() => import('@/modules/suite-user/features/dashboard/pages/suite'));
// const BankAccounts = lazy(() => import('@/modules/suite-user/features/account/pages/bank-accounts'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

/**
 * Legacy deep links (`/suite/send`, `/suite/receive`) now open the dashboard
 * with the matching Dynamic Island flow active: there is a single send and a
 * single receive implementation, the one narrated by the island.
 */
export function OpenIslandFlow({ mode }: { mode: 'send' | 'receive' }) {
  const navigate = useNavigate();
  const setMode = useDynamicIslandStore((s) => s.setMode);

  useEffect(() => {
    setMode(mode);
    // The flow renders inside the dashboard home section: ask the layout for it.
    const state: DockSectionNavigationState = { dockSection: 'home' };
    navigate('/suite/dashboard', { replace: true, state });
  }, [mode, navigate, setMode]);

  return null;
}

export function SuiteUserRoutes() {
  return (
    <Routes>
      {/* Legacy Bridge KYC entry: Bridge is gone, KYC lives at verify-identity.
          Kept as a redirect only so old bookmarks and emails still land. */}
      <Route path="bridge-kyc-start" element={<Navigate to="/suite/verify-identity" replace />} />

      {/* In-app KYC (api method) - Full-page wizard, no layout */}
      <Route
        path="verify-identity"
        element={
          <ProtectedRoute enforceOnboardingGate skipOnboardingGate>
            <Suspense fallback={<LoadingFallback />}>
              <VerifyIdentityPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Protected user routes with layout */}
      <Route
        element={
          <ProtectedRoute enforceOnboardingGate>
            <ViewAsBanner />
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard — canonical URL is /suite/dashboard. /suite redirects.
            On desktop, the layout renders SuiteShell (dock + inline
            sections) instead of this route element; on mobile, it
            renders the legacy ConversationalHome directly. */}
        <Route index element={<Navigate to="/suite/dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ConversationalHome />
            </Suspense>
          }
        />

        {/* Receive / Send: same flows the dashboard island runs. */}
        <Route path="receive" element={<OpenIslandFlow mode="receive" />} />
        <Route path="send" element={<OpenIslandFlow mode="send" />} />

        {/* Movimientos: standalone URL was retired in favor of the
            inline `transactions` section inside SuiteShell. Old
            bookmarks land on the dashboard, where the user can pick
            the dock's Movimientos section. */}
        <Route path="transactions" element={<Navigate to="/suite/dashboard" replace />} />

        {/* Beneficiaries — kept as a deep-linkable URL for legacy
            navigation (CommandPalette, in-page links). The
            equivalent inline view inside SuiteShell shares the same
            implementation via `BeneficiariesView`. */}
        <Route
          path="beneficiaries"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <TransactionGuard>
                <BeneficiariesPage />
              </TransactionGuard>
            </Suspense>
          }
        />

        {/* Zentinel: standalone URL was retired in favor of the
            in-dashboard ZentinelChatView (opened by GradientCircleButton
            in ConversationalHome). */}
        <Route path="zentinel" element={<Navigate to="/suite/dashboard" replace />} />
        <Route path="sovy" element={<Navigate to="/suite/dashboard" replace />} />

        {/* Settings */}
        <Route
          path="settings"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Settings />
            </Suspense>
          }
        />
        <Route
          path="settings/integrations"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <SettingsIntegrations />
            </Suspense>
          }
        />
        <Route
          path="settings/branding"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Branding />
            </Suspense>
          }
        />

        {/* Soberana Card — deep-linkable URL; the dock's Soberana Card
            section renders the same page inside SuiteShell. */}
        <Route
          path="soberana-card"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <SoberanaCard />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
