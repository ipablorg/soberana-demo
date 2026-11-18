// @vitest-environment jsdom

/**
 * `TenantRoute` lets only tenant admins (`auth_me.roles` holds CLIENT_ADMIN)
 * into `/tenant/*`; everyone else lands on their own app, and the `/suite`
 * onboarding gate never runs for the tenant backoffice.
 */

import { act } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useKYC: vi.fn(),
  useRequireMfaEnrollment: vi.fn(),
}));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock('@/shared/lib/session-restore', () => ({ retrySessionRestore: vi.fn() }));
vi.mock('@/app/providers/session-restore-policy', () => ({ canRestoreFirebaseUser: vi.fn() }));
vi.mock('@/shared/lib/graphql-client', () => ({ setAuthToken: vi.fn(), clearHeaders: vi.fn() }));
vi.mock('@/shared/lib/dev-config', () => ({ isDevMockMode: () => false }));
vi.mock('@/shared/hooks/useKYC', () => ({ useKYC: mocks.useKYC, clearKycLink: vi.fn() }));
vi.mock('@/shared/hooks/require-mfa-enrollment', () => ({
  useRequireMfaEnrollment: mocks.useRequireMfaEnrollment,
}));
vi.mock('@/shared/components/common/mfa-enrollment-required', () => ({
  MfaEnrollmentRequired: ({ setupRoute }: { setupRoute?: string }) => (
    <div>mfa-enrollment-required {setupRoute ?? 'default-setup'}</div>
  ),
}));
vi.mock('@/shared/components/common/staff-mfa-alert', () => ({
  StaffMfaAlert: () => null,
}));
vi.mock('@/modules/common/auth/api/auth-enforcement', () => ({
  isStaffMfaOptional: () => false,
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
import { TenantMfaSetupRoute, TenantRoute } from '../protected-route';

let page: MountedPage | null = null;

function LocationProbe() {
  return <span data-testid="loc">{useLocation().pathname}</span>;
}

function signIn(roles: string[], staffRoles: string[] = []) {
  const user = {
    id: 'u-1',
    email: 'admin@tenant.test',
    name: 'Tenant Admin',
    roles,
    staff_roles: staffRoles,
    company_roles: [],
    has_accepted_latest_terms: false,
    client_id: 'client-1',
  } as unknown as AuthUser;

  useAuthStore.setState({
    user,
    token: 'token',
    isLoading: false,
    isAuthenticated: true,
    isRestoringSession: false,
    sessionRecovery: 'idle',
  });
}

function mountAt(path: string) {
  page = mountPage(
    <MemoryRouter initialEntries={[path]}>
      <LocationProbe />
      <Routes>
        <Route
          path="/tenant/*"
          element={
            <TenantRoute>
              <div>tenant-backoffice</div>
            </TenantRoute>
          }
        />
        <Route
          path="/tenant-setup"
          element={
            <TenantMfaSetupRoute>
              <div>tenant-mfa-setup</div>
            </TenantMfaSetupRoute>
          }
        />
        <Route path="/login" element={<div>login-page</div>} />
        <Route path="/backoffice" element={<div>backoffice-page</div>} />
        <Route path="/suite/dashboard" element={<div>dashboard-page</div>} />
        <Route path="/suite/verify-identity" element={<div>onboarding-page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

function location(): string | null | undefined {
  return page?.container.querySelector('[data-testid="loc"]')?.textContent;
}

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
  mocks.useRequireMfaEnrollment.mockReturnValue({
    isChecking: false,
    isEnrolled: true,
    recheck: vi.fn(),
  });
  // A tenant admin has no approved KYC of its own: the onboarding gate would
  // redirect it if it ever ran on /tenant.
  mocks.useKYC.mockReturnValue({
    isLoading: false,
    isReadyForSuite: false,
    kycStatus: 'NOT_INITIATED',
    tosAccepted: false,
  });
});

afterEach(() => {
  page?.unmount();
  page = null;
  act(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  });
  vi.unstubAllGlobals();
});

describe('TenantRoute', () => {
  it('lets a CLIENT_ADMIN in without running the /suite onboarding gate', () => {
    signIn(['CLIENT_ADMIN']);
    mountAt('/tenant/customers');

    expect(page?.text()).toContain('tenant-backoffice');
    expect(location()).toBe('/tenant/customers');
    expect(mocks.useKYC).not.toHaveBeenCalled();
  });

  it('lets the synthetic act-as tenant admin in (CLIENT_ADMIN, no staff role)', () => {
    // What auth_me answers under x-act-as-client (epic 2026-11 S5): the staff
    // member's own id and email, CLIENT_ADMIN of the client, no staff role.
    signIn(['CLIENT_ADMIN'], []);
    useAuthStore.setState({
      user: {
        ...useAuthStore.getState().user,
        id: 'staff-1',
        email: 'ana@loopay.test',
        customer_profile_id: null,
        kyc_status: null,
      } as unknown as AuthUser,
    });
    mountAt('/tenant/team');

    expect(page?.text()).toContain('tenant-backoffice');
    expect(location()).toBe('/tenant/team');
    expect(mocks.useKYC).not.toHaveBeenCalled();
  });

  it('sends an end customer (CLIENT_USER) to the dashboard', () => {
    signIn(['CLIENT_USER']);
    mountAt('/tenant');

    expect(location()).toBe('/suite/dashboard');
    expect(page?.text()).not.toContain('tenant-backoffice');
  });

  it('sends staff to the backoffice, even with a client role', () => {
    signIn(['CLIENT_ADMIN'], ['OPS_COMMERCIAL']);
    mountAt('/tenant');

    expect(location()).toBe('/backoffice');
    expect(page?.text()).not.toContain('tenant-backoffice');
  });

  it('sends a signed-out visitor to login', () => {
    useAuthStore.setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      isRestoringSession: false,
      sessionRecovery: 'idle',
    });
    mountAt('/tenant');

    expect(location()).toBe('/login');
  });

  it('blocks a tenant admin without a second factor on the enrollment screen', () => {
    mocks.useRequireMfaEnrollment.mockReturnValue({
      isChecking: false,
      isEnrolled: false,
      recheck: vi.fn(),
    });
    signIn(['CLIENT_ADMIN']);
    mountAt('/tenant');

    expect(page?.text()).toContain('mfa-enrollment-required');
    expect(page?.text()).not.toContain('tenant-backoffice');
  });

  it('points the enrollment gate at the tenant security page, never the customer settings', () => {
    mocks.useRequireMfaEnrollment.mockReturnValue({
      isChecking: false,
      isEnrolled: false,
      recheck: vi.fn(),
    });
    signIn(['CLIENT_ADMIN']);
    mountAt('/tenant');

    expect(page?.text()).toContain('mfa-enrollment-required /tenant/settings/security');
  });
});

describe('TenantMfaSetupRoute', () => {
  beforeEach(() => {
    mocks.useRequireMfaEnrollment.mockReturnValue({
      isChecking: false,
      isEnrolled: false,
      recheck: vi.fn(),
    });
  });

  it('lets a tenant admin without a second factor enroll, without the onboarding gate', () => {
    signIn(['CLIENT_ADMIN']);
    mountAt('/tenant-setup');

    expect(page?.text()).toContain('tenant-mfa-setup');
    expect(page?.text()).not.toContain('mfa-enrollment-required');
    expect(location()).toBe('/tenant-setup');
    expect(mocks.useKYC).not.toHaveBeenCalled();
  });

  it('sends an end customer to the dashboard', () => {
    signIn(['CLIENT_USER']);
    mountAt('/tenant-setup');

    expect(location()).toBe('/suite/dashboard');
  });

  it('sends a signed-out visitor to login', () => {
    useAuthStore.setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      isRestoringSession: false,
      sessionRecovery: 'idle',
    });
    mountAt('/tenant-setup');

    expect(location()).toBe('/login');
  });
});
