import { STAFF_SUPERUSER_ROLE } from '@/shared/lib/staff-roles';

/**
 * Customer and wallet status changes (`adminLoopay_updateCustomerStatus`,
 * `adminLoopay_updateWallet`) are gated to `LOOPAY_ADMIN` in the backend, so
 * the UI only offers them to the super admin. Commercial staff never change a
 * customer's operational status.
 */
export function canManageCustomerStatus(roles: readonly string[] | null | undefined): boolean {
  return !!roles && roles.includes(STAFF_SUPERUSER_ROLE);
}
