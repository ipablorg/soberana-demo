/**
 * Reactive #411 role check: whether the signed-in staff member may approve,
 * review or move money (see `canOperateMoney`). `OPS_COMMERCIAL` gets `false`
 * and reads the money screens without any action button.
 */

import { canOperateMoney } from '@/shared/lib/staff-roles';
import { useAuthStore } from '@/shared/stores/auth-store';

export function useCanOperateMoney(): boolean {
  return useAuthStore((state) => canOperateMoney(state.user?.staff_roles));
}
