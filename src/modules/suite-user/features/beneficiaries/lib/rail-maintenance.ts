/**
 * Rails switched off for the client app ("En mantenimiento").
 *
 * Colombia (co_ach included, Loopay2/SOBERANA#419), Ecuador and Peru run on
 * the LoopayApp provider, which is parked for now. The rails stay visible wherever a client can pick one, but disabled
 * and without a call to action. The backend enforces the same set and answers
 * 422 `RAIL_UNDER_MAINTENANCE` if a request slips through.
 */

export const MAINTENANCE_RAILS = [
  'co_ach',
  'co_breb',
  'ec_bank_transfer',
  'ec_point_of_sale',
  'pe_bank_transfer',
] as const;

const MAINTENANCE_SET: ReadonlySet<string> = new Set(MAINTENANCE_RAILS);

export function isRailUnderMaintenance(railCode: string | null | undefined): boolean {
  const code = railCode?.trim().toLowerCase();
  return code ? MAINTENANCE_SET.has(code) : false;
}

/** The domain code the back keeps in `extensions.error_code`, if any. */
export function readServerErrorCode(error: unknown): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as any;
  const ext = err?.extensions ?? err?.response?.errors?.[0]?.extensions;
  if (typeof ext?.error_code === 'string' && ext.error_code) return ext.error_code;
  // Some paths (e.g. 503s) carry the domain code in extensions.code or code.
  if (typeof ext?.code === 'string' && ext.code) return ext.code;
  return typeof err?.code === 'string' && err.code ? err.code : undefined;
}

/** Codes the back answers with when a rail, or payment links as a whole, are parked. */
export function isMaintenanceCode(code: string | undefined): boolean {
  return code === 'RAIL_UNDER_MAINTENANCE' || code === 'PAYMENT_LINKS_UNDER_MAINTENANCE';
}
