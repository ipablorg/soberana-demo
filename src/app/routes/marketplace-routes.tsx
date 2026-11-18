/**
 * Marketplace Routes
 * 
 * Routes for the Global Connectors Marketplace and API Documentation
 */

import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ApiDocsLayout } from '@/modules/documentation/layouts/ApiDocsLayout';

// Lazy-loaded layout
const MarketplaceLayout = lazy(() => 
  import('@/modules/marketplace').then(m => ({ default: m.MarketplaceLayout }))
);

// GlobalConnectors - International Payments
const InternationalPaymentPage = lazy(() => import('@/modules/marketplace/pages/international-payment'));

// Getting Started pages
const ApiIntroductionPage = lazy(() => import('@/modules/documentation/pages/api/introduction'));
const AuthenticationPage = lazy(() => import('@/modules/documentation/pages/api/authentication'));
const ErrorsPage = lazy(() => import('@/modules/documentation/pages/api/errors'));
const IdempotencyPage = lazy(() => import('@/modules/documentation/pages/api/idempotency'));
const RateLimitsPage = lazy(() => import('@/modules/documentation/pages/api/rate-limits'));

// Customers
const ListCustomersPage = lazy(() => import('@/modules/documentation/pages/api/customers/list-customers'));
const GetCustomerPage = lazy(() => import('@/modules/documentation/pages/api/customers/get-customer'));
const CreateCustomerPage = lazy(() => import('@/modules/documentation/pages/api/customers/create-customer'));
const UpdateCustomerPage = lazy(() => import('@/modules/documentation/pages/api/customers/update-customer'));
const CustomerVerificationPage = lazy(() => import('@/modules/documentation/pages/api/customers/verification'));

// Bank Accounts
const ListBankAccountsPage = lazy(() => import('@/modules/documentation/pages/api/bank-accounts/list-bank-accounts'));
const CreateBankAccountPage = lazy(() => import('@/modules/documentation/pages/api/bank-accounts/create-bank-account'));
const GetBankAccountPage = lazy(() => import('@/modules/documentation/pages/api/bank-accounts/get-bank-account'));

// Exchange Rates
const GetExchangeRatePage = lazy(() => import('@/modules/documentation/pages/api/exchange-rates/get-exchange-rate'));

// Transactions
const ListTransactionsPage = lazy(() => import('@/modules/documentation/pages/api/transactions/list-transactions'));
const GetTransactionPage = lazy(() => import('@/modules/documentation/pages/api/transactions/get-transaction'));
const CreateTransactionPage = lazy(() => import('@/modules/documentation/pages/api/transactions/create-transaction'));
const OnRampPage = lazy(() => import('@/modules/documentation/pages/api/transactions/on-ramp'));
const OffRampPage = lazy(() => import('@/modules/documentation/pages/api/transactions/off-ramp'));
const TransferPage = lazy(() => import('@/modules/documentation/pages/api/transactions/transfer'));

// Partner Fees
const ListPartnerFeesPage = lazy(() => import('@/modules/documentation/pages/api/partner-fees/list-partner-fees'));
const CreatePartnerFeePage = lazy(() => import('@/modules/documentation/pages/api/partner-fees/create-partner-fee'));
const GetPartnerFeePage = lazy(() => import('@/modules/documentation/pages/api/partner-fees/get-partner-fee'));

// Webhooks
const WebhooksOverviewPage = lazy(() => import('@/modules/documentation/pages/api/webhooks/overview'));
const WebhookEventsPage = lazy(() => import('@/modules/documentation/pages/api/webhooks/events'));

// Changelog
const ChangelogPage = lazy(() => import('@/modules/documentation/pages/api/changelog'));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

export function MarketplaceRoutes() {
  return (
    <Routes>
      {/* Marketplace Overview */}
      <Route 
        index 
        element={
          <Suspense fallback={<LoadingFallback />}>
            <MarketplaceLayout />
          </Suspense>
        } 
      />
      
      {/* GlobalConnectors - International Payments */}
      <Route 
        path="international-payment" 
        element={
          <Suspense fallback={<LoadingFallback />}>
            <InternationalPaymentPage />
          </Suspense>
        } 
      />
      
      {/* API Reference Documentation */}
      <Route path="api/*" element={<ApiDocsLayout />}>
        {/* Getting Started */}
        <Route 
          index 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ApiIntroductionPage />
            </Suspense>
          } 
        />
        <Route 
          path="authentication" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AuthenticationPage />
            </Suspense>
          } 
        />
        <Route 
          path="errors" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ErrorsPage />
            </Suspense>
          } 
        />
        <Route 
          path="idempotency" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <IdempotencyPage />
            </Suspense>
          } 
        />
        <Route 
          path="rate-limits" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <RateLimitsPage />
            </Suspense>
          } 
        />
        
        {/* Customers Endpoints */}
        <Route 
          path="customers/list" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ListCustomersPage />
            </Suspense>
          } 
        />
        <Route 
          path="customers/get" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <GetCustomerPage />
            </Suspense>
          } 
        />
        <Route 
          path="customers/create" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <CreateCustomerPage />
            </Suspense>
          } 
        />
        <Route 
          path="customers/update" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <UpdateCustomerPage />
            </Suspense>
          } 
        />
        <Route 
          path="customers/verification" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <CustomerVerificationPage />
            </Suspense>
          } 
        />
        
        {/* Bank Accounts */}
        <Route 
          path="bank-accounts/list" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ListBankAccountsPage />
            </Suspense>
          } 
        />
        <Route 
          path="bank-accounts/create" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <CreateBankAccountPage />
            </Suspense>
          } 
        />
        <Route 
          path="bank-accounts/get" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <GetBankAccountPage />
            </Suspense>
          } 
        />

        {/* Exchange Rates */}
        <Route 
          path="exchange-rates/get" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <GetExchangeRatePage />
            </Suspense>
          } 
        />
        
        {/* Transactions Endpoints */}
        <Route 
          path="transactions/list" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ListTransactionsPage />
            </Suspense>
          } 
        />
        <Route 
          path="transactions/get" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <GetTransactionPage />
            </Suspense>
          } 
        />
        <Route 
          path="transactions/create" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <CreateTransactionPage />
            </Suspense>
          } 
        />
        <Route 
          path="transactions/on-ramp" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <OnRampPage />
            </Suspense>
          } 
        />
        <Route 
          path="transactions/off-ramp" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <OffRampPage />
            </Suspense>
          } 
        />
        <Route 
          path="transactions/transfer" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <TransferPage />
            </Suspense>
          } 
        />

        {/* Partner Fees */}
        <Route 
          path="partner-fees/list" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ListPartnerFeesPage />
            </Suspense>
          } 
        />
        <Route 
          path="partner-fees/create" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <CreatePartnerFeePage />
            </Suspense>
          } 
        />
        <Route 
          path="partner-fees/get" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <GetPartnerFeePage />
            </Suspense>
          } 
        />
        
        {/* Webhooks */}
        <Route 
          path="webhooks" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <WebhooksOverviewPage />
            </Suspense>
          } 
        />
        <Route 
          path="webhooks/events" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <WebhookEventsPage />
            </Suspense>
          } 
        />

        {/* Changelog */}
        <Route 
          path="changelog" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ChangelogPage />
            </Suspense>
          } 
        />
      </Route>
      
      {/* Country-specific routes */}
      <Route 
        path=":country" 
        element={
          <Suspense fallback={<LoadingFallback />}>
            <MarketplaceLayout />
          </Suspense>
        } 
      />
    </Routes>
  );
}
