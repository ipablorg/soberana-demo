// @vitest-environment jsdom

/**
 * End-to-end boot behaviour of `AppProvider` + `ProtectedRoute` on a page
 * reload: the token only lives in memory, so the session has to be rebuilt from
 * the Firebase SDK's own persisted session without ever flashing the login page.
 */

import { act } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface FakeFirebaseUser {
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
}

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  setAuthToken: vi.fn(),
  clearHeaders: vi.fn(),
  getAuth: vi.fn(),
  signOutFirebase: vi.fn(async () => {}),
  canRestoreFirebaseUser: vi.fn(async () => true),
  clearAllKycData: vi.fn(async () => {}),
  toastError: vi.fn(),
}));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('sonner', () => ({ toast: { error: mocks.toastError, success: vi.fn() } }));
vi.mock('@/shared/lib/graphql-client', () => ({
  graphqlClient: { request: mocks.request },
  setAuthToken: mocks.setAuthToken,
  clearHeaders: mocks.clearHeaders,
}));
vi.mock('@/graphql/queries/auth', () => ({ AuthMeDocument: {} }));
vi.mock('@/shared/lib/dev-config', () => ({
  isDevMockMode: () => false,
  warnIfDevMockMode: () => {},
}));
vi.mock('@/shared/lib/loopayx/firebase-client', () => ({
  getAuth: mocks.getAuth,
  signOutFirebase: mocks.signOutFirebase,
}));
vi.mock('@/app/providers/session-restore-policy', () => ({
  canRestoreFirebaseUser: mocks.canRestoreFirebaseUser,
}));
vi.mock('@/modules/suite-user/features/bridge-kyc/lib/kyc-persistence', () => ({
  clearAllKycData: mocks.clearAllKycData,
}));
vi.mock('@/shared/hooks/useKYC', () => ({ useKYC: vi.fn(), clearKycLink: vi.fn() }));
vi.mock('@/shared/hooks/require-mfa-enrollment', () => ({ useRequireMfaEnrollment: vi.fn() }));
vi.mock('@/shared/components/common/mfa-enrollment-required', () => ({
  MfaEnrollmentRequired: () => null,
}));
vi.mock('@/shared/components/common/loading-screen', () => ({
  LoadingScreen: () => <div>loading-screen</div>,
}));
vi.mock('@/shared/components/common/post-login-transition', () => ({
  PostLoginTransition: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Heavy providers that are irrelevant to boot restoration.
vi.mock('@/app/providers/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/shared/i18n', () => ({
  LinguiProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  OldI18nProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/shared/components/ui/toaster', () => ({ Toaster: () => null }));
vi.mock('@/shared/components/ui/sonner', () => ({ Toaster: () => null }));
vi.mock('@/shared/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/shared/components/common/whatsapp-support-fab', () => ({
  WhatsAppSupportFab: () => null,
}));
vi.mock('@/shared/providers/zentinel-provider', () => ({
  ZentinelProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/shared/providers/reauth-provider', () => ({
  ReauthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/shared/providers/session-expiry-provider', () => ({
  SessionExpiryProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { i18n } from '@lingui/core';
import type { AuthUser } from '@/shared/types/auth.types';
import { ProtectedRoute } from '@/app/routes/protected-route';
import { queryClient } from '@/shared/lib/query-client';
import {
  resetSessionExpiredNotice,
  SESSION_EXPIRED_TOAST_ID,
} from '@/shared/lib/session-expired-notice';
import { useAuthStore } from '@/shared/stores/auth-store';
import { mountPage, type MountedPage } from '@/test/dom-render';
import { memoryStorage } from '@/test/memory-storage';
import { AppProvider } from '../app-provider';

// Outside React the helper translates through the global i18n instance.
i18n.loadAndActivate({ locale: 'en', messages: {} });

const EXPIRED = 'Tu sesión venció. Vuelve a ingresar.';

const authMe = { id: 'u-1', company_name: null, roles: [], staff_roles: [] } as unknown as AuthUser;

let page: MountedPage | null = null;
/** Every distinct screen the user saw, in order — the login page must never flash. */
let screens: string[] = [];

function CurrentLocation() {
  const location = useLocation();
  return <span>{`at ${location.pathname}`}</span>;
}

function Screens() {
  return (
    <Routes>
      <Route
        path="/suite/home"
        element={
          <ProtectedRoute>
            <div>secret dashboard</div>
            <CurrentLocation />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<div>login page</div>} />
    </Routes>
  );
}

function record() {
  const text = page?.text() ?? '';
  const known: Array<[label: string, marker: string]> = [
    ['loading-screen', 'loading-screen'],
    ['recovery', 'No pudimos confirmar tu sesión'],
    ['secret dashboard', 'secret dashboard'],
    ['login page', 'login page'],
  ];
  const screen = known.find(([, marker]) => text.includes(marker))?.[0];
  if (screen && screens[screens.length - 1] !== screen) screens.push(screen);
}

async function tick(ms = 5) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
  record();
}

async function until(predicate: () => boolean) {
  for (let i = 0; i < 40 && !predicate(); i += 1) await tick();
  expect(predicate()).toBe(true);
}

function mountApp(path = '/suite/home') {
  page = mountPage(
    <AppProvider>
      <MemoryRouter initialEntries={[path]}>
        <Screens />
      </MemoryRouter>
    </AppProvider>,
  );
  record();
}

function firebaseUser(token: string): FakeFirebaseUser {
  return { getIdToken: vi.fn(async () => token) };
}

function useFirebase(currentUser: FakeFirebaseUser | null) {
  mocks.getAuth.mockResolvedValue({ currentUser, authStateReady: async () => {} });
}

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
  vi.stubGlobal('sessionStorage', memoryStorage());
  screens = [];
  mocks.request.mockReset();
  mocks.setAuthToken.mockClear();
  mocks.clearHeaders.mockClear();
  mocks.getAuth.mockReset();
  mocks.signOutFirebase.mockClear();
  mocks.canRestoreFirebaseUser.mockReset();
  mocks.canRestoreFirebaseUser.mockResolvedValue(true);
  mocks.toastError.mockReset();
  resetSessionExpiredNotice();
  queryClient.clear();
  useAuthStore.setState({
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    isRestoringSession: true,
    sessionRecovery: 'idle',
  });
});

afterEach(() => {
  page?.unmount();
  page = null;
  queryClient.clear();
  vi.unstubAllGlobals();
});

describe('AppProvider — reload with a Firebase session', () => {
  it('restores the session silently: loading screen, then the same URL, never the login page', async () => {
    useFirebase(firebaseUser('restored-token'));
    let answer: (payload: unknown) => void = () => {};
    mocks.request.mockReturnValue(new Promise((resolve) => (answer = resolve)));

    mountApp();
    expect(page?.text()).toContain('loading-screen');

    // Firebase answered, auth_me is now in flight: still loading, header set.
    await until(() => mocks.request.mock.calls.length === 1);
    expect(mocks.setAuthToken).toHaveBeenCalledWith('restored-token');
    expect(useAuthStore.getState().token).toBe('restored-token');
    expect(page?.text()).toContain('loading-screen');
    expect(page?.text()).not.toContain('login page');

    answer({ auth_me: authMe });
    await until(() => (page?.text() ?? '').includes('secret dashboard'));

    expect(page?.text()).toContain('at /suite/home');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().isRestoringSession).toBe(false);
    expect(mocks.request).toHaveBeenCalledTimes(1);
    expect(screens).toEqual(['loading-screen', 'secret dashboard']);
  });

  it('goes to login, and signs Firebase out, when auth_me rejects the restored token', async () => {
    useFirebase(firebaseUser('revoked-token'));
    mocks.request.mockRejectedValue(
      Object.assign(new Error('Unauthorized'), {
        response: { status: 200, errors: [{ extensions: { code: 'UNAUTHENTICATED' } }] },
      }),
    );

    mountApp();
    await until(() => (page?.text() ?? '').includes('login page'));

    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(mocks.signOutFirebase).toHaveBeenCalled();
    expect(screens).toEqual(['loading-screen', 'login page']);
    expect(mocks.toastError).toHaveBeenCalledTimes(1);
    expect(mocks.toastError).toHaveBeenCalledWith(EXPIRED, { id: SESSION_EXPIRED_TOAST_ID });
  });

  it('signs Firebase out on a manual logout so the next reload cannot restore it', async () => {
    useFirebase(firebaseUser('restored-token'));
    mocks.request.mockResolvedValue({ auth_me: authMe });

    mountApp();
    await until(() => (page?.text() ?? '').includes('secret dashboard'));
    expect(mocks.signOutFirebase).not.toHaveBeenCalled();

    act(() => useAuthStore.getState().clearAuth());
    await tick();

    expect(mocks.signOutFirebase).toHaveBeenCalledTimes(1);
    expect(page?.text()).toContain('login page');
  });

  it('does not restore a user the enforcement policy refuses', async () => {
    useFirebase(firebaseUser('unverified-token'));
    mocks.canRestoreFirebaseUser.mockResolvedValue(false);

    mountApp();
    await until(() => (page?.text() ?? '').includes('login page'));

    expect(mocks.request).not.toHaveBeenCalled();
    expect(useAuthStore.getState().token).toBeNull();
  });
});

describe('AppProvider — slow or transient auth_me (the session is never dropped for it)', () => {
  const RECOVERY = 'No pudimos confirmar tu sesión';

  function serverError(status: number) {
    return Object.assign(new Error(`HTTP ${status}`), { response: { status } });
  }

  it('keeps the session and offers recovery when auth_me fails with a 5xx', async () => {
    useFirebase(firebaseUser('restored-token'));
    mocks.request.mockRejectedValue(serverError(503));

    mountApp();
    await until(() => (page?.text() ?? '').includes(RECOVERY));

    expect(useAuthStore.getState().token).toBe('restored-token');
    expect(useAuthStore.getState().sessionRecovery).toBe('slow');
    expect(mocks.signOutFirebase).not.toHaveBeenCalled();
    expect(mocks.clearHeaders).not.toHaveBeenCalled();
    expect(page?.text()).not.toContain('login page');
    expect(screens).toEqual(['loading-screen', 'recovery']);
    // Could not reach the server: we do not know the session is gone.
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it('keeps the session and offers recovery when the network fails', async () => {
    useFirebase(firebaseUser('restored-token'));
    mocks.request.mockRejectedValue(new TypeError('Failed to fetch'));

    mountApp();
    await until(() => (page?.text() ?? '').includes(RECOVERY));

    expect(useAuthStore.getState().token).toBe('restored-token');
    expect(mocks.signOutFirebase).not.toHaveBeenCalled();
  });

  it('"Intentar nuevamente" refetches auth_me and, on success, authenticates on the same URL', async () => {
    useFirebase(firebaseUser('restored-token'));
    mocks.request.mockRejectedValueOnce(serverError(503)).mockResolvedValueOnce({ auth_me: authMe });

    mountApp();
    await until(() => (page?.text() ?? '').includes(RECOVERY));

    page?.click(page.findByText('button', 'Intentar nuevamente'));
    await until(() => (page?.text() ?? '').includes('secret dashboard'));

    expect(mocks.request).toHaveBeenCalledTimes(2);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().sessionRecovery).toBe('idle');
    expect(page?.text()).toContain('at /suite/home');
    expect(mocks.signOutFirebase).not.toHaveBeenCalled();
    expect(screens).toEqual(['loading-screen', 'recovery', 'secret dashboard']);
  });

  it('"Intentar nuevamente" keeps the recovery screen (and the session) while the backend is still failing', async () => {
    useFirebase(firebaseUser('restored-token'));
    mocks.request.mockRejectedValue(serverError(502));

    mountApp();
    await until(() => (page?.text() ?? '').includes(RECOVERY));

    page?.click(page.findByText('button', 'Intentar nuevamente'));
    await until(() => mocks.request.mock.calls.length === 2);
    await tick(20);

    expect(page?.text()).toContain(RECOVERY);
    expect(useAuthStore.getState().token).toBe('restored-token');
    expect(mocks.signOutFirebase).not.toHaveBeenCalled();
  });

  it('"Intentar nuevamente" ends in login when the retry is definitively rejected', async () => {
    useFirebase(firebaseUser('restored-token'));
    mocks.request
      .mockRejectedValueOnce(serverError(503))
      .mockRejectedValueOnce(Object.assign(new Error('nope'), { response: { status: 401 } }));

    mountApp();
    await until(() => (page?.text() ?? '').includes(RECOVERY));

    page?.click(page.findByText('button', 'Intentar nuevamente'));
    await until(() => (page?.text() ?? '').includes('login page'));

    expect(useAuthStore.getState().token).toBeNull();
    expect(mocks.signOutFirebase).toHaveBeenCalled();
    // The retry discovered the expiry: exactly one notice, never stuck on recovery.
    expect(mocks.toastError).toHaveBeenCalledTimes(1);
    expect(mocks.toastError).toHaveBeenCalledWith(EXPIRED, { id: SESSION_EXPIRED_TOAST_ID });
  });

  it('"Intentar nuevamente" ends in login, announcing the expiry once, when Firebase no longer has a user', async () => {
    useFirebase(firebaseUser('restored-token'));
    mocks.request.mockRejectedValue(serverError(503));

    mountApp();
    await until(() => (page?.text() ?? '').includes(RECOVERY));
    expect(mocks.toastError).not.toHaveBeenCalled();

    // Signed out elsewhere / refresh token revoked while the user was away.
    useFirebase(null);
    page?.click(page.findByText('button', 'Intentar nuevamente'));
    await until(() => (page?.text() ?? '').includes('login page'));

    expect(useAuthStore.getState().token).toBeNull();
    expect(mocks.signOutFirebase).toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalledTimes(1);
    expect(mocks.toastError).toHaveBeenCalledWith(EXPIRED, { id: SESSION_EXPIRED_TOAST_ID });
  });

  it('"Intentar nuevamente" ends in login, announcing the expiry once, on a definitive Firebase error', async () => {
    const revoked = {
      getIdToken: vi
        .fn<() => Promise<string>>()
        .mockResolvedValueOnce('restored-token')
        .mockRejectedValue(Object.assign(new Error('expired'), { code: 'auth/user-token-expired' })),
    };
    useFirebase(revoked);
    mocks.request.mockRejectedValue(serverError(503));

    mountApp();
    await until(() => (page?.text() ?? '').includes(RECOVERY));

    page?.click(page.findByText('button', 'Intentar nuevamente'));
    await until(() => (page?.text() ?? '').includes('login page'));

    expect(mocks.toastError).toHaveBeenCalledTimes(1);
  });

  it('does not announce anything while the retry is merely still failing transiently', async () => {
    useFirebase(firebaseUser('restored-token'));
    mocks.request.mockRejectedValue(serverError(502));

    mountApp();
    await until(() => (page?.text() ?? '').includes(RECOVERY));
    page?.click(page.findByText('button', 'Intentar nuevamente'));
    await until(() => mocks.request.mock.calls.length === 2);
    await tick(20);

    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it('"Volver a ingresar" clears auth and signs Firebase out', async () => {
    useFirebase(firebaseUser('restored-token'));
    mocks.request.mockRejectedValue(serverError(503));

    mountApp();
    await until(() => (page?.text() ?? '').includes(RECOVERY));
    expect(mocks.signOutFirebase).not.toHaveBeenCalled();

    page?.click(page.findByText('button', 'Volver a ingresar'));
    await until(() => (page?.text() ?? '').includes('login page'));

    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().sessionRecovery).toBe('idle');
    expect(mocks.signOutFirebase).toHaveBeenCalledTimes(1);
    expect(mocks.clearHeaders).toHaveBeenCalled();
    // The user chose to leave: that is not an expiry, so no notice.
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it('does not sign an already authenticated user out because of a transient auth_me failure', async () => {
    useFirebase(firebaseUser('restored-token'));
    mocks.request.mockResolvedValueOnce({ auth_me: authMe });

    mountApp();
    await until(() => (page?.text() ?? '').includes('secret dashboard'));

    mocks.request.mockRejectedValue(serverError(503));
    await act(async () => {
      await queryClient.refetchQueries({ queryKey: ['auth', 'me'] });
    });
    await tick(20);

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(page?.text()).toContain('secret dashboard');
    expect(mocks.signOutFirebase).not.toHaveBeenCalled();
  });
});

describe('AppProvider — reload without a usable Firebase session', () => {
  it('redirects to login after restoration ends, without calling auth_me', async () => {
    useFirebase(null);

    mountApp();
    expect(page?.text()).toContain('loading-screen');

    await until(() => (page?.text() ?? '').includes('login page'));

    expect(mocks.request).not.toHaveBeenCalled();
    expect(mocks.setAuthToken).not.toHaveBeenCalled();
    expect(screens).toEqual(['loading-screen', 'login page']);
    // Never logged in: there is nothing that "expired".
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it('fails closed when Firebase cannot be initialised (missing config)', async () => {
    mocks.getAuth.mockRejectedValue(new Error('Loopay X Firebase config missing.'));

    mountApp();
    await until(() => (page?.text() ?? '').includes('login page'));

    expect(mocks.request).not.toHaveBeenCalled();
    expect(useAuthStore.getState().isRestoringSession).toBe(false);
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it('does not announce an expiry when the enforcement policy refuses the persisted user', async () => {
    useFirebase(firebaseUser('unverified-token'));
    mocks.canRestoreFirebaseUser.mockResolvedValue(false);

    mountApp();
    await until(() => (page?.text() ?? '').includes('login page'));

    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it('announces the expiry once when Firebase reports the persisted user is gone for good', async () => {
    useFirebase({
      getIdToken: vi.fn(async () => {
        throw Object.assign(new Error('expired'), { code: 'auth/user-token-expired' });
      }),
    });

    mountApp();
    await until(() => (page?.text() ?? '').includes('login page'));

    expect(mocks.request).not.toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalledTimes(1);
    expect(mocks.toastError).toHaveBeenCalledWith(EXPIRED, { id: SESSION_EXPIRED_TOAST_ID });
    expect(mocks.signOutFirebase).toHaveBeenCalled();
  });

  it('stays silent when Firebase only fails transiently at boot (offline)', async () => {
    useFirebase({
      getIdToken: vi.fn(async () => {
        throw Object.assign(new Error('offline'), { code: 'auth/network-request-failed' });
      }),
    });

    mountApp();
    await until(() => (page?.text() ?? '').includes('login page'));

    expect(mocks.toastError).not.toHaveBeenCalled();
  });
});
