/**
 * Tenant (client) admin role checks and the home route of each kind of user.
 *
 * A tenant admin is a human user of a client whose `auth_me.roles` holds
 * `CLIENT_ADMIN`; the backend's `@TenantAccess()` guard is the authority (it
 * also requires the client to be ACTIVE), so these checks only decide where the
 * UI sends the user and what it renders.
 */

/** Role of a tenant admin in `auth_me.roles` (backend `UserRole.CLIENT_ADMIN`). */
export const TENANT_ADMIN_ROLE = 'CLIENT_ADMIN';

/** Landing route of Loopay staff. */
export const BACKOFFICE_HOME_ROUTE = '/backoffice';

/** Landing route of tenant admins (the tenant backoffice). */
export const TENANT_HOME_ROUTE = '/tenant';

/** Landing route of everyone else (end customers of the dashboard). */
export const SUITE_HOME_ROUTE = '/suite/dashboard';

interface RoleCarrier {
  roles?: readonly string[] | null;
  staff_roles?: readonly string[] | null;
}

/** Whether the signed-in user is Loopay staff (any staff role). */
export function isStaffUser(user: RoleCarrier | null | undefined): boolean {
  return (user?.staff_roles?.length ?? 0) > 0;
}

/** Whether the signed-in user is a tenant admin (`CLIENT_ADMIN`). */
export function isTenantAdmin(user: RoleCarrier | null | undefined): boolean {
  return user?.roles?.includes(TENANT_ADMIN_ROLE) ?? false;
}

/**
 * Where a signed-in user lands: staff in the backoffice (staff wins over any
 * client role), tenant admins in the tenant backoffice, everyone else in the
 * customer dashboard.
 */
export function getHomeRoute(user: RoleCarrier | null | undefined): string {
  if (isStaffUser(user)) return BACKOFFICE_HOME_ROUTE;
  if (isTenantAdmin(user)) return TENANT_HOME_ROUTE;

  return SUITE_HOME_ROUTE;
}
