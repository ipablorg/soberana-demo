/**
 * Single fetcher of `quotes_getIndicativeRate` for every caller (dashboard
 * equivalents, card back face, send review): one network request per pair.
 *
 * - Concurrent callers of the same pair share the in-flight request, whatever
 *   their TanStack query key is.
 * - A pair the tenant cannot price yet ("Pricing for USDT/COP is not available
 *   yet", BAD_USER_INPUT) answers the same on every call, so it resolves as a
 *   `null` rate and that `null` is cached for the session (no repeated errors).
 * - Priced pairs are not cached here (TanStack keeps them fresh); transient
 *   failures are never cached so callers can retry.
 */

import { QuotesGetIndicativeRate } from '@/graphql/queries/soberana/quotes-get-indicative-rate.query';
import { graphqlClient } from '@/shared/lib/graphql-client';

export interface IndicativeRatePayload {
  quotes_getIndicativeRate: {
    from?: string;
    to?: string;
    rate?: string | null;
  } | null;
}

const UNPRICED: IndicativeRatePayload = { quotes_getIndicativeRate: null };

const unpricedPairs = new Set<string>();
const inFlight = new Map<string, Promise<IndicativeRatePayload>>();

function graphqlErrorCode(error: unknown): string | undefined {
  const errors = (
    error as { response?: { errors?: Array<{ extensions?: { code?: unknown } }> } } | null
  )?.response?.errors;
  const code = errors?.[0]?.extensions?.code;
  return typeof code === 'string' ? code : undefined;
}

const pairKey = (from: string, to: string) => `${from.toUpperCase()}/${to.toUpperCase()}`;

export function fetchIndicativeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<IndicativeRatePayload> {
  const key = pairKey(fromCurrency, toCurrency);
  if (unpricedPairs.has(key)) return Promise.resolve(UNPRICED);

  const pending = inFlight.get(key);
  if (pending) return pending;

  const request = graphqlClient
    .request<IndicativeRatePayload>(QuotesGetIndicativeRate as never, {
      input: { from_currency: fromCurrency, to_currency: toCurrency },
    })
    .catch((error: unknown) => {
      if (graphqlErrorCode(error) === 'BAD_USER_INPUT') {
        unpricedPairs.add(key);
        return UNPRICED;
      }
      throw error;
    })
    .finally(() => inFlight.delete(key));

  inFlight.set(key, request);
  return request;
}

/** Test seam: forget the session cache. */
export function resetIndicativeRateCache(): void {
  unpricedPairs.clear();
  inFlight.clear();
}
