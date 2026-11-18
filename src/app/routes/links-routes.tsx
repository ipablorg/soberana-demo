import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy load the builder for optimal bundle size
const LinksBuilder = lazy(() => 
  import('@/modules/loopay-links').then(module => ({ 
    default: module.LinksBuilder 
  }))
);

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-sm text-muted-foreground animate-pulse">Loading Links Builder...</p>
    </div>
  </div>
);

/**
 * Loopay Links Routes
 * Bio link builder (Linktree-style) functionality
 * 
 * Routes:
 * - /links → redirects to /links/builder
 * - /links/builder → Main builder interface
 * - /links/:username → Public view (coming soon)
 */
export function LinksRoutes() {
  return (
    <Routes>
      {/* Default redirect to builder */}
      <Route index element={<Navigate to="builder" replace />} />
      
      {/* Links Builder */}
      <Route 
        path="builder" 
        element={
          <Suspense fallback={<LoadingFallback />}>
            <LinksBuilder />
          </Suspense>
        } 
      />
      
      {/* Public view (future) */}
      {/* <Route path=":username" element={<PublicLinksView />} /> */}
      
      {/* 404 - redirect to builder */}
      <Route path="*" element={<Navigate to="builder" replace />} />
    </Routes>
  );
}

