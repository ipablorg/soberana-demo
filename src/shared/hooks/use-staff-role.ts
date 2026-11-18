/**
 * Reactive staff role check against the signed-in user's `staff_roles`.
 */

import { hasStaffRole } from '@/shared/lib/staff-roles';
import { useAuthStore } from '@/shared/stores/auth-store';

export function useHasStaffRole(role: string): boolean {
  return useAuthStore((state) => hasStaffRole(state.user?.staff_roles, role));
}
