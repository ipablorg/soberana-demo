import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const SoveranaLanding = lazy(() => import('@/modules/common/web/pages/soberana-landing'));
const Remittances = lazy(() => import('@/modules/common/web/pages/remittances'));
const Gig = lazy(() => import('@/modules/common/web/pages/gig'));
const CompleteRegistration = lazy(() => import('@/modules/common/auth/pages/complete-registration'));
const ForgotPassword = lazy(() => import('@/modules/common/auth/pages/forgot-password'));
const ResetPassword = lazy(() => import('@/modules/common/auth/pages/reset-password'));
const Assistant = lazy(() => import('@/modules/common/web/pages/assistant'));
const NotFound = lazy(() => import('@/modules/common/errors/pages/not-found'));
const Unauthorized = lazy(() => import('@/modules/common/errors/pages/unauthorized'));
const ServerError = lazy(() => import('@/modules/common/errors/pages/server-error'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

export function CommonRoutes() {
  return (
    <Routes>
      <Route index element={<Suspense fallback={<LoadingFallback />}><SoveranaLanding /></Suspense>} />
      <Route path="remittances" element={<Suspense fallback={<LoadingFallback />}><Remittances /></Suspense>} />
      <Route path="gig" element={<Suspense fallback={<LoadingFallback />}><Gig /></Suspense>} />
      <Route path="login" element={<Navigate to="/" state={{ mode: 'login' }} replace />} />
      <Route path="register" element={<Navigate to="/" state={{ mode: 'register' }} replace />} />
      <Route path="complete-registration" element={<Suspense fallback={<LoadingFallback />}><CompleteRegistration /></Suspense>} />
      <Route path="forgot-password" element={<Suspense fallback={<LoadingFallback />}><ForgotPassword /></Suspense>} />
      <Route path="reset-password" element={<Suspense fallback={<LoadingFallback />}><ResetPassword /></Suspense>} />
      <Route path="assistant" element={<Suspense fallback={<LoadingFallback />}><Assistant /></Suspense>} />
      <Route path="unauthorized" element={<Suspense fallback={<LoadingFallback />}><Unauthorized /></Suspense>} />
      <Route path="server-error" element={<Suspense fallback={<LoadingFallback />}><ServerError /></Suspense>} />
      <Route path="*" element={<Suspense fallback={<LoadingFallback />}><NotFound /></Suspense>} />
    </Routes>
  );
}
