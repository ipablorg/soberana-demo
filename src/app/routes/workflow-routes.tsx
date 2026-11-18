import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './protected-route';

const WorkflowLayout = lazy(() =>
  import('@/modules/workflow-composer/components/workflow-layout').then((m) => ({
    default: m.WorkflowLayout,
  })),
);

const WorkflowCanvas = lazy(() =>
  import('@/modules/workflow-composer/pages/workflow-canvas').then((m) => ({
    default: m.WorkflowCanvas,
  })),
);

const WorkflowFlows = lazy(() =>
  import('@/modules/workflow-composer/pages/workflow-flows'),
);

function Fallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
    </div>
  );
}

export function WorkflowRoutes() {
  return (
    <ProtectedRoute>
      <Routes>
        <Route
          element={
            <Suspense fallback={<Fallback />}>
              <WorkflowLayout />
            </Suspense>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<Fallback />}>
                <WorkflowCanvas />
              </Suspense>
            }
          />
          <Route
            path="flows"
            element={
              <Suspense fallback={<Fallback />}>
                <WorkflowFlows />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/workflow" replace />} />
        </Route>
      </Routes>
    </ProtectedRoute>
  );
}
