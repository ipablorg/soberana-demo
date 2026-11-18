/**
 * Rails under maintenance until the loopayApp integration lands.
 *
 * Mirrors the backend `MAINTENANCE_RAILS` (phase4-rails.config.ts). The admin
 * rail entity (`AdminPaymentRailEntity`) does not expose `maintenance_notice`,
 * so the backoffice derives the badge from this small shared constant. Keep
 * both lists in sync until the admin entity returns the notice.
 */

export const MAINTENANCE_RAIL_CODES: ReadonlySet<string> = new Set([
  'co_ach',
  'co_breb',
  'ec_bank_transfer',
  'ec_point_of_sale',
  'pe_bank_transfer',
]);

export function isRailUnderMaintenance(code: string | null | undefined): boolean {
  return !!code && MAINTENANCE_RAIL_CODES.has(code.trim().toLowerCase());
}
