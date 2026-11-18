/**
 * Pure logic for leaving a client ready to operate: the countries it serves
 * and the provider rails enabled for it. No React, no i18n.
 */

import { isCanonicalRail, isSelectableProvider } from '../../platform-config/lib/catalog-options';

/**
 * Rails under maintenance in the backend (`MAINTENANCE_RAILS`): listed but never
 * enabled. Keep in sync with `phase4-rails.config.ts`.
 */
export const MAINTENANCE_RAIL_CODES: ReadonlySet<string> = new Set([
  'co_breb',
  'ec_bank_transfer',
  'ec_point_of_sale',
  'pe_bank_transfer',
]);

export function isMaintenanceRail(railCode: string): boolean {
  return MAINTENANCE_RAIL_CODES.has(railCode.trim().toLowerCase());
}

/** Default countries for a client: its own country (data the system already has). */
export function defaultAllowedCountries(country: string | null | undefined): string[] {
  const own = (country ?? '').trim().toUpperCase();

  return /^[A-Z]{3}$/.test(own) ? [own] : [];
}

/** The stored `config.allowedCustomerCountries`, or `null` when unset or malformed. */
export function readAllowedCountries(config: unknown): string[] | null {
  if (!config || typeof config !== 'object') return null;
  const raw = (config as { allowedCustomerCountries?: unknown }).allowedCustomerCountries;
  if (!Array.isArray(raw)) return null;
  const codes = raw.filter((code): code is string => typeof code === 'string');

  return codes.length > 0 ? codes : null;
}

export interface CatalogRail {
  providerId: string;
  providerCode: string;
  providerName: string;
  railId: string;
  railCode: string;
  railName: string;
  /** Catalogue flags (#411); absent means active / canonical. */
  providerActive?: boolean;
  railActive?: boolean;
  railCanonicalCode?: string | null;
}

export interface OnboardedProvider {
  code: string;
}

export interface ClientRailRow {
  id: string;
  providerId: string;
  railId: string;
  priority: number;
  isActive: boolean;
}

/**
 * #411: one provider serves a rail for a client, fixed by the catalogue, so a
 * client rail is always created with priority 1 (kept in the DB, never shown).
 */
export const CLIENT_RAIL_PRIORITY = 1;

export interface RailEntry extends CatalogRail {
  enabled: boolean;
  clientRailId: string | null;
  maintenance: boolean;
  canEnable: boolean;
  canDisable: boolean;
  /** Another provider already serves this rail for the client (#411). */
  servedByOtherProvider: boolean;
}

export interface RailGroup {
  providerId: string;
  providerCode: string;
  providerName: string;
  rails: RailEntry[];
}

/**
 * Rails offered by the providers the client is LINKED/MANUAL with, grouped by
 * provider. Maintenance rails can be seen but not switched on.
 */
export function buildRailGroups(
  catalog: readonly CatalogRail[],
  onboarded: readonly OnboardedProvider[],
  clientRails: readonly ClientRailRow[]
): RailGroup[] {
  const codes = new Set(onboarded.map((provider) => provider.code.toLowerCase()));
  const groups = new Map<string, RailGroup>();

  for (const rail of catalog) {
    if (!codes.has(rail.providerCode.toLowerCase())) continue;
    // #411: dead/inactive providers, inactive rails and alias rails are never offered.
    if (
      !isSelectableProvider({ code: rail.providerCode, is_active: rail.providerActive ?? true })
    ) {
      continue;
    }
    if (rail.railActive === false) continue;
    if (!isCanonicalRail({ code: rail.railCode, canonical_code: rail.railCanonicalCode })) continue;
    const existing = clientRails.find(
      (row) => row.providerId === rail.providerId && row.railId === rail.railId
    );
    const maintenance = isMaintenanceRail(rail.railCode);
    const enabled = existing?.isActive === true;
    const servedByOtherProvider = clientRails.some(
      (row) => row.isActive && row.railId === rail.railId && row.providerId !== rail.providerId
    );
    const entry: RailEntry = {
      ...rail,
      enabled,
      clientRailId: existing?.id ?? null,
      maintenance,
      canEnable: !maintenance && !servedByOtherProvider,
      canDisable: enabled,
      servedByOtherProvider,
    };
    const group = groups.get(rail.providerId) ?? {
      providerId: rail.providerId,
      providerCode: rail.providerCode,
      providerName: rail.providerName,
      rails: [],
    };
    group.rails.push(entry);
    groups.set(rail.providerId, group);
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      rails: [...group.rails].sort((a, b) => a.railName.localeCompare(b.railName)),
    }))
    .sort((a, b) => a.providerName.localeCompare(b.providerName));
}
