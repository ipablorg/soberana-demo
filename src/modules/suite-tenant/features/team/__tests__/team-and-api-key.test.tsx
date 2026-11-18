// @vitest-environment jsdom

import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  toastError: vi.fn(),
  user: { id: 'u-self', email: 'me@acme.test' },
}));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('sonner', () => ({ toast: { error: mocks.toastError, success: vi.fn() } }));
vi.mock('@/shared/lib/graphql-client', () => ({
  graphqlClient: { request: mocks.request },
  setAuthToken: vi.fn(),
  clearHeaders: vi.fn(),
}));
vi.mock('@/shared/hooks/use-auth', () => ({ useAuth: () => ({ user: mocks.user }) }));

import type { TenantMe, TenantTeamMember } from '@/graphql/types/tenant';
import { changeValue, submitForm } from '@/test/dom-input';
import type { MountedPage } from '@/test/dom-render';
import TenantTeam from '@/modules/suite-tenant/features/team/pages/tenant-team';
import TenantApiKey from '@/modules/suite-tenant/features/api-key/pages/tenant-api-key';
import { validateRotation } from '@/modules/suite-tenant/features/api-key/lib/rotation-form';
import {
  graphQLError,
  renderTenant,
  respond,
  settle,
} from '@/modules/suite-tenant/__tests__/tenant-harness';

const SELF: TenantTeamMember = {
  id: 'u-self',
  email: 'me@acme.test',
  first_name: 'Me',
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

const TENANT: TenantMe = {
  client_id: 'cl-1',
  name: 'Acme',
  status: 'ACTIVE',
  api_key_prefix: 'lpk_live_ab12',
  api_key_rotated_at: null,
  api_key_expires_at: null,
  environment: 'sandbox',
  enabled_rails: [],
};

let page: MountedPage | null = null;

function el<T extends Element>(selector: string, root: ParentNode = document.body): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`missing ${selector}`);
  return element;
}

