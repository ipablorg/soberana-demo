import { describe, expect, it } from 'vitest';

import {
  BACKOFFICE_HOME_ROUTE,
  SUITE_HOME_ROUTE,
  TENANT_ADMIN_ROLE,
  TENANT_HOME_ROUTE,
  getHomeRoute,
  isTenantAdmin,
} from '@/shared/lib/tenant-roles';

type RoleUser = { roles?: string[] | null; staff_roles?: string[] | null };

describe('isTenantAdmin', () => {
  it('is true only when auth_me.roles holds CLIENT_ADMIN', () => {
    expect(TENANT_ADMIN_ROLE).toBe('CLIENT_ADMIN');
    expect(isTenantAdmin({ roles: ['CLIENT_ADMIN'], staff_roles: [] })).toBe(true);
    expect(isTenantAdmin({ roles: ['CLIENT_USER'], staff_roles: [] })).toBe(false);
    expect(isTenantAdmin({ roles: [], staff_roles: [] })).toBe(false);
    expect(isTenantAdmin(null)).toBe(false);
    expect(isTenantAdmin(undefined)).toBe(false);
  });
});

describe('getHomeRoute (login redirect matrix)', () => {
  const cases: Array<[string, RoleUser | null, string]> = [
    ['staff', { roles: ['LOOPAY_ADMIN'], staff_roles: ['LOOPAY_ADMIN'] }, BACKOFFICE_HOME_ROUTE],
    [
      'staff that is also a tenant admin',
      { roles: ['CLIENT_ADMIN'], staff_roles: ['OPS_COMMERCIAL'] },
      BACKOFFICE_HOME_ROUTE,
    ],
    ['tenant admin', { roles: ['CLIENT_ADMIN'], staff_roles: [] }, TENANT_HOME_ROUTE],
    ['client user (end customer)', { roles: ['CLIENT_USER'], staff_roles: [] }, SUITE_HOME_ROUTE],
    ['viewer', { roles: ['VIEWER'], staff_roles: [] }, SUITE_HOME_ROUTE],
    ['user without roles', { roles: null, staff_roles: null }, SUITE_HOME_ROUTE],
    ['no user', null, SUITE_HOME_ROUTE],
  ];

  it.each(cases)('sends a %s to its app', (_label, user, expected) => {
    expect(getHomeRoute(user)).toBe(expected);
  });

  it('uses the expected route literals', () => {
    expect(BACKOFFICE_HOME_ROUTE).toBe('/backoffice');
    expect(TENANT_HOME_ROUTE).toBe('/tenant');
    expect(SUITE_HOME_ROUTE).toBe('/suite/dashboard');
  });
});
