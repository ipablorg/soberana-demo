import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './protected-route';

const ElementsLayout = lazy(() =>
  import('@/modules/soberana-elements/layouts/elements-layout').then(m => ({ default: m.ElementsLayout }))
);
const ElementsDashboard = lazy(() =>
  import('@/modules/soberana-elements/pages/elements-dashboard').then(m => ({ default: m.ElementsDashboard }))
);
const WidgetBuilder = lazy(() =>
  import('@/modules/soberana-elements/pages/widget-builder').then(m => ({ default: m.WidgetBuilder }))
);
const PreviewSandbox = lazy(() =>
  import('@/modules/soberana-elements/pages/preview-sandbox').then(m => ({ default: m.PreviewSandbox }))
);
const IntegrationDocs = lazy(() =>
  import('@/modules/soberana-elements/pages/integration-docs').then(m => ({ default: m.IntegrationDocs }))
);
const ElementsSettings = lazy(() =>
  import('@/modules/soberana-elements/pages/elements-settings').then(m => ({ default: m.ElementsSettings }))
);

function Fallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
    </div>
  );
}

export function ElementsRoutes() {
  return (
    <ProtectedRoute>
      <Routes>
        <Route
          element={
            <Suspense fallback={<Fallback />}>
              <ElementsLayout />
            </Suspense>
          }
        >
          <Route index element={<Suspense fallback={<Fallback />}><ElementsDashboard /></Suspense>} />
          <Route path="builder/:type" element={<Suspense fallback={<Fallback />}><WidgetBuilder /></Suspense>} />
          <Route path="preview/:id" element={<Suspense fallback={<Fallback />}><PreviewSandbox /></Suspense>} />
          <Route path="docs" element={<Suspense fallback={<Fallback />}><IntegrationDocs /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<Fallback />}><ElementsSettings /></Suspense>} />
          <Route path="builder" element={<Navigate to="/elements" replace />} />
          <Route path="*" element={<Navigate to="/elements" replace />} />
        </Route>
      </Routes>
    </ProtectedRoute>
  );
}
