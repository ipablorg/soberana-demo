/**
 * Pure rules for `/backoffice/clients`: who may manage tenants and how the tax
 * id type is shown (always the catalog code, never its UUID).
 */

import type { AdminTaxIdTypeOption } from '@/graphql/queries/admin-loopay';
import {
  COMMERCIAL_ROLE,
  PLATFORM_ADMIN_ROLE,
  hasAnyExactStaffRole,
} from '@/shared/lib/staff-roles';

import { EMPTY_CELL } from '../../ops-review/lib/ops-formatting';
import type { SelectOption } from '../../platform-config/lib/catalog-options';

/**
 * Tenant mutations (`adminLoopay_updateClient`, revoke) are for the super admin;
 * the legacy PLATFORM_ADMIN keeps them for compatibility.
 */
export function canManageClients(roles: readonly string[] | null | undefined): boolean {
  return hasAnyExactStaffRole(roles, [PLATFORM_ADMIN_ROLE]);
}

/**
 * #411: `adminLoopay_listClients` is an exact PLATFORM_ADMIN / OPS_COMMERCIAL
 * gate, so commercial reads the list; operations does not.
 */
export function canReadClients(roles: readonly string[] | null | undefined): boolean {
  return hasAnyExactStaffRole(roles, [PLATFORM_ADMIN_ROLE, COMMERCIAL_ROLE]);
}

export function taxIdTypeLabel(
  id: string | null | undefined,
  types: readonly AdminTaxIdTypeOption[]
): string {
  if (!id) return EMPTY_CELL;
  return types.find((type) => type.id === id)?.name ?? EMPTY_CELL;
}

export function taxIdTypeOptions(types: readonly AdminTaxIdTypeOption[]): SelectOption[] {
  return types.map((type) => ({
    value: type.id,
    label: type.countries?.length ? `${type.name} (${type.countries.join(', ')})` : type.name,
  }));
}
