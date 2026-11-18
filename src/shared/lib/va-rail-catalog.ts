/**
 * va-rail-catalog
 *
 * Static catalog of the virtual-account receive rails (money-flow v2):
 * display name, currency and flag for each rail the customer can
 * request. The picker and the request-status view read from this
 * catalog so rail presentation never drifts with backend catalog
 * churn — `rails_list` still drives WHICH rows exist, this catalog
 * drives HOW the five core rails are named and flagged (with a
 * graceful fallback for anything outside it).
 */

export interface VaRailCatalogEntry {
  /** Canonical rail code used by customers_addEndorsement. */
  code: string;
  /** Display name (proper noun — not translated). */
  name: string;
  /** ISO-4217 currency the rail settles in. */
  currency: string;
  /** Emoji flag for scannability in chips and headers. */
  flag: string;
  /** Short description of what the rail is. */
  description: string;
}

const CATALOG: VaRailCatalogEntry[] = [
  {
    code: 'sepa',
    name: 'SEPA',
    currency: 'EUR',
    flag: '🇪🇺',
    description: 'Transferencias en euros dentro de la zona SEPA.',
  },
  {
    code: 'ach_wire',
    name: 'ACH / Wire',
    currency: 'USD',
    flag: '🇺🇸',
    description: 'Transferencias en dólares dentro de Estados Unidos.',
  },
  {
    code: 'faster_payments',
    name: 'Faster Payments',
    currency: 'GBP',
    flag: '🇬🇧',
    description: 'Transferencias en libras dentro del Reino Unido.',
  },
  {
    code: 'spei',
    name: 'SPEI',
    currency: 'MXN',
    flag: '🇲🇽',
    description: 'Transferencias en pesos mexicanos vía SPEI.',
  },
  {
    code: 'pix',
    name: 'PIX',
    currency: 'BRL',
    flag: '🇧🇷',
    description: 'Transferencias en reales vía PIX.',
  },
];

/**
 * Backend/legacy rail codes that resolve to the same catalog entry.
 * `ach` + `wire` are the split halves of `ach_wire`; `iban` rides the
 * SEPA rail; `br_ted` is an alias of pix.
 */
const RAIL_ALIASES: Record<string, string> = {
  ach: 'ach_wire',
  wire: 'ach_wire',
  us_ach: 'ach_wire',
  us_wire: 'ach_wire',
  iban: 'sepa',
  br_ted: 'pix',
};

function normalize(code: string): string {
  return code.trim().toLowerCase();
}

export function getVaRailCatalog(): VaRailCatalogEntry[] {
  return CATALOG;
}

export function getVaRailCatalogEntry(
  railCode: string | null | undefined,
): VaRailCatalogEntry | null {
  if (!railCode) return null;

  const normalized = normalize(railCode);
  const canonical = RAIL_ALIASES[normalized] ?? normalized;

  return CATALOG.find((entry) => entry.code === canonical) ?? null;
}

/** Display name for a rail: catalog name, or a prettified code fallback. */
export function getVaRailDisplayName(railCode: string | null | undefined): string | null {
  const entry = getVaRailCatalogEntry(railCode);
  if (entry) return entry.name;

  const trimmed = railCode?.trim();
  if (!trimmed) return null;

  return trimmed
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
