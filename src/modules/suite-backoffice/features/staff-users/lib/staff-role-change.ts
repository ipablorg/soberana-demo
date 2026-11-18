/**
 * Pure rules for staff user creation and role changes.
 *
 * Creation asks only for email, names and role: the backend finds or creates
 * the Firebase user by email, so the Firebase UID is never typed by hand.
 */

import type { AdminStaffRole } from '@/graphql/types/admin-loopay';
import { GRANTABLE_STAFF_ROLES } from '@/shared/lib/staff-roles';

/**
 * Roles grantable from the backoffice: the three-role model (super admin,
 * operations, commercial). Legacy roles keep working but are not assignable.
 * LOOPAY_ADMIN is grantable by LOOPAY_ADMIN only (page gate).
 */
export const GRANTABLE_ROLES: readonly AdminStaffRole[] = GRANTABLE_STAFF_ROLES;

export interface CreateStaffForm {
  email: string;
  firstName: string;
  lastName: string;
  staffRole: AdminStaffRole;
}

export interface CreateStaffInput {
  email: string;
  firstName?: string;
  lastName?: string;
  staffRole: AdminStaffRole;
}

export function buildCreateStaffInput(form: CreateStaffForm): CreateStaffInput {
  const firstName = form.firstName.trim();
  const lastName = form.lastName.trim();

  return {
    email: form.email.trim(),
    ...(firstName && { firstName }),
    ...(lastName && { lastName }),
    staffRole: form.staffRole,
  };
}

/** Granting LOOPAY_ADMIN or changing any role needs an explicit confirmation step. */
export function isRoleChangeConfirmationRequired(
  currentRole: AdminStaffRole | null,
  nextRole: AdminStaffRole
): boolean {
  return nextRole === 'LOOPAY_ADMIN' || currentRole !== nextRole;
}
