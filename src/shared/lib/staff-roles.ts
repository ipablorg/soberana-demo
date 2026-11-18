/**
 * Staff role checks for the backoffice.
 *
 * Roles come from `auth_me.staff_roles`, which the backend resolves with
 * `resolveStaffRoles` (Firebase `staffRoles` custom claim, DB column fallback)
 * — the same list its `StaffAccessGuard` authorizes against. These checks only
 * decide what the UI renders; the backend still enforces every operation.
 */

/** Superuser: passes every staff gate, mirroring `STAFF_SUPERUSER_ROLE`. */
export const STAFF_SUPERUSER_ROLE = 'LOOPAY_ADMIN';

/** Only role (besides the superuser) that sees the platform config section. */
export const PLATFORM_ADMIN_ROLE = 'PLATFORM_ADMIN';

/** Grandfathered ops staff: passes every `OPS_*` gate, never `PLATFORM_ADMIN`. */
export const OPERATIONS_ROLE = 'LOOPAY_OPERATIONS';

/**
 * Roles that may provision a wallet for a customer (`adminLoopay_createWallet`).
 * #411: commercial reads wallets but never provisions one.
 */
export const ADD_WALLET_ROLES: readonly string[] = [
  STAFF_SUPERUSER_ROLE,
  OPERATIONS_ROLE,
  'OPS_VA',
];

/**
 * True when `roles` holds `role` or the `LOOPAY_ADMIN` superuser role.
 * `LOOPAY_OPERATIONS` is a wildcard only for `OPS_*` roles, mirroring the
 * backend gate: it never passes `PLATFORM_ADMIN`.
 */
export function hasStaffRole(roles: readonly string[] | null | undefined, role: string): boolean {
  if (!roles || roles.length === 0) return false;

  if (roles.includes(STAFF_SUPERUSER_ROLE) || roles.includes(role)) return true;

  return role.startsWith('OPS_') && roles.includes(OPERATIONS_ROLE);
}

/** True when `roles` satisfies at least one of `allowed` (see `hasStaffRole`). */
export function hasAnyStaffRole(
  roles: readonly string[] | null | undefined,
  allowed: readonly string[]
): boolean {
  return allowed.some((role) => hasStaffRole(roles, role));
}

/** Whether the staff member may add a wallet to a customer. */
export function canAddWallet(roles: readonly string[] | null | undefined): boolean {
  return hasAnyStaffRole(roles, ADD_WALLET_ROLES);
}

/** Commercial team: onboards clients at providers, sets fees/API keys, creates wallets, requests virtual accounts. */
export const COMMERCIAL_ROLE = 'OPS_COMMERCIAL';

/**
 * Three-role model: the only roles that can be assigned from the backoffice
 * (mirrors the backend `GRANTABLE_STAFF_ROLES`). Everything else is legacy.
 */
export const GRANTABLE_STAFF_ROLES = [
  STAFF_SUPERUSER_ROLE,
  OPERATIONS_ROLE,
  COMMERCIAL_ROLE,
] as const;

const GRANTABLE_ROLE_LABELS: Readonly<Record<string, string>> = {
  LOOPAY_ADMIN: 'Super administrador',
  LOOPAY_OPERATIONS: 'Operaciones',
  OPS_COMMERCIAL: 'Comercial',
};

const LEGACY_ROLE_LABELS: Readonly<Record<string, string>> = {
  OPS_KYC: 'Cumplimiento KYC',
  OPS_RECAUDOS: 'Recaudos',
  OPS_DISPERSIONES: 'Dispersiones',
  OPS_VA: 'Cuentas virtuales',
  PLATFORM_ADMIN: 'Administrador de plataforma',
};

/** True for a staff role that still works but can no longer be assigned. */
export function isLegacyStaffRole(role: string | null | undefined): boolean {
  return !!role && role in LEGACY_ROLE_LABELS;
}

/** Spanish label of a staff role; legacy roles read "<label> (legado)". */
export function staffRoleLabel(role: string | null | undefined): string {
  if (!role) return '—';
  if (role in GRANTABLE_ROLE_LABELS) return GRANTABLE_ROLE_LABELS[role];
  if (role in LEGACY_ROLE_LABELS) return `${LEGACY_ROLE_LABELS[role]} (legado)`;

  return role;
}

