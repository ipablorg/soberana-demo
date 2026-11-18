import { useMemo } from 'react';

import { TransactionsPaymentLinkCapabilities } from '@/graphql/queries/soberana/transactions-payment-link-capabilities.query';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';

interface PaymentLinkCapabilitiesResult {
  transactions_paymentLinkCapabilities?: {
    payment_link_rails?: string[] | null;
    supported_payment_methods?: string[] | null;
  };
}

export function usePaymentLinkCapabilities() {
  const query = useGraphQLQuery(
    ['transactions', 'paymentLinkCapabilities'],
    TransactionsPaymentLinkCapabilities,
  );

  const paymentLinkRails = useMemo(() => {
    const methods =
      (query.data as PaymentLinkCapabilitiesResult | undefined)
        ?.transactions_paymentLinkCapabilities?.payment_link_rails ??
      (query.data as PaymentLinkCapabilitiesResult | undefined)
        ?.transactions_paymentLinkCapabilities?.supported_payment_methods ?? [];

    return new Set(methods.map((method) => method.toLowerCase()));
  }, [query.data]);

  return {
    paymentLinkRails,
    isLoading: query.isLoading,
    error: query.error,
  };
}
