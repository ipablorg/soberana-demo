import { useQuery } from '@tanstack/react-query';

import { fetchIndicativeRate } from '@/shared/lib/indicative-rate';

type IndicativeRateInput = {
  fromCurrency: string;
  toCurrency: string;
};

type IndicativeRateResult = {
  quotes_getIndicativeRate?: {
    rate?: string | null;
  } | null;
};

/**
 * Fetches the indicative rate of one pair through the shared, deduplicated
 * fetcher: a pair the tenant cannot price yet resolves as "no indicative
 * rate" (no retry, no error state) and is asked once per session. Other
 * failures still throw and keep the global retry.
 */
export function requestIndicativeRate(
  fromCurrency: string,
  toCurrency: string,
): Promise<IndicativeRateResult> {
  return fetchIndicativeRate(fromCurrency, toCurrency);
}

export function useIndicativeRate(input: IndicativeRateInput | null): {
  rate: string | null;
  isLoading: boolean;
} {
  const fromCurrency = input?.fromCurrency ?? '';
  const toCurrency = input?.toCurrency ?? '';
  const enabled = !!fromCurrency && !!toCurrency;

  const query = useQuery({
    queryKey: [
      'quotes',
      'indicative-rate',
      { input: { from_currency: fromCurrency, to_currency: toCurrency } },
    ],
    queryFn: () => requestIndicativeRate(fromCurrency, toCurrency),
    enabled,
    staleTime: 30_000,
  });

  return {
    rate: query.data?.quotes_getIndicativeRate?.rate ?? null,
    isLoading: query.isLoading,
  };
}