/**
 * Commercial section (onboarding, countries, rails, fees, API keys). Exact role
 * check: `LOOPAY_OPERATIONS` passes the backend's `OPS_*` gates but operations
 * does not run the commercial work, so it is not offered in the UI.
 */
export function canAccessCommercialSection(roles: readonly string[] | null | undefined): boolean {
  if (!roles || roles.length === 0) return false;

  return roles.includes(STAFF_SUPERUSER_ROLE) || roles.includes(COMMERCIAL_ROLE);
}

/**
 * Roles that may request a virtual account for a customer
 * (`adminLoopay_requestVirtualAccount`). #411: not commercial.
 */
export const REQUEST_VIRTUAL_ACCOUNT_ROLES: readonly string[] = [
  STAFF_SUPERUSER_ROLE,
  OPERATIONS_ROLE,
  'OPS_VA',
];

export function canRequestVirtualAccount(roles: readonly string[] | null | undefined): boolean {
  return hasAnyStaffRole(roles, REQUEST_VIRTUAL_ACCOUNT_ROLES);
}

/**
 * Legacy ops roles that still act on their own money queue (they keep working
 * but can no longer be assigned).
 */
const LEGACY_MONEY_ROLES: ReadonlySet<string> = new Set([
  'OPS_KYC',
  'OPS_RECAUDOS',
  'OPS_DISPERSIONES',
  'OPS_VA',
]);

/**
 * #411 role table: whether the staff member may approve, review or move money
 * (KYC decisions, endorsement and beneficiary reviews, recaudos, dispersiones,
 * VA linking, provider requirements). `OPS_COMMERCIAL` reads those screens but
 * never acts on them, so the UI renders no approve/review/complete button.
 * Exact role check: commercial is an `OPS_*` code but not an operations role.
 */
export function canOperateMoney(roles: readonly string[] | null | undefined): boolean {
  if (!roles || roles.length === 0) return false;

  return roles.some(
    (role) =>
      role === STAFF_SUPERUSER_ROLE || role === OPERATIONS_ROLE || LEGACY_MONEY_ROLES.has(role)
  );
}

/**
 * Exact three-role gate: true when `roles` holds `LOOPAY_ADMIN` or one of
 * `allowed` literally (no `OPS_*` wildcard for operations).
 */
export function hasAnyExactStaffRole(
  roles: readonly string[] | null | undefined,
  allowed: readonly string[]
): boolean {
  if (!roles || roles.length === 0) return false;

  return roles.includes(STAFF_SUPERUSER_ROLE) || allowed.some((role) => roles.includes(role));
}

/**
 * Commercial dual user (epic 2026-11 S5): the exact roles the backend lets
 * view the client app as a customer (`x-view-as-customer`), act as a tenant
 * admin (`x-act-as-client`) and invite a client's first tenant admin
 * (`adminLoopay_inviteTenantAdmin`). Exact check: `LOOPAY_OPERATIONS` passes
 * `OPS_*` gates elsewhere but not these.
 */
export const COMMERCIAL_DUAL_USER_ROLES: readonly string[] = [
  STAFF_SUPERUSER_ROLE,
  COMMERCIAL_ROLE,
];

/** Whether the staff member may open the client app as one customer (read-only). */
export function canViewAsCustomer(roles: readonly string[] | null | undefined): boolean {
  return hasAnyExactStaffRole(roles, COMMERCIAL_DUAL_USER_ROLES);
}

/** Whether the staff member may enter a client's tenant backoffice as one of its admins. */
export function canActAsTenant(roles: readonly string[] | null | undefined): boolean {
  return hasAnyExactStaffRole(roles, COMMERCIAL_DUAL_USER_ROLES);
}

/** Whether the staff member may invite a tenant admin for a client. */
export function canInviteTenantAdmin(roles: readonly string[] | null | undefined): boolean {
  return hasAnyExactStaffRole(roles, COMMERCIAL_DUAL_USER_ROLES);
}
