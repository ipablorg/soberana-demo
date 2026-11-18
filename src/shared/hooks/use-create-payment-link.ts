import { useGraphQLMutation } from '@/shared/hooks/use-graphql-mutation';
import { TransactionsCreatePaymentLink } from '@/graphql/mutations/soberana/transactions-create-payment-link.mutation';

export function useCreatePaymentLink() {
  return useGraphQLMutation(TransactionsCreatePaymentLink as any);
}
