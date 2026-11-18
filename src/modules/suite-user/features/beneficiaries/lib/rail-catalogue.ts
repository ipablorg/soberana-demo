/**
 * Country -> rail catalogue (Phase 8 S3), pure logic.
 *
 * The back returns one tree: country -> rails -> provider availability per
 * direction. The client app only needs two slices of it: where it can SEND
 * money (OUTBOUND) and where it can RECEIVE it (INBOUND). This module owns the
 * send slice and the rail -> form-family mapping; the receive slice lives in
 * `features/receive/lib/receive-options.ts`.
 */

import { ISO2_TO_ISO3 } from '@/shared/lib/kyc/static-catalog';

export type RailDirection = 'INBOUND' | 'OUTBOUND';

export interface CatalogueProvider {
  code: string;
  directions: string[];
  available: boolean;
}

export interface CatalogueRail {
  code: string;
  name: string;
  currency: string;
  directions: string[];
  beneficiary_supported: boolean;
  providers: CatalogueProvider[];
}

export interface CatalogueCountry {
  /** ISO 3166-1 alpha-2. */
  country: string;
  rails: CatalogueRail[];
}

export interface RailCatalogue {
  countries: CatalogueCountry[];
}

/** One field-set component per family (see `components/rail-fields`). */
export type RailFamily = 'us-bank' | 'swift' | 'co-ach' | 'spei' | 'pix' | 'sepa' | 'uk';

const RAIL_FAMILIES: Record<string, RailFamily> = {
  ach: 'us-bank',
  wire: 'us-bank',
  swift: 'swift',
  co_ach: 'co-ach',
  spei: 'spei',
  pix: 'pix',
  sepa: 'sepa',
  faster_payments: 'uk',
};

export function railFamily(railCode: string | null | undefined): RailFamily | null {
  if (!railCode) return null;
  return RAIL_FAMILIES[railCode.trim().toLowerCase()] ?? null;
}

/** A rail we can create a beneficiary on and pay out through right now. */
function isPayoutRail(rail: CatalogueRail): boolean {
  return (
    rail.beneficiary_supported &&
    rail.providers.some((p) => p.available && p.directions.includes('OUTBOUND'))
  );
}

/** Countries the owner named first; the rest follow alphabetically by name. */
const PRIORITY_COUNTRIES = ['CO', 'EC', 'US', 'MX', 'BR'];

export function countryLabel(iso2: string, locale = 'es'): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(iso2.toUpperCase()) ?? iso2;
  } catch {
    return iso2;
  }
}

export function compareCountries(a: string, b: string): number {
  const ia = PRIORITY_COUNTRIES.indexOf(a);
  const ib = PRIORITY_COUNTRIES.indexOf(b);
  if (ia !== -1 || ib !== -1) {
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  }
  return countryLabel(a).localeCompare(countryLabel(b), 'es');
}

export function payoutCountries(
  catalogue: RailCatalogue | null | undefined,
): Array<{ country: string; rails: CatalogueRail[] }> {
  if (!catalogue) return [];
  return catalogue.countries
    .map((c) => ({ country: c.country.toUpperCase(), rails: c.rails.filter(isPayoutRail) }))
    .filter((c) => c.rails.length > 0)
    .sort((a, b) => compareCountries(a.country, b.country));
}

export function payoutRails(
  catalogue: RailCatalogue | null | undefined,
  country: string | null | undefined,
): CatalogueRail[] {
  if (!catalogue || !country) return [];
  const wanted = country.toUpperCase();
  const entry = catalogue.countries.find((c) => c.country.toUpperCase() === wanted);
  return entry ? entry.rails.filter(isPayoutRail) : [];
}

/**
 * The beneficiary API takes ISO 3166-1 alpha-3 while the catalogue speaks
 * alpha-2. The KYC catalogue covers the Americas; the SEPA zone is listed here.
 */
const EXTRA_ISO2_TO_ISO3: Record<string, string> = {
  US: 'USA', GB: 'GBR', CO: 'COL', MX: 'MEX', BR: 'BRA', EC: 'ECU', PE: 'PER', CL: 'CHL',
  AD: 'AND', AT: 'AUT', BE: 'BEL', BG: 'BGR', HR: 'HRV', CY: 'CYP', CZ: 'CZE', DK: 'DNK',
  EE: 'EST', FI: 'FIN', FR: 'FRA', DE: 'DEU', GR: 'GRC', HU: 'HUN', IS: 'ISL', IE: 'IRL',
  IT: 'ITA', LV: 'LVA', LI: 'LIE', LT: 'LTU', LU: 'LUX', MT: 'MLT', MC: 'MCO', NL: 'NLD',
  NO: 'NOR', PL: 'POL', PT: 'PRT', RO: 'ROU', SM: 'SMR', SK: 'SVK', SI: 'SVN', ES: 'ESP',
  SE: 'SWE', CH: 'CHE', VA: 'VAT', AL: 'ALB', MD: 'MDA', ME: 'MNE', MK: 'MKD', RS: 'SRB',
};

export function toIso3(iso2: string | null | undefined): string | undefined {
  if (!iso2) return undefined;
  const key = iso2.trim().toUpperCase();
  return EXTRA_ISO2_TO_ISO3[key] ?? ISO2_TO_ISO3[key];
}
