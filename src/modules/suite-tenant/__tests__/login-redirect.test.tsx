// @vitest-environment jsdom

/**
 * The login form sends each signed-in user to its own app: staff to
 * /backoffice, tenant admins (CLIENT_ADMIN) to /tenant, everyone else to the
 * dashboard. Covers both paths: an already signed-in visitor and a fresh
 * sign-in (`onSuccess`).
 */

import { act } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: {
    isAuthenticated: false,
    isLoading: false,
    user: null as null | { roles: string[]; staff_roles: string[] },
  },
  signInOptions: null as null | { onSuccess: (user: unknown) => void },
}));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@/shared/hooks/use-auth', () => ({ useAuth: () => mocks.auth }));
vi.mock('@/shared/components/ui/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock('@/modules/common/auth/api/use-sign-in', () => ({
  useSignIn: (options: { onSuccess: (user: unknown) => void }) => {
    mocks.signInOptions = options;
    return {
      signIn: vi.fn(),
      resolve2FA: vi.fn(),
      enroll2FA: vi.fn(),
      clearMfaState: vi.fn(),
      resendVerificationEmail: vi.fn(),
      requires2FA: false,
      requires2FAEnrollment: false,
      requiresEmailVerification: false,
      pendingVerificationEmail: null,
      totpSecret: null,
      isLoading: false,
    };
  },
}));
vi.mock('@/modules/common/auth/components/totp-auth-help', () => ({ TotpAuthHelp: () => null }));
vi.mock('@/modules/common/auth/components/totp-enrollment-panel', () => ({
  TotpEnrollmentPanel: () => null,
}));
vi.mock('@/modules/common/auth/components/email-verification-notice', () => ({
  EmailVerificationNotice: () => null,
}));

import { mountPage, type MountedPage } from '@/test/dom-render';
import { installCommandPolyfills } from '@/test/dom-polyfills';
import { LoginForm } from '@/modules/common/auth/components/login-form';

installCommandPolyfills();

let page: MountedPage | null = null;

function LocationProbe() {
  return <span data-testid="loc">{useLocation().pathname}</span>;
}

function mountLogin() {
  page = mountPage(
    <MemoryRouter initialEntries={['/login']}>
      <LocationProbe />
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="*" element={<div>landed</div>} />
      </Routes>
    </MemoryRouter>
  );
}

function location() {
  return page?.container.querySelector('[data-testid="loc"]')?.textContent;
}

const MATRIX: Array<[string, string, { roles: string[]; staff_roles: string[] }]> = [
  ['staff', '/backoffice', { roles: ['LOOPAY_ADMIN'], staff_roles: ['LOOPAY_ADMIN'] }],
  ['tenant admin', '/tenant', { roles: ['CLIENT_ADMIN'], staff_roles: [] }],
  ['end customer', '/suite/dashboard', { roles: ['CLIENT_USER'], staff_roles: [] }],
];

beforeEach(() => {
  mocks.auth = { isAuthenticated: false, isLoading: false, user: null };
  mocks.signInOptions = null;
});

afterEach(() => {
  page?.unmount();
  page = null;
});

describe('login redirect', () => {
  it.each(MATRIX)('sends an already signed-in %s to %s', (_label, expected, user) => {
    mocks.auth = { isAuthenticated: true, isLoading: false, user };
    mountLogin();

    expect(location()).toBe(expected);
  });

  it.each(MATRIX)('sends a %s that just signed in to %s', (_label, expected, user) => {
    mountLogin();

    act(() => {
      mocks.signInOptions?.onSuccess(user);
    });

    expect(location()).toBe(expected);
  });
});
