// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  user: { email: 'admin@acme.test', roles: ['CLIENT_ADMIN'], staff_roles: [] as string[] },
}));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@/shared/hooks/use-auth', () => ({
  useAuth: () => ({ user: mocks.user, isStaff: mocks.user.staff_roles.length > 0 }),
}));
vi.mock('@/shared/components/common/TypewriterText', () => ({
  TypewriterText: ({ text }: { text: string }) => <p>{text}</p>,
}));

import type { MountedPage } from '@/test/dom-render';
import Unauthorized from '@/modules/common/errors/pages/unauthorized';
import { currentPath, renderTenant, settle } from '@/modules/suite-tenant/__tests__/tenant-harness';

let page: MountedPage | null = null;

afterEach(() => {
  page?.unmount();
  page = null;
});

async function goHomeAs(roles: string[], staffRoles: string[]): Promise<string | null | undefined> {
  mocks.user = { email: 'someone@acme.test', roles, staff_roles: staffRoles };
  page = renderTenant(<Unauthorized />, { path: '/unauthorized' });
  const home = page.findByText<HTMLButtonElement>('button', 'Dashboard');
  page.click(home);
  await settle();

  return currentPath(page);
}

describe('Unauthorized "go home"', () => {
  it.each([
    ['a tenant admin', ['CLIENT_ADMIN'], [], '/tenant'],
    ['staff', ['LOOPAY_ADMIN'], ['LOOPAY_ADMIN'], '/backoffice'],
    ['an end customer', ['CLIENT_USER'], [], '/suite/dashboard'],
  ])('sends %s to their home', async (_who, roles, staffRoles, expected) => {
    expect(await goHomeAs(roles, staffRoles)).toBe(expected);
  });
});
