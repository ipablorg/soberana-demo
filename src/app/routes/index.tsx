import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TrackerScripts } from '@/shared/components/tracker-scripts';
import { CommonRoutes } from './common-routes';
import { SuiteUserRoutes } from './suite-user-routes';
import { SuiteBackofficeRoutes } from '@/modules/suite-backoffice/backoffice-routes';
import { DocsRoutes } from './docs-routes';
import { LinksRoutes } from './links-routes';
import { MarketplaceRoutes } from './marketplace-routes';
import { ElementsRoutes } from './elements-routes';
import { WorkflowRoutes } from './workflow-routes';
import { isInternalProductSettingsEnabled } from '@/shared/lib/dev-config';

// Tenant backoffice (CLIENT_ADMIN): its own chunk, never shipped to other visitors.
const SuiteTenantRoutes = lazy(() =>
  import('./tenant-routes').then((m) => ({ default: m.SuiteTenantRoutes }))
);

const PayLinkPage = lazy(() => import('@/modules/loopay-links/pages/pay-link'));
const SoberanaOsPage = lazy(() => import('@/modules/soberana-os/pages/soberana-os-page'));
const AmazonasDashboardPage = lazy(
  () => import('@/modules/amazonas/pages/amazonas-dashboard-page')
);
const QASection = lazy(() =>
  import('@/modules/amazonas/components/QASection').then((m) => ({ default: m.QASection }))
);
const TransaccionesSection = lazy(() =>
  import('@/modules/amazonas/components/TransaccionesSection').then((m) => ({
    default: m.TransaccionesSection,
  }))
);
const FlujosSection = lazy(() =>
  import('@/modules/amazonas/components/FlujosSection').then((m) => ({ default: m.FlujosSection }))
);
const ManifestoPage = lazy(() => import('@/modules/documentation/pages/docs-page'));
const SovyPage = lazy(() => import('@/modules/documentation/pages/sovy-page'));
const VaultsPage = lazy(() => import('@/modules/documentation/pages/vaults-page'));
const AmazonasSoberanaPage = lazy(
  () => import('@/modules/documentation/pages/amazonas-soberana-page')
);

// Soberana Platform Showcase
const SoberanaPlatformPage = lazy(
  () => import('@/modules/soberana-platform/pages/soberana-platform-page')
);

// Investor Deck
const InvestorDeckPage = lazy(() => import('@/modules/investor-deck/pages/investor-deck-page'));

// Soberana Network — Investor Deck
const NetworkDeckPage = lazy(() => import('@/modules/network-deck/pages/network-deck-page'));

// Elements GTM Deck
const ElementsGtmPage = lazy(() => import('@/modules/elements-gtm/pages/elements-gtm-page'));

