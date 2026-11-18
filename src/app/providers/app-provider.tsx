import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './theme-provider';
import { LinguiProvider, OldI18nProvider } from '@/shared/i18n';
import { Toaster } from '@/shared/components/ui/toaster';
import { Toaster as Sonner } from '@/shared/components/ui/sonner';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import { WhatsAppSupportFab } from '@/shared/components/common/whatsapp-support-fab';
import { useEffect } from 'react';
import { initializeAuth, registerLogoutHook, useAuthStore } from '@/shared/stores/auth-store';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { AuthMeDocument } from '@/graphql/queries/auth';
import { useAuth } from '@/shared/hooks/use-auth';
import { useSyncAuthMe } from '@/shared/hooks/use-sync-auth-me';
import { queryClient } from '@/shared/lib/query-client';
import { warnIfDevMockMode } from '@/shared/lib/dev-config';
// ZENTINEL DISABLED 2026-10-06: service is being decommissioned. Re-enable by
// restoring the import and the provider wrap below if it ever comes back.
// Local demo re-enable (2026-11-12): restored for the demo; backend optional
// because the chat view falls back to its mock shell in dev mock mode.
import { ZentinelProvider } from '@/shared/providers/zentinel-provider';
import { ReauthProvider } from '@/shared/providers/reauth-provider';
import { SessionExpiryProvider } from '@/shared/providers/session-expiry-provider';
import { usePostLoginTransitionStore } from '@/shared/stores/use-post-login-transition';
import {
  AUTH_ME_QUERY_KEY,
  registerFirebaseSignOutHook,
  startSessionRestore,
} from '@/shared/lib/session-restore';
import { classifyAuthMeError } from '@/shared/lib/auth-me-error';
import { notifySessionExpired } from '@/shared/lib/session-expired-notice';
import { clearAllKycData } from '@/modules/suite-user/features/bridge-kyc/lib/kyc-persistence';
import { canRestoreFirebaseUser } from './session-restore-policy';

interface AppProviderProps {
  children: React.ReactNode;
}

/**
 * Auth Initializer Component
 *
 * Handles authentication initialization on app start.
 * Restores the session from Firebase's persisted user after a reload, and
 * fetches user data (`auth_me`) whenever an in-memory token exists.
 */
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { token, setAuth, setLoading } = useAuth();

  // Fetch user data if token exists
  const { data, isLoading, error } = useGraphQLQuery([...AUTH_ME_QUERY_KEY], AuthMeDocument, undefined, {
    enabled: Boolean(token), // Only check if token exists
    retry: false,
    staleTime: Infinity, // Don't refetch automatically
  });

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // A reload empties the in-memory token while Firebase may still hold the
  // user: rebuild the session from it. Setting the token below is what enables
  // the `auth_me` query above; ProtectedRoute waits on `isRestoringSession`.
  useEffect(() => {
    return startSessionRestore({ canRestore: canRestoreFirebaseUser });
  }, []);

  // Set user data when query succeeds. A token rotation alone (session
  // refresh) must not re-run setAuth: it rewrites the customer context.
  useSyncAuthMe(data?.auth_me, token, setAuth);

  // Set loading state
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  // Handle auth errors. Only a definitive rejection (invalid/expired token,
  // 401/403) ends the session, and it says so: the user lands on /login with the
  // one-time "session expired" notice instead of a silent logout. A network
  // blip, a timeout or a 5xx keeps the token and the Firebase user: a session
  // being restored is flagged as slow so ProtectedRoute offers "Intentar
  // nuevamente" / "Volver a ingresar" instead of an abrupt sign-out, and a live
  // session is simply left alone.
  useEffect(() => {
    if (!error || !token) return;

    if (classifyAuthMeError(error) === 'transient') {
      useAuthStore.getState().markSessionRecoverySlow();
      return;
    }

    notifySessionExpired();
    useAuthStore.getState().clearAuth();
  }, [error, token]);

  return <>{children}</>;
}

/**
 * Global SVG defs — Loopay brand gradient
 *
 * Exposes `url(#loopay-gradient)` to any SVG in the app so that stroke/fill
 * utilities (stroke-gradient-loopay, fill-gradient-loopay) can reference it.
 * Stops MUST mirror the bg-brand-gradient utility in src/styles/index.css
 * (CLAUDE.md §3.1 approved exception: brand gradient stops live in @utility
 * definitions and, by necessity, in the matching SVG defs).
 */
function LoopayGradientDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
      <defs>
        <linearGradient id="loopay-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c77d45" />
          <stop offset="20%" stopColor="#b23b2f" />
          <stop offset="40%" stopColor="#4a3535" />
          <stop offset="60%" stopColor="#2c4a6b" />
          <stop offset="80%" stopColor="#4a7dc4" />
          <stop offset="100%" stopColor="#6ba3e8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function AppProvider({ children }: AppProviderProps) {
  useEffect(() => {
    warnIfDevMockMode();
  }, []);

  // Replay the post-login welcome on the next sign-in by clearing the
  // session flag whenever auth is dropped. Registered as a logout hook
  // (instead of an import inside auth-store) to keep the dependency
  // direction one-way: auth-store knows nothing about the transition.
  useEffect(() => {
    return registerLogoutHook(() => {
      usePostLoginTransitionStore.getState().reset();
    });
  }, []);

  // Sweep KYC PII (kyc_persistence_* and kyc_draft_* keys) from localStorage
  // at logout. Registered as a logout hook — and here in the app layer —
  // because kyc-persistence lives under modules/ while auth-store is shared/,
  // and shared must not import from modules (ESLint boundary).
  useEffect(() => {
    return registerLogoutHook(() => {
      void clearAllKycData();
    });
  }, []);

  // Sign Firebase out on every clearAuth (manual logout, session expiry,
  // rejected auth_me). Without it the persisted Firebase session would restore
  // the user on the next reload, undoing the logout.
  useEffect(() => registerFirebaseSignOutHook(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="suite-loopay-theme">
        {/* New Lingui provider for migrated components */}
        <LinguiProvider>
          {/* Old provider for backward compatibility during migration */}
          <OldI18nProvider>
            <TooltipProvider delayDuration={300}>
              <LoopayGradientDefs />
              {/* Initialize auth before rendering app */}
              <AuthInitializer>
                <SessionExpiryProvider>
                  <ReauthProvider>
                    {/* ZENTINEL DISABLED 2026-10-06 — restored locally for the demo */}
                    <ZentinelProvider>{children}</ZentinelProvider>
                  </ReauthProvider>
                </SessionExpiryProvider>
              </AuthInitializer>
              <WhatsAppSupportFab />
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </OldI18nProvider>
        </LinguiProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