function click(element: Element) {
  act(() => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

beforeEach(() => {
  mocks.request.mockReset();
  mocks.toastError.mockReset();
});

afterEach(() => {
  page?.unmount();
  page = null;
  document.body.innerHTML = '';
});

describe('TenantTeam (container)', () => {
  const handlers = {
    tenant_listTeam: () => [SELF, OTHER],
    tenant_removeAdmin: () => OTHER,
    tenant_inviteAdmin: () => ({
      member: { ...OTHER, id: 'u-new', email: 'new@acme.test' },
      password_setup_link: 'https://auth.example/setup?oob=1',
    }),
  };

  async function mountTeam(overrides: Partial<typeof handlers> = {}) {
    mocks.request.mockImplementation(respond({ ...handlers, ...overrides }));
    page = renderTenant(<TenantTeam />);
    await settle(() => page?.text().includes('other@acme.test') ?? false);
  }

  function removeButtonOf(memberId: string): HTMLButtonElement {
    return el<HTMLButtonElement>(`li[data-member="${memberId}"] [data-testid="remove-admin"]`);
  }

  it('lists the admins and never lets you remove yourself', async () => {
    await mountTeam();

    expect(page?.text()).toContain('Me Admin');
    expect(page?.text()).toContain('You');
    expect(removeButtonOf(SELF.id).disabled).toBe(true);
    expect(removeButtonOf(OTHER.id).disabled).toBe(false);
  });

  it('removes another admin only after confirming', async () => {
    await mountTeam();

    click(removeButtonOf(OTHER.id));
    await settle(
      () => document.body.querySelector('[data-testid="confirm-remove-admin"]') !== null
    );
    expect(mocks.request.mock.calls.some(([, variables]) => 'user_id' in (variables ?? {}))).toBe(
      false
    );

    click(el('[data-testid="confirm-remove-admin"]'));
    await settle(() =>
      mocks.request.mock.calls.some(([, variables]) => 'user_id' in (variables ?? {}))
    );

    const call = mocks.request.mock.calls.find(([, variables]) => 'user_id' in (variables ?? {}));
    expect(call?.[1]).toEqual({ user_id: OTHER.id });
  });

  it('explains the last-admin refusal', async () => {
    await mountTeam({
      tenant_removeAdmin: () => {
        throw graphQLError('LAST_TENANT_ADMIN', 'Conflict', 'CONFLICT');
      },
    });

    click(removeButtonOf(OTHER.id));
    await settle(
      () => document.body.querySelector('[data-testid="confirm-remove-admin"]') !== null
    );
    click(el('[data-testid="confirm-remove-admin"]'));
    await settle(() => mocks.toastError.mock.calls.length > 0);

    expect(mocks.toastError).toHaveBeenCalledWith("We couldn't remove the admin", {
      description: 'Your team needs at least one admin.',
    });
  });

  it('invites an admin and shows the one-time setup link', async () => {
    await mountTeam();

    changeValue(el<HTMLInputElement>('#invite-email'), ' new@acme.test ');
    submitForm(el<HTMLFormElement>('[data-testid="invite-form"]'));
    await settle(() => page?.container.querySelector('[data-testid="invitation-result"]') !== null);

    const call = mocks.request.mock.calls.find(([, variables]) => 'input' in (variables ?? {}));
    expect(call?.[1]).toEqual({ input: { email: 'new@acme.test' } });
    expect(page?.text()).toContain('https://auth.example/setup?oob=1');
  });
});

describe('TenantApiKey (container)', () => {
  const handlers = {
    tenant_me: () => TENANT,
    tenant_regenerateApiKey: () => ({
      api_key: 'lpk_live_SECRET_123',
      api_key_prefix: 'lpk_live_cd34',
    }),
  };

  async function rotateWith(grace: string) {
    mocks.request.mockImplementation(respond(handlers));
    page = renderTenant(<TenantApiKey />);
    await settle(() => page?.text().includes('lpk_live_ab12') ?? false);

    changeValue(el<HTMLInputElement>('#rotate-grace'), grace);
    click(el('[data-testid="rotate-api-key"]'));
    await settle(() => document.body.querySelector('[data-testid="confirm-rotate"]') !== null);
    click(el('[data-testid="confirm-rotate"]'));
    await settle(() => page?.container.querySelector('[data-testid="api-key-secret"]') !== null);
  }

  it('shows the new secret once, with the grace warning, and forgets it after dismissal', async () => {
    await rotateWith('30');

    const call = mocks.request.mock.calls.find(
      ([, variables]) => 'graceMinutes' in (variables ?? {})
    );
    expect(call?.[1]).toEqual({ graceMinutes: 30 });
    expect(el('[data-testid="api-key-value"]').textContent).toBe('lpk_live_SECRET_123');
    expect(page?.text()).toContain('The previous key keeps working for 30 minutes.');

    click(el('[data-testid="api-key-done"]'));
    await settle();

    expect(page?.container.querySelector('[data-testid="api-key-secret"]')).toBeNull();
    expect(document.body.textContent).not.toContain('lpk_live_SECRET_123');
    expect(page?.container.querySelector('[data-testid="rotate-api-key"]')).not.toBeNull();
  });

  it('warns that a zero grace period stops the previous key at once', async () => {
    await rotateWith('0');

    expect(page?.text()).toContain('The previous key stopped working.');
  });

  it('does not rotate with an out-of-range grace period', async () => {
    mocks.request.mockImplementation(respond(handlers));
    page = renderTenant(<TenantApiKey />);
    await settle(() => page?.text().includes('lpk_live_ab12') ?? false);

    changeValue(el<HTMLInputElement>('#rotate-grace'), '20000');
    click(el('[data-testid="rotate-api-key"]'));
    await settle();

    expect(document.body.querySelector('[data-testid="confirm-rotate"]')).toBeNull();
    expect(page?.text()).toContain('Use a whole number from 0 to 10080.');
  });

  it('rejects an expiry in the past', () => {
    expect(
      validateRotation(
        { graceMinutes: '60', expiresAt: '2026-01-01T00:00' },
        new Date('2026-11-05T00:00:00Z')
      )
    ).toEqual({ expiresAt: 'expiry' });
  });
});
