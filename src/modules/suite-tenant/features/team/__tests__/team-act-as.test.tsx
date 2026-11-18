// @vitest-environment jsdom

/**
 * Tenant team under act-as (epic 2026-11 S5): the acting staff member is not a
 * team row, so no row is "you" (not even one sharing its email), every real
 * admin can be removed, and a row carrying the staff user id never offers
 * removal (the back answers 403 TENANT_ADMIN_SELF_REMOVAL for it).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  // The synthetic tenant admin auth_me returns under x-act-as-client.
  user: { id: 'staff-1', email: 'me@acme.test', roles: ['CLIENT_ADMIN'], staff_roles: [] },
}));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock('@/shared/lib/graphql-client', () => ({
  graphqlClient: { request: mocks.request },
  setAuthToken: vi.fn(),
  setActAsHeader: vi.fn(),
  setViewAsHeader: vi.fn(),
  clearHeaders: vi.fn(),
}));
vi.mock('@/shared/hooks/use-auth', () => ({ useAuth: () => ({ user: mocks.user }) }));

import type { TenantTeamMember } from '@/graphql/types/tenant';
import { useActAsStore } from '@/shared/stores/act-as-store';
import type { MountedPage } from '@/test/dom-render';
import TenantTeam from '@/modules/suite-tenant/features/team/pages/tenant-team';
import { renderTenant, respond, settle } from '@/modules/suite-tenant/__tests__/tenant-harness';

const SAME_EMAIL: TenantTeamMember = {
  id: 'u-self',
  email: 'me@acme.test',
  first_name: 'Real',
  last_name: 'Admin',
  created_at: '2026-10-01T10:00:00.000Z',
};
const OTHER: TenantTeamMember = {
  id: 'u-other',
  email: 'other@acme.test',
  first_name: null,
  last_name: null,
  created_at: '2026-10-02T10:00:00.000Z',
};
const STAFF_ROW: TenantTeamMember = {
  id: 'staff-1',
  email: 'staff@loopay.test',
  first_name: null,
  last_name: null,
  created_at: '2026-10-03T10:00:00.000Z',
};

let page: MountedPage | null = null;

function removeButtonOf(memberId: string): HTMLButtonElement | null {
  return document.body.querySelector<HTMLButtonElement>(
    `li[data-member="${memberId}"] [data-testid="remove-admin"]`
  );
}

async function mountTeam(members: TenantTeamMember[]) {
  mocks.request.mockImplementation(respond({ tenant_listTeam: () => members }));
  page = renderTenant(<TenantTeam />);
  await settle(() => page?.text().includes('other@acme.test') ?? false);
}

beforeEach(() => {
  mocks.request.mockReset();
  useActAsStore.setState({ clientId: 'cl-1', staffUser: null });
});

afterEach(() => {
  page?.unmount();
  page = null;
  useActAsStore.setState({ clientId: null, staffUser: null });
});

describe('TenantTeam under act-as', () => {
  it('marks no row as you and lets every real admin be removed', async () => {
    await mountTeam([SAME_EMAIL, OTHER]);

    expect(page?.container.querySelector('[data-testid="team-list"]')?.textContent).not.toContain(
      'You'
    );
    expect(removeButtonOf(SAME_EMAIL.id)?.disabled).toBe(false);
    expect(removeButtonOf(OTHER.id)?.disabled).toBe(false);
  });

  it('says the acting staff member is not on the team', async () => {
    await mountTeam([SAME_EMAIL, OTHER]);

    expect(page?.container.querySelector('[data-testid="act-as-team-note"]')).not.toBeNull();
  });

  it('never offers removal on a row carrying the staff user id', async () => {
    await mountTeam([STAFF_ROW, OTHER]);

    expect(removeButtonOf(STAFF_ROW.id)).toBeNull();
    expect(removeButtonOf(OTHER.id)?.disabled).toBe(false);
  });
});
