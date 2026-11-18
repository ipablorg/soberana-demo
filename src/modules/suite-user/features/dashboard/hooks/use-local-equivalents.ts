/**
 * useLocalEquivalents
 *
 * Converts a stablecoin balance (USDT/USDC) into a set of local-fiat
 * equivalents using the `quotes_getIndicativeRate` endpoint,
 * one query per currency pair. Queries run in parallel via TanStack's
 * `useQueries`; cached results survive 60s so flipping the VirtualCard
 * back and forth doesn't re-hit the network.
 *
 * Pure helpers (`computeEquivalent`, `formatEquivalent`) are exported
 * for unit tests — the React hook itself is intentionally thin so
 * that the math and formatting are deterministically testable without
 * rendering.
 */

import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { fetchIndicativeRate } from '@/shared/lib/indicative-rate';

interface ExchangeRateResponse {
  /** `null` when the pair has no pricing yet (see `requestIndicativeRate`). */
  quotes_getIndicativeRate: {
    from: string;
    to: string;
    rate: string;
  } | null;
}

export interface LocalEquivalent {
  currency: string;
  rate: number;
  equivalent: number;
  formatted: string;
}

interface UseLocalEquivalentsParams {
  stableBalance: string | undefined;
  stableCurrency: string;
  fiatCurrencies: string[];
}

interface UseLocalEquivalentsResult {
  items: LocalEquivalent[];
  isLoading: boolean;
  isError: boolean;
  updatedAt: number | null;
  refetch: () => void;
}

/**
 * Multiplies a (possibly string, possibly malformed) balance by a rate.
 * Returns 0 for any non-finite input so consumers never render NaN.
 */
export function computeEquivalent(balance: string | undefined, rate: number): number {
  if (!balance) return 0;
  const num = parseFloat(balance);
  if (!Number.isFinite(num)) return 0;
  if (!Number.isFinite(rate) || rate <= 0) return 0;
  return num * rate;
}

/**
 * Localized currency formatter with a graceful fallback. `Intl` throws
 * on unknown ISO codes in some engines; we catch that and return a
 * plain decimal string so the UI stays intact.
 */
export function formatEquivalent(value: number, currency: string): string {
  const fractionDigits = value >= 10_000 ? 0 : 2;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits,
    }).format(value);
  } catch {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  }
}

const COUNTRY_CURRENCY: Record<string, string> = {
  CO: 'COP',
  COL: 'COP',
  MX: 'MXN',
  MEX: 'MXN',
  BR: 'BRL',
  BRA: 'BRL',
  US: 'USD',
  USA: 'USD',
  GB: 'GBP',
  GBR: 'GBP',
  DE: 'EUR',
  DEU: 'EUR',
  ES: 'EUR',
  ESP: 'EUR',
  FR: 'EUR',
  FRA: 'EUR',
  IT: 'EUR',
  ITA: 'EUR',
  PT: 'EUR',
  PRT: 'EUR',
};

/** Currency of a customer's country (ISO2 or ISO3), when we know it. */
export function currencyForCountry(country: string | null | undefined): string | undefined {
  if (!country) return undefined;
  return COUNTRY_CURRENCY[country.trim().toUpperCase()];
}

interface PickDefaultFiatParams {
  fiatCurrencies: string[];
  stored?: string | null;
  localCurrency?: string;
}

/**
 * Default target for the equivalence line: the stored choice, else the
 * customer's local currency, else USD. The first currency of the list is only
 * a last resort: its order is the support list's, not a pricing guarantee.
 */
export function pickDefaultEquivalenceFiat({
  fiatCurrencies,
  stored,
  localCurrency,
}: PickDefaultFiatParams): string {
  if (stored && fiatCurrencies.includes(stored)) return stored;
  if (localCurrency && fiatCurrencies.includes(localCurrency)) return localCurrency;
  if (fiatCurrencies.includes('USD') || fiatCurrencies.length === 0) return 'USD';
  return fiatCurrencies[0];
}

function graphqlErrorCode(error: unknown): string | undefined {
  const errors = (
    error as { response?: { errors?: Array<{ extensions?: { code?: unknown } }> } } | null
  )?.response?.errors;
  const code = errors?.[0]?.extensions?.code;
  return typeof code === 'string' ? code : undefined;
}

/**
 * Retry policy of the rate queries: one retry for transient failures, none for
 * BAD_USER_INPUT (a pair with no pricing yet answers the same every time).
 */
export function shouldRetryRateQuery(failureCount: number, error: unknown): boolean {
  if (graphqlErrorCode(error) === 'BAD_USER_INPUT') return false;
  return failureCount < 1;
}

/**
 * Fetches the indicative rate of one pair through the shared fetcher. A pair
 * the tenant cannot price yet resolves as "no equivalence" (`null` rate) and
 * is asked only once per session; concurrent callers of a pair share one
 * request. Other failures still throw.
 */
export function requestIndicativeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<ExchangeRateResponse> {
  return fetchIndicativeRate(fromCurrency, toCurrency) as Promise<ExchangeRateResponse>;
}

