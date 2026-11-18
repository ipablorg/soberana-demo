// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ request: vi.fn() }));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock('@/shared/lib/graphql-client', () => ({
  graphqlClient: { request: mocks.request },
  setAuthToken: vi.fn(),
  clearHeaders: vi.fn(),
}));
// The shared top bar pulls the whole suite chrome; the layout only hands it a slot.
vi.mock('@/shared/components/common/AppTopbar', () => ({
  AppTopbar: ({ rightSlot }: { rightSlot?: React.ReactNode }) => <header>{rightSlot}</header>,
}));

import type { TenantMe } from '@/graphql/types/tenant';
import type { MountedPage } from '@/test/dom-render';
import { installCommandPolyfills } from '@/test/dom-polyfills';
import TenantOverview from '@/modules/suite-tenant/features/overview/pages/tenant-overview';
import { TenantLayout } from '@/modules/suite-tenant/layouts/tenant-layout';

import {
  graphQLError,
  renderTenant,
  respond,
  settle,
} from '@/modules/suite-tenant/__tests__/tenant-harness';

installCommandPolyfills();

const TENANT: TenantMe = {
  client_id: '11111111-1111-4111-8111-111111111111',
  name: 'Acme Payments',
  status: 'ACTIVE',
  api_key_prefix: 'lpk_test_ab12',
  api_key_rotated_at: '2026-11-01T10:00:00.000Z',
  api_key_expires_at: null,
  environment: 'sandbox',
  enabled_rails: [
    { code: 'co_breb', currency: 'COP', country: 'COL' },
    { code: 'ach', currency: 'USD', country: null },
  ],
};

let page: MountedPage | null = null;

beforeEach(() => {
  mocks.request.mockImplementation(respond({ tenant_me: () => TENANT }));
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
});

afterEach(() => {
  page?.unmount();
  page = null;
  vi.unstubAllGlobals();
  mocks.request.mockReset();
});

describe('TenantOverview (container)', () => {
  it('renders the tenant profile from tenant_me', async () => {
    page = renderTenant(<TenantOverview />);
    await settle(() => page?.text().includes('Acme Payments') ?? false);

    const text = page.text();
    expect(text).toContain('Acme Payments');
    expect(text).toContain('Active');
    expect(text).toContain('Sandbox');
    expect(text).toContain('lpk_test_ab12');
    expect(text).toContain('Never');
    expect(page.container.querySelector('[data-testid="enabled-rails"]')?.textContent).toContain(
      'co_breb'
    );
    expect(text).toContain('COP · COL');
  });

  it('shows the error state with a retry when tenant_me fails', async () => {
    mocks.request.mockImplementation(async () => {
      throw graphQLError('TENANT_ACCESS_REQUIRED', 'Forbidden', 'FORBIDDEN');
    });
    page = renderTenant(<TenantOverview />);
    await settle(() => page?.container.querySelector('[role="alert"]') !== null);

    expect(page.container.querySelector('[role="alert"]')).not.toBeNull();
    expect(page.text()).toContain('Try again');
  });
});

describe('TenantLayout', () => {
  it('lists every section as a live link (phase B included) and the environment', async () => {
    page = renderTenant(<TenantLayout />, { path: '/tenant/overview', routePath: '/tenant/*' });
    await settle(() => page?.text().includes('Acme Payments') ?? false);

    const text = page.text();
    for (const section of ['Overview', 'Customers', 'Wallets', 'Transactions', 'Team', 'API key']) {
      expect(text).toContain(section);
    }
    expect(
      page.container.querySelector('[data-testid="tenant-environment-badge"]')?.textContent
    ).toBe('Sandbox');

    expect(page.container.querySelector('[data-testid="tenant-coming-soon"]')).toBeNull();
    const hrefs = Array.from(page.container.querySelectorAll('a')).map((link) =>
      link.getAttribute('href')
    );
    for (const route of [
      '/tenant/beneficiaries',
      '/tenant/quotes',
      '/tenant/rails',
      '/tenant/virtual-accounts',
      '/tenant/webhooks',
    ]) {
      expect(hrefs).toContain(route);
    }
  });
});
