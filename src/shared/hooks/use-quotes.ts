import { useQueryClient } from '@tanstack/react-query';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { useGraphQLMutation } from '@/shared/hooks/use-graphql-mutation';
import { QuotesGetRate } from '@/graphql/queries/soberana/quotes-get-rate.query';
import { QuotesCreate } from '@/graphql/mutations/soberana/quotes-create.mutation';

interface QuoteRateInput {
  from_currency: string;
  to_currency: string;
  amount: string;
}

interface QuoteRate {
  id: string;
  from_currency: string;
  to_currency: string;
  from_amount: string;
  to_amount: string;
  rate: string;
  fee: string | null;
  expires_at: string | null;
  created_at: string;
}

interface QuotesGetRateResult {
  quotes_getRate: QuoteRate;
}

export function useQuoteRate(input: QuoteRateInput | null) {
  const enabled =
    !!input?.from_currency && !!input?.to_currency && !!input?.amount;

  // useGraphQLQuery appends `variables` to the queryKey internally, so we do
  // not include `input` here to avoid cache-key duplication. When `enabled` is
  // false the queryFn is never invoked, so passing `undefined` as variables is
  // safe even though TVariables is non-empty (document is cast via `as any`).
  const query = useGraphQLQuery(
    ['quotes', 'rate'],
    QuotesGetRate as any,
    enabled ? { input } : (undefined as any),
    {
      enabled,
      staleTime: 30_000,
    }
  );

  return {
    quote: (query.data as QuotesGetRateResult | undefined)?.quotes_getRate ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useGraphQLMutation(QuotesCreate as any, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}
