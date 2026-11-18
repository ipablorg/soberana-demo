/**
 * Tenant backoffice routes (`/tenant/*`), lazy-loaded from the app router so
 * the module ships in its own chunk and only tenant admins download it.
 *
 * Every route sits behind `TenantRoute` (signed in, CLIENT_ADMIN, enrolled
 * second factor) but the enrollment page itself (`settings/security`, behind
 * `TenantMfaSetupRoute`); the back still scopes every `tenant_*` operation to
 * the signed-in admin's client.
 */

import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { TenantMfaSetupRoute, TenantRoute } from '@/app/routes/protected-route';
import { TENANT_ROUTES } from '@/shared/config/tenant-modes.config';
import { TenantLayout } from '@/modules/suite-tenant/layouts/tenant-layout';

const TenantOverview = lazy(
  () => import('@/modules/suite-tenant/features/overview/pages/tenant-overview')
);
const CustomersList = lazy(
  () => import('@/modules/suite-tenant/features/customers/pages/customers-list')
);
const CustomerNew = lazy(
  () => import('@/modules/suite-tenant/features/customers/pages/customer-new')
);
const CustomerDetail = lazy(
  () => import('@/modules/suite-tenant/features/customers/pages/customer-detail')
);
const WalletsList = lazy(
  () => import('@/modules/suite-tenant/features/wallets/pages/wallets-list')
);
const WalletDetail = lazy(
  () => import('@/modules/suite-tenant/features/wallets/pages/wallet-detail')
);
const TransactionsList = lazy(
  () => import('@/modules/suite-tenant/features/transactions/pages/transactions-list')
);
const TransactionNew = lazy(
  () => import('@/modules/suite-tenant/features/transactions/pages/transaction-new')
);
const TransactionDetail = lazy(
  () => import('@/modules/suite-tenant/features/transactions/pages/transaction-detail')
);
const TenantTeam = lazy(() => import('@/modules/suite-tenant/features/team/pages/tenant-team'));
const TenantApiKey = lazy(
  () => import('@/modules/suite-tenant/features/api-key/pages/tenant-api-key')
);
const BeneficiariesList = lazy(
  () => import('@/modules/suite-tenant/features/beneficiaries/pages/beneficiaries-list')
);
const BeneficiaryNew = lazy(
  () => import('@/modules/suite-tenant/features/beneficiaries/pages/beneficiary-new')
);
const BeneficiaryDetail = lazy(
  () => import('@/modules/suite-tenant/features/beneficiaries/pages/beneficiary-detail')
);
const TenantQuotes = lazy(
  () => import('@/modules/suite-tenant/features/quotes/pages/tenant-quotes')
);
const QuoteDetail = lazy(() => import('@/modules/suite-tenant/features/quotes/pages/quote-detail'));
const TenantRails = lazy(() => import('@/modules/suite-tenant/features/rails/pages/tenant-rails'));
const VirtualAccounts = lazy(
  () => import('@/modules/suite-tenant/features/virtual-accounts/pages/virtual-accounts')
);
const TenantWebhooks = lazy(
  () => import('@/modules/suite-tenant/features/webhooks/pages/tenant-webhooks')
);
const WebhookLogs = lazy(
  () => import('@/modules/suite-tenant/features/webhooks/pages/webhook-logs')
);
const WebhookLogDetail = lazy(
  () => import('@/modules/suite-tenant/features/webhooks/pages/webhook-log-detail')
);
const TenantSecurity = lazy(
  () => import('@/modules/suite-tenant/features/security/pages/tenant-security')
);

const LoadingFallback = () => (
  <div className="flex h-64 items-center justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
  </div>
);

/** `/tenant/wallets/new` (no creation screen any more) → the wallets list, same query. */
function WalletsListRedirect() {
  const { search } = useLocation();

  return <Navigate to={`${TENANT_ROUTES.wallets}${search}`} replace />;
}

function page(element: ReactNode) {
  return <Suspense fallback={<LoadingFallback />}>{element}</Suspense>;
}

export function SuiteTenantRoutes() {
  return (
    <Routes>
      {/* Second-factor enrollment: outside the enrollment guard it satisfies. */}
      <Route
        path="settings/security"
        element={<TenantMfaSetupRoute>{page(<TenantSecurity />)}</TenantMfaSetupRoute>}
      />
      <Route
        element={
          <TenantRoute>
            <TenantLayout />
          </TenantRoute>
        }
      >
        <Route index element={<Navigate to={TENANT_ROUTES.overview} replace />} />
        <Route path="overview" element={page(<TenantOverview />)} />
        <Route path="customers" element={page(<CustomersList />)} />
        <Route path="customers/new" element={page(<CustomerNew />)} />
        <Route path="customers/:customerId" element={page(<CustomerDetail />)} />
        <Route path="wallets" element={page(<WalletsList />)} />
        {/* Wallets are minted by Loopay operations: the old create screen opens the list. */}
        <Route path="wallets/new" element={<WalletsListRedirect />} />
        <Route path="wallets/:walletId" element={page(<WalletDetail />)} />
        <Route path="transactions" element={page(<TransactionsList />)} />
        <Route path="transactions/new" element={page(<TransactionNew />)} />
        <Route path="transactions/:transactionId" element={page(<TransactionDetail />)} />
        <Route path="team" element={page(<TenantTeam />)} />
        <Route path="api-key" element={page(<TenantApiKey />)} />
        <Route path="beneficiaries" element={page(<BeneficiariesList />)} />
        <Route path="beneficiaries/new" element={page(<BeneficiaryNew />)} />
        <Route path="beneficiaries/:beneficiaryId" element={page(<BeneficiaryDetail />)} />
        <Route path="quotes" element={page(<TenantQuotes />)} />
        <Route path="quotes/:quoteId" element={page(<QuoteDetail />)} />
        <Route path="rails" element={page(<TenantRails />)} />
        <Route path="virtual-accounts" element={page(<VirtualAccounts />)} />
        <Route path="webhooks" element={page(<TenantWebhooks />)} />
        <Route path="webhooks/logs" element={page(<WebhookLogs />)} />
        <Route path="webhooks/logs/:logId" element={page(<WebhookLogDetail />)} />
        <Route path="*" element={<Navigate to={TENANT_ROUTES.overview} replace />} />
      </Route>
    </Routes>
  );
}