// Sales Helper
const SalesHelperPage = lazy(() => import('@/modules/sales-helper/pages/sales-helper-page'));
const ProductCatalogSection = lazy(() =>
  import('@/modules/sales-helper/components/ProductCatalogSection').then((m) => ({
    default: m.ProductCatalogSection,
  }))
);
const PricingMasterSection = lazy(() =>
  import('@/modules/sales-helper/components/PricingMasterSection').then((m) => ({
    default: m.PricingMasterSection,
  }))
);
const CountryCapabilitiesSection = lazy(() =>
  import('@/modules/sales-helper/components/CountryCapabilitiesSection').then((m) => ({
    default: m.CountryCapabilitiesSection,
  }))
);
const VolumePricingSection = lazy(() =>
  import('@/modules/sales-helper/components/VolumePricingSection').then((m) => ({
    default: m.VolumePricingSection,
  }))
);
const ComexCalculator = lazy(() =>
  import('@/modules/sales-helper/components/ComexCalculator').then((m) => ({
    default: m.ComexCalculator,
  }))
);
const OnOffRampCalculator = lazy(() =>
  import('@/modules/sales-helper/components/OnOffRampCalculator').then((m) => ({
    default: m.OnOffRampCalculator,
  }))
);
const ReferralCalculator = lazy(() =>
  import('@/modules/sales-helper/components/ReferralCalculator').then((m) => ({
    default: m.ReferralCalculator,
  }))
);
const CaseSimulator = lazy(() =>
  import('@/modules/sales-helper/components/CaseSimulator').then((m) => ({
    default: m.CaseSimulator,
  }))
);
const ChileLiquidator = lazy(() =>
  import('@/modules/sales-helper/components/ChileLiquidator').then((m) => ({
    default: m.ChileLiquidator,
  }))
);
const ClientIntakeWizard = lazy(() =>
  import('@/modules/sales-helper/components/client-intake/ClientIntakeWizard').then((m) => ({
    default: m.ClientIntakeWizard,
  }))
);

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter
      // BASE_URL follows the Vite `--base` flag ('/' by default), so the
      // public portfolio demo build served under /soberana-demo/ keeps
      // matching its routes instead of rendering the 404 page.
      basename={import.meta.env.BASE_URL}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <TrackerScripts />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public payment link page */}
          <Route path="/pay/:id" element={<PayLinkPage />} />

          {/* Common routes (landing, auth, errors) */}
          <Route path="/*" element={<CommonRoutes />} />

          {/* Suite User routes */}
          <Route path="/suite/*" element={<SuiteUserRoutes />} />

          {/* Backoffice. Historically this redirected to /login in prod
              because a separate backoffice.html MPA entry was supposed to
              serve /backoffice — but no server ever routed to it (every
              host falls back to index.html), so staff in production got an
              unconditional redirect: the login ping-pong. The SPA now owns
              the backoffice in every environment; the suite-backoffice code
              still lazy-loads into its own chunk. */}
          <Route path="/backoffice/*" element={<SuiteBackofficeRoutes />} />

          {/* Tenant backoffice: admins (CLIENT_ADMIN) of a client */}
          <Route path="/tenant/*" element={<SuiteTenantRoutes />} />

          {/* Documentation routes */}
          <Route path="/docs/*" element={<DocsRoutes />} />

          {/* Loopay Links routes */}
          <Route path="/links/*" element={<LinksRoutes />} />

          {/* Global Connectors Marketplace routes */}
          <Route path="/globalconnectors/*" element={<MarketplaceRoutes />} />

          {/* Soberana Elements — Widget Studio.
              Internal product: only mounted under the dev server. In a
              prod build the route redirects to the dashboard (defense in
              depth against deep-links / stale bookmarks). */}
          <Route
            path="/elements/*"
            element={
              isInternalProductSettingsEnabled() ? (
                <ElementsRoutes />
              ) : (
                <Navigate to="/suite/dashboard" replace />
              )
            }
          />

          {/* Workflow Composer — Visual payment flow editor.
              Internal product: gated the same way as /elements. */}
          <Route
            path="/workflow/*"
            element={
              isInternalProductSettingsEnabled() ? (
                <WorkflowRoutes />
              ) : (
                <Navigate to="/suite/dashboard" replace />
              )
            }
          />

          {/* Soberana OS Chat */}
          <Route path="/os" element={<SoberanaOsPage />} />

          {/* Investor Deck — Pitch Presentation */}
          <Route
            path="/slides"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <InvestorDeckPage />
              </Suspense>
            }
          />

          {/* Soberana Network — Investor Deck */}
          <Route
            path="/network_deck"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <NetworkDeckPage />
              </Suspense>
            }
          />

          {/* Elements GTM — Go-To-Market Strategy Deck */}
          <Route
            path="/elements_gtm"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <ElementsGtmPage />
              </Suspense>
            }
          />

          {/* Soberana Platform — Public Marketing Showcase */}
          <Route
            path="/platform"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <SoberanaPlatformPage />
              </Suspense>
            }
          />

          {/* Sales Helper — Herramienta Comercial */}
          <Route
            path="/ventas"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <SalesHelperPage />
              </Suspense>
            }
          >
            <Route index element={<Navigate to="intake" replace />} />
            <Route
              path="intake"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <ClientIntakeWizard />
                </Suspense>
              }
            />
            <Route
              path="catalogo"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <ProductCatalogSection />
                </Suspense>
              }
            />
            <Route
              path="pricing"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <PricingMasterSection />
                </Suspense>
              }
            />
            <Route
              path="consolidado"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <CountryCapabilitiesSection />
                </Suspense>
              }
            />
            <Route
              path="volumen"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <VolumePricingSection />
                </Suspense>
              }
            />
            <Route
              path="calculadora-comex"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <ComexCalculator />
                </Suspense>
              }
            />
            <Route
              path="calculadora-ramp"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <OnOffRampCalculator />
                </Suspense>
              }
            />
            <Route
              path="calculadora-referidos"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <ReferralCalculator />
                </Suspense>
              }
            />
            <Route
              path="caso"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <CaseSimulator />
                </Suspense>
              }
            />
            <Route
              path="liquidador-chile"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <ChileLiquidator />
                </Suspense>
              }
            />
            <Route path="*" element={<Navigate to="intake" replace />} />
          </Route>

          {/* Amazonas — Dashboard Due Diligence */}
          <Route
            path="/amazonas"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <AmazonasDashboardPage />
              </Suspense>
            }
          >
            <Route index element={<Navigate to="qa" replace />} />
            <Route
              path="qa"
              element={
                <Suspense
                  fallback={
                    <div className="min-h-[200px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                    </div>
                  }
                >
                  <QASection />
                </Suspense>
              }
            />
            <Route
              path="transacciones"
              element={
                <Suspense
                  fallback={
                    <div className="min-h-[200px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                    </div>
                  }
                >
                  <TransaccionesSection />
                </Suspense>
              }
            />
            <Route
              path="flujos"
              element={
                <Suspense
                  fallback={
                    <div className="min-h-[200px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                    </div>
                  }
                >
                  <FlujosSection />
                </Suspense>
              }
            />
            <Route
              path="manifiesto"
              element={
                <Suspense
                  fallback={
                    <div className="min-h-[200px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                    </div>
                  }
                >
                  <ManifestoPage />
                </Suspense>
              }
            />
            <Route
              path="sovy"
              element={
                <Suspense
                  fallback={
                    <div className="min-h-[200px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                    </div>
                  }
                >
                  <SovyPage />
                </Suspense>
              }
            />
            <Route
              path="vaults"
              element={
                <Suspense
                  fallback={
                    <div className="min-h-[200px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                    </div>
                  }
                >
                  <VaultsPage />
                </Suspense>
              }
            />
            <Route
              path="amazonas-soberana"
              element={
                <Suspense
                  fallback={
                    <div className="min-h-[200px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                    </div>
                  }
                >
                  <AmazonasSoberanaPage />
                </Suspense>
              }
            />
            <Route path="*" element={<Navigate to="qa" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
