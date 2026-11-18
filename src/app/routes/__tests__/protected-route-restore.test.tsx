// @vitest-environment jsdom

/**
 * While the session is being restored after a reload, `ProtectedRoute` must
 * hold on the loading screen instead of bouncing the user to /login (which
 * would flash the login page and lose the URL they reloaded on).
 */

import { act } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  retrySessionRestore: vi.fn(async () => {}),
  canRestoreFirebaseUser: vi.fn(async () => true),
  toastError: vi.fn(),
}));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('sonner', () => ({ toast: { error: mocks.toastError, success: vi.fn() } }));
vi.mock('@/shared/lib/session-restore', () => ({ retrySessionRestore: mocks.retrySessionRestore }));
vi.mock('@/app/providers/session-restore-policy', () => ({
  canRestoreFirebaseUser: mocks.canRestoreFirebaseUser,
}));
vi.mock('@/shared/lib/graphql-client', () => ({ setAuthToken: vi.fn(), clearHeaders: vi.fn() }));
vi.mock('@/shared/lib/dev-config', () => ({ isDevMockMode: () => false }));
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

import type { AuthUser } from '@/shared/types/auth.types';
import { useAuthStore } from '@/shared/stores/auth-store';
import { mountPage, type MountedPage } from '@/test/dom-render';
import { memoryStorage } from '@/test/memory-storage';
import { ProtectedRoute } from '../protected-route';

const user = { id: 'u-1', company_name: null, roles: [], staff_roles: [] } as unknown as AuthUser;

let page: MountedPage | null = null;

function mountAt(path: string) {
  page = mountPage(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/suite/home"
          element={
            <ProtectedRoute>
              <div>secret dashboard</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function setAuthState(partial: Partial<ReturnType<typeof useAuthStore.getState>>) {
  act(() => {
    useAuthStore.setState(partial);
  });
}

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
  useAuthStore.setState({
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    isRestoringSession: true,
    sessionRecovery: 'idle',
  });
  mocks.retrySessionRestore.mockReset();
  mocks.retrySessionRestore.mockResolvedValue(undefined);
  mocks.toastError.mockReset();
});

afterEach(() => {
  page?.unmount();
  page = null;
  vi.unstubAllGlobals();
});

describe('ProtectedRoute — session restoration', () => {
  it('shows the loading screen, not the login page, while restoring', () => {
    mountAt('/suite/home');

    expect(page?.text()).toContain('loading-screen');
    expect(page?.text()).not.toContain('login page');
    expect(page?.text()).not.toContain('secret dashboard');
  });

  it('redirects to login only after restoration ended without a session', () => {
    mountAt('/suite/home');

    setAuthState({ isRestoringSession: false });

    expect(page?.text()).toContain('login page');
    expect(page?.text()).not.toContain('loading-screen');
  });

  it('keeps the loading screen while a restored token waits for auth_me', () => {
    mountAt('/suite/home');

    setAuthState({ token: 'restored-token' });

    expect(page?.text()).toContain('loading-screen');
    expect(page?.text()).not.toContain('login page');
  });

  it('renders the protected content once the restored session is authenticated', () => {
    mountAt('/suite/home');

    setAuthState({ user, token: 'restored-token', isAuthenticated: true, isRestoringSession: false });

    expect(page?.text()).toContain('secret dashboard');
    expect(page?.text()).not.toContain('loading-screen');
  });

  it('never blocks an already authenticated user, whatever the flag says', () => {
    setAuthState({ user, token: 'fresh-login', isAuthenticated: true, isRestoringSession: true });

    mountAt('/suite/home');

    expect(page?.text()).toContain('secret dashboard');
  });

  it('still redirects immediately when restoration is over and nobody is signed in', () => {
    setAuthState({ isRestoringSession: false });

    mountAt('/suite/home');

    expect(page?.text()).toContain('login page');
  });
});

describe('ProtectedRoute — slow session recovery', () => {
  /** A restored token that auth_me has not confirmed, past the slow deadline. */
  function slowRecovery() {
    setAuthState({
      token: 'restored-token',
      isAuthenticated: false,
      isRestoringSession: true,
      sessionRecovery: 'slow',
    });
  }

  it('shows the recovery screen instead of the login page, keeping the URL', () => {
    mountAt('/suite/home');

    slowRecovery();

    expect(page?.text()).toContain('No pudimos confirmar tu sesión');
    expect(page?.text()).not.toContain('login page');
    expect(page?.text()).not.toContain('loading-screen');
    expect(page?.text()).not.toContain('secret dashboard');
  });

  it('shows it even while an auth_me request is still marked as loading', () => {
    mountAt('/suite/home');

    setAuthState({
      token: 'restored-token',
      isLoading: true,
      isRestoringSession: true,
      sessionRecovery: 'slow',
    });

    expect(page?.text()).toContain('No pudimos confirmar tu sesión');
    expect(page?.text()).not.toContain('loading-screen');
  });

  it('retries through the restore module with the same policy as boot, and stays put', async () => {
    mountAt('/suite/home');
    slowRecovery();
    let finish: () => void = () => {};
    mocks.retrySessionRestore.mockReturnValue(new Promise<void>((resolve) => (finish = resolve)));

    page?.click(page.findByText('button', 'Intentar nuevamente'));

    expect(mocks.retrySessionRestore).toHaveBeenCalledWith({
      canRestore: mocks.canRestoreFirebaseUser,
    });
    expect(page?.findByText<HTMLButtonElement>('button', 'Intentar nuevamente').disabled).toBe(true);
    expect(useAuthStore.getState().token).toBe('restored-token');

    await act(async () => {
      finish();
    });

    expect(page?.findByText<HTMLButtonElement>('button', 'Intentar nuevamente').disabled).toBe(false);
    expect(page?.text()).toContain('No pudimos confirmar tu sesión');
    expect(page?.text()).not.toContain('login page');
  });

  it('goes to login only when the user explicitly asks, clearing the session', () => {
    mountAt('/suite/home');
    slowRecovery();

    page?.click(page.findByText('button', 'Volver a ingresar'));

    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().sessionRecovery).toBe('idle');
    expect(page?.text()).toContain('login page');
    expect(page?.text()).not.toContain('No pudimos confirmar tu sesión');
  });

  it('does not announce an expired session when the user chooses to go back to login', () => {
    mountAt('/suite/home');
    slowRecovery();

    page?.click(page.findByText('button', 'Volver a ingresar'));

    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it('renders the protected content as soon as the retry lets auth_me through', () => {
    mountAt('/suite/home');
    slowRecovery();

    setAuthState({ user, isAuthenticated: true, isRestoringSession: false, sessionRecovery: 'idle' });

    expect(page?.text()).toContain('secret dashboard');
    expect(page?.text()).not.toContain('No pudimos confirmar tu sesión');
  });

  it('never shows the recovery screen to an authenticated user', () => {
    setAuthState({
      user,
      token: 'live',
      isAuthenticated: true,
      isRestoringSession: true,
      sessionRecovery: 'slow',
    });

    mountAt('/suite/home');

    expect(page?.text()).toContain('secret dashboard');
    expect(page?.text()).not.toContain('No pudimos confirmar tu sesión');
  });
});
