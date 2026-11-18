// @vitest-environment jsdom

/**
 * The tenant layout shows the act-as banner only when `tenant_me.acting_as`
 * says a staff member is acting (epic 2026-11 S5); a real tenant admin never
 * sees it.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ request: vi.fn() }));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@/shared/lib/graphql-client', () => ({
  graphqlClient: { request: mocks.request },
  setAuthToken: vi.fn(),
  setActAsHeader: vi.fn(),
  setViewAsHeader: vi.fn(),
  clearHeaders: vi.fn(),
}));

import type { TenantMe } from '@/graphql/types/tenant';
import type { MountedPage } from '@/test/dom-render';
import { TenantActAsBanner } from '@/modules/suite-tenant/components/organisms/tenant-act-as-banner';
import { renderTenant, respond, settle } from '@/modules/suite-tenant/__tests__/tenant-harness';

const TENANT: TenantMe = {
  client_id: 'cl-1',
  name: 'Acme SAS',
  status: 'ACTIVE',
  api_key_prefix: 'lpk_live_ab12',
  api_key_rotated_at: null,
  api_key_expires_at: null,
  environment: 'sandbox',
  enabled_rails: [],
  acting_as: null,
};

let page: MountedPage | null = null;

beforeEach(() => {
  mocks.request.mockReset();
});

afterEach(() => {
  page?.unmount();
  page = null;
});

describe('TenantActAsBanner', () => {
  it('renders the banner from tenant_me.acting_as', async () => {
    mocks.request.mockImplementation(
      respond({
        tenant_me: () => ({
          ...TENANT,
          acting_as: { staff_email: 'ana@loopay.test', staff_roles: ['OPS_COMMERCIAL'] },
        }),
      })
    );

    page = renderTenant(<TenantActAsBanner />);
    await settle(() => page?.text().includes('ana@loopay.test') ?? false);

    expect(page.text()).toContain('You are acting as an admin of Acme SAS as ana@loopay.test');
    expect(page.container.querySelector('[data-testid="exit-act-as"]')).not.toBeNull();
  });

  it('renders nothing for a real tenant admin', async () => {
    mocks.request.mockImplementation(respond({ tenant_me: () => TENANT }));

    page = renderTenant(<TenantActAsBanner />);
    await settle(() => mocks.request.mock.calls.length > 0);
    await settle();

    expect(page.container.querySelector('[data-testid="exit-act-as"]')).toBeNull();
    expect(page.text()).not.toContain('acting as');
  });
});
