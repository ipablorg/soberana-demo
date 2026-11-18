/**
 * Staff directory presentation rules: Spanish status labels and which row
 * actions are offered (inactive rows can be reactivated, never deactivated).
 */

export function staffStatusLabel(isActive: boolean): string {
  return isActive ? 'Activo' : 'Inactivo';
}

export interface StaffRowActions {
  canEdit: boolean;
  toggle: 'deactivate' | 'reactivate' | null;
}

/** The caller's own row is locked: the backend refuses self role changes and self deactivation. */
export function staffRowActions(input: { isActive: boolean; isSelf: boolean }): StaffRowActions {
  if (input.isSelf) return { canEdit: false, toggle: null };
  return input.isActive
    ? { canEdit: true, toggle: 'deactivate' }
    : { canEdit: false, toggle: 'reactivate' };
}
