/**
 * Select options for the catalog-backed fields (provider, rail, currency).
 *
 * The catalog queries (`adminLoopay_listProviders` / `listPaymentRails`) are
 * PLATFORM_ADMIN-only on the backend, so OPS_* staff cannot load them. Every
 * helper therefore falls back to a static list instead of leaving the field
 * as free text: ops always pick from known values, never type a code.
 */

export interface SelectOption {
  value: string;
  label: string;
  /** Settlement currency, present on rail options (used to prefill the currency). */
  currency?: string;
}

interface CatalogProvider {
  code: string;
  name: string;
  is_active: boolean;
}

interface CatalogRail {
  code: string;
  name: string;
  currency: string;
  is_active: boolean;
  /** #411: code of the rail this one duplicates; null or equal to code when canonical. */
  canonical_code?: string | null;
}

/**
 * Supported providers, offered ONLY when the catalog query failed. Decommissioned
 * providers must never appear here; rails have no fallback on purpose (stale
 * rails are worse than an explicit "could not load" message).
 */
export const FALLBACK_PROVIDER_OPTIONS: readonly SelectOption[] = [
  { value: 'kirafin', label: 'KiraFin (kirafin)' },
  { value: 'mesta', label: 'Mesta (mesta)' },
];

/** Stablecoins a client wallet can default to. */
export const WALLET_CURRENCY_OPTIONS: readonly SelectOption[] = [
  { value: 'usdc', label: 'usdc' },
  { value: 'usdt', label: 'usdt' },
];

const FALLBACK_CURRENCIES = ['BRL', 'COP', 'EUR', 'GBP', 'MXN', 'PEN', 'USD', 'USDC', 'USDT'];

const byLabel = (a: SelectOption, b: SelectOption) => a.label.localeCompare(b.label);

/**
 * Providers removed from the platform: never offered in a select, whatever the
 * catalog says (mirrors the backend `DEAD_PROVIDER_CODES`, #411, plus prometeo).
 */
export const DECOMMISSIONED_PROVIDER_CODES: readonly string[] = [
  'aiprise',
  'bridge',
  'jube',
  'loopayx',
  'lumx',
  'persona',
  'prometeo',
];

/** #411: a provider can be picked only when active and not decommissioned. */
export function isSelectableProvider(provider: { code: string; is_active: boolean }): boolean {
  return (
    provider.is_active &&
    !DECOMMISSIONED_PROVIDER_CODES.includes(provider.code.trim().toLowerCase())
  );
}

/**
 * #411: a rail whose `canonical_code` differs from its code is an alias of
 * another rail (us_ach, ach_wire -> ach) and is not offered for selection.
 */
export function isCanonicalRail(rail: { code: string; canonical_code?: string | null }): boolean {
  const canonical = rail.canonical_code?.trim().toLowerCase();

  return !canonical || canonical === rail.code.trim().toLowerCase();
}

export function providerOptionsFromCatalog(
  providers: readonly CatalogProvider[] | null | undefined,
  failed = false
): readonly SelectOption[] {
  if (!providers) return failed ? FALLBACK_PROVIDER_OPTIONS : [];

  return providers
    .filter(isSelectableProvider)
    .map((p) => ({ value: p.code, label: `${p.name} (${p.code})` }))
    .sort(byLabel);
}

export function railOptionsFromCatalog(
  rails: readonly CatalogRail[] | null | undefined
): readonly SelectOption[] {
  return (rails ?? [])
    .filter((r) => r.is_active && isCanonicalRail(r))
    .map((r) => ({
      value: r.code,
      label: `${r.name} (${r.code}) · ${r.currency}`,
      currency: r.currency,
    }))
    .sort((a, b) => a.value.localeCompare(b.value));
}

export function currencyOptionsFromRails(
  rails: readonly CatalogRail[] | null | undefined,
  failed = false
): readonly SelectOption[] {
  const codes = rails
    ? rails.filter((r) => r.is_active).map((r) => r.currency)
    : failed
      ? FALLBACK_CURRENCIES
      : [];

  return [...new Set(codes)].sort().map((code) => ({ value: code, label: code }));
}

/** Keeps a stored value that is not in the catalog selectable (legacy data). */
export function withCurrentValue(
  options: readonly SelectOption[],
  current: string
): readonly SelectOption[] {
  const value = current.trim();

  if (!value || options.some((o) => o.value === value)) return options;

  return [...options, { value, label: value }];
}