export function useLocalEquivalents(params: UseLocalEquivalentsParams): UseLocalEquivalentsResult {
  const { stableBalance, stableCurrency, fiatCurrencies } = params;
  const enabled = !!stableBalance && fiatCurrencies.length > 0;

  const queries = useQueries({
    queries: fiatCurrencies.map((fiat) => ({
      queryKey: ['fx', stableCurrency, fiat],
      queryFn: async () => {
        const requestRate = (fromCurrency: string) => requestIndicativeRate(fromCurrency, fiat);

        try {
          const result = await requestRate(stableCurrency);
          // USD-pivot pairs: an unpriced USDC pair retries through USD.
          if (!result.quotes_getIndicativeRate && stableCurrency === 'USDC') {
            return requestRate('USD');
          }
          return result;
        } catch {
          // Bridge docs currently expose USD-pivot pairs. If the wallet
          // holds USDC, fallback to USD to avoid silently dropping rows.
          if (stableCurrency === 'USDC') {
            return requestRate('USD');
          }
          throw new Error('Failed to fetch exchange rate');
        }
      },
      enabled,
      staleTime: 60_000,
      retry: shouldRetryRateQuery,
    })),
  });

  const allFailed = queries.length > 0 && queries.every((q) => q.isError);

  const items = useMemo<LocalEquivalent[]>(() => {
    return queries
      .map((q, idx) => {
        const fiat = fiatCurrencies[idx];
        const rateStr = q.data?.quotes_getIndicativeRate?.rate;
        const rate = rateStr ? Number(rateStr) : 0;
        const equivalent = computeEquivalent(stableBalance, rate);
        return {
          currency: fiat,
          rate,
          equivalent,
          formatted: formatEquivalent(equivalent, fiat),
        };
      })
      .filter((item) => item.rate > 0);
  }, [queries, fiatCurrencies, stableBalance]);

  const isLoading = queries.some((q) => q.isLoading);
  const isError = allFailed;

  const updatedAt = useMemo<number | null>(() => {
    // quotes_getIndicativeRate doesn't return created_at, so we use dataUpdatedAt
    const successTimes = queries
      .map((q) => q.dataUpdatedAt)
      .filter((t) => typeof t === 'number' && t > 0);
    return successTimes.length ? Math.min(...successTimes) : null;
  }, [queries]);

  const refetch = () => {
    queries.forEach((q) => q.refetch());
  };

  return {
    items,
    isLoading,
    isError,
    updatedAt,
    refetch,
  };
}

// ────────────────────────────────────────────────────────────────
// useLocalEquivalent — singular variant
// ────────────────────────────────────────────────────────────────
//
// Same primitive (`quotes_getIndicativeRate`) but resolves a single fiat pair
// instead of N. Added to back the VirtualCard back face's
// dropdown-driven UX (one selected fiat at a time). Lives next to
// the plural hook so they share the same fetcher, same cache
// namespace ("fx"), and the same pure helpers — flipping between
// callers can't drift.

interface UseLocalEquivalentParams {
  stableBalance: string | undefined;
  stableCurrency: string;
  /**
   * Target fiat ISO code (e.g. "COP", "BRL"). When undefined the
   * query is disabled and the hook returns `null` to let consumers
   * render their own placeholder. This keeps the contract
   * referentially honest — no zero-rate poisoning the UI.
   */
  targetFiat: string | undefined;
}

export interface UseLocalEquivalentResult {
  equivalent: LocalEquivalent | null;
  isLoading: boolean;
  isError: boolean;
  updatedAt: number | null;
  refetch: () => void;
}

export function useLocalEquivalent(params: UseLocalEquivalentParams): UseLocalEquivalentResult {
  const { stableBalance, stableCurrency, targetFiat } = params;
  const enabled = !!stableBalance && !!targetFiat;

  const query = useQuery({
    queryKey: ['fx', stableCurrency, targetFiat],
    queryFn: async () => requestIndicativeRate(stableCurrency, targetFiat as string),
    enabled,
    staleTime: 60_000,
    retry: shouldRetryRateQuery,
  });

  const equivalent = useMemo<LocalEquivalent | null>(() => {
    if (!targetFiat) return null;
    const rateStr = query.data?.quotes_getIndicativeRate?.rate;
    const rate = rateStr ? Number(rateStr) : 0;
    if (rate <= 0) return null;
    const value = computeEquivalent(stableBalance, rate);
    return {
      currency: targetFiat,
      rate,
      equivalent: value,
      formatted: formatEquivalent(value, targetFiat),
    };
  }, [query.data, stableBalance, targetFiat]);

  const updatedAt = useMemo<number | null>(() => {
    // quotes_getIndicativeRate doesn't return created_at, so we use dataUpdatedAt
    return query.dataUpdatedAt > 0 ? query.dataUpdatedAt : null;
  }, [query.dataUpdatedAt]);

  return {
    equivalent,
    isLoading: query.isLoading,
    isError: query.isError,
    updatedAt,
    refetch: () => {
      query.refetch();
    },
  };
}
