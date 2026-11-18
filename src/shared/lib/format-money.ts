/**
 * Money formatting helpers.
 *
 * Currency-aware number formatting shared across the suite. These
 * helpers were previously local to the (now removed) Loopay X
 * integration under `@/shared/lib/loopayx/format`; they are
 * provider-neutral, so they now live in `src/shared/lib`.
 */

/** ISO-4217 codes with an explicit locale/precision mapping. */
export type FiatCurrency = 'COP' | 'BRL' | 'USD' | 'EUR';

interface FiatLocaleConfig {
  locale: string;
  /** Most COP/BRL amounts are whole pesos/reais; USD/EUR want cents. */
  fractionDigits: number;
}

const FIAT_CONFIG: Record<FiatCurrency, FiatLocaleConfig> = {
  COP: { locale: 'es-CO', fractionDigits: 0 },
  BRL: { locale: 'pt-BR', fractionDigits: 2 },
  USD: { locale: 'en-US', fractionDigits: 2 },
  EUR: { locale: 'es-ES', fractionDigits: 2 },
};

const fiatFormatterCache = new Map<FiatCurrency, Intl.NumberFormat>();

function getFiatFormatter(currency: FiatCurrency): Intl.NumberFormat {
  const cached = fiatFormatterCache.get(currency);
  if (cached) return cached;
  const cfg = FIAT_CONFIG[currency];
  const fmt = new Intl.NumberFormat(cfg.locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: cfg.fractionDigits,
    maximumFractionDigits: cfg.fractionDigits,
  });
  fiatFormatterCache.set(currency, fmt);
  return fmt;
}

const RATE_FORMATTER = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function isFiatCurrency(value: string): value is FiatCurrency {
  return value === 'COP' || value === 'BRL' || value === 'USD' || value === 'EUR';
}

/**
 * Format a fiat amount in the canonical, currency-localized form.
 * Falls back to a generic en-US currency render for unknown ISO codes
 * so the UI never crashes on an unexpected pair.
 */
export function formatFiat(value: number | string, currency: string): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return '—';
  if (isFiatCurrency(currency)) {
    return getFiatFormatter(currency).format(n);
  }
  // Defensive fallback: the backend may add new pairs we haven't
  // mapped yet — render with en-US conventions and the raw ISO code.
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

/** Format an FX rate with two decimals in es-CO conventions. */
export function formatRate(value: number | string): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return '—';
  return RATE_FORMATTER.format(n);
}
