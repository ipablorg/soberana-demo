/**
 * Documentation Routes
 *
 * Only the Soberana Manifesto v2 is served under /docs/*.
 * All other sub-routes redirect to /docs/manifesto.
 */

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DocsLayout } from '@/modules/documentation/layouts/DocsLayout';

const ManifestoPage = lazy(() => import('@/modules/documentation/pages/docs-page'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
  </div>
);

export function DocsRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="/docs/manifesto" replace />} />
      <Route element={<DocsLayout />}>
        <Route
          path="manifesto"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ManifestoPage />
            </Suspense>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/docs/manifesto" replace />} />
    </Routes>
  );
}
