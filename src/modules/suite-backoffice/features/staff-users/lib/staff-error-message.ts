/**
 * Friendly Spanish messages for the staff-user failures the backend reports
 * with a stable code or message (409 LAST_SUPERUSER, 403 self changes).
 * Returns undefined for anything else so the generic mapper takes over.
 */

export function describeStaffError(error: unknown): string | undefined {
  const text = error instanceof Error ? error.message : String(error ?? '');

  if (text.includes('LAST_SUPERUSER')) {
    return 'No puedes quitar el último superadministrador activo.';
  }
  if (text.includes('cannot change their own role')) {
    return 'No puedes cambiar tu propio rol.';
  }
  if (text.includes('cannot deactivate themselves')) {
    return 'No puedes desactivarte a ti mismo.';
  }

  return undefined;
}
