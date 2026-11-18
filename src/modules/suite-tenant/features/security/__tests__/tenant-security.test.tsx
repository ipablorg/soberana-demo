// @vitest-environment jsdom

/**
 * Tenant second-factor enrollment (`/tenant/settings/security`): a tenant
 * admin without a factor enrolls here (the shared TOTP flow) instead of being
 * sent to the customer settings, then continues to the tenant backoffice.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ hasEnrolledFactors: vi.fn() }));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@/shared/hooks/require-mfa-enrollment', () => ({
  hasEnrolledFactors: mocks.hasEnrolledFactors,
}));
vi.mock('@/modules/common/auth/components/totp-enrollment-flow', () => ({
  TotpEnrollmentFlow: ({
    accountEmail,
    onEnrolled,
  }: {
    accountEmail?: string | null;
    onEnrolled?: () => void;
  }) => (
    <button type="button" data-testid="totp-flow" onClick={() => onEnrolled?.()}>
      totp-flow {accountEmail}
    </button>
  ),
}));

import type { AuthUser } from '@/shared/types/auth.types';
import { useAuthStore } from '@/shared/stores/auth-store';
import type { MountedPage } from '@/test/dom-render';
import { memoryStorage } from '@/test/memory-storage';
import { currentPath, renderTenant, settle } from '@/modules/suite-tenant/__tests__/tenant-harness';
import TenantSecurity from '../pages/tenant-security';

let page: MountedPage | null = null;

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
  mocks.hasEnrolledFactors.mockReset();
  useAuthStore.setState({
    user: { id: 'u-1', email: 'admin@tenant.test', roles: ['CLIENT_ADMIN'] } as unknown as AuthUser,
    token: 'token',
    isAuthenticated: true,
  });
});

afterEach(() => {
  page?.unmount();
  page = null;
  vi.unstubAllGlobals();
});

function mount() {
  page = renderTenant(<TenantSecurity />, {
    path: '/tenant/settings/security',
    routePath: '/tenant/settings/security',
  });
}

describe('TenantSecurity (container)', () => {
  it('enrolls a second factor with the shared TOTP flow, then opens the backoffice', async () => {
    mocks.hasEnrolledFactors.mockResolvedValue(false);
    mount();
    await settle(() => page?.text().includes('Set up 2FA') ?? false);
    expect(page?.container.querySelector('[data-testid="totp-flow"]')).toBeNull();

    page?.click(page.findByText('button', 'Set up 2FA'));
    expect(page?.text()).toContain('totp-flow admin@tenant.test');

    page?.click(page!.container.querySelector('[data-testid="totp-flow"]')!);
    expect(page?.text()).toContain('Two-step verification is on.');

    page?.click(page!.findByText('a', 'Continue to the backoffice'));
    expect(currentPath(page!)).toBe('/tenant/overview');
  });

  it('says so when a factor is already enrolled', async () => {
    mocks.hasEnrolledFactors.mockResolvedValue(true);
    mount();
    await settle(() => page?.text().includes('Two-step verification is on.') ?? false);

    expect(page?.text()).not.toContain('Set up 2FA');
    expect(page?.container.querySelector('a[href="/tenant/overview"]')).not.toBeNull();
  });
});
