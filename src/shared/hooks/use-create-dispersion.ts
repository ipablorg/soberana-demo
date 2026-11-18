/**
 * useCreateDispersion
 *
 * Fires `transactions_createDispersion` — the money-flow v2 send
 * submission. The backend debits the wallet and creates the ops-vault
 * transfer synchronously; the dispersion remains PENDING until
 * operations completes the payout, so callers must render the success
 * frame as "in process", never as settled.
 *
 * Cache: same keys the off-ramp hook invalidates — wallet balance
 * (the debit is immediate) and wallet transactions (the PENDING
 * WITHDRAWAL row appears instantly).
 */

import { useQueryClient } from '@tanstack/react-query';
import { useGraphQLMutation } from '@/shared/hooks/use-graphql-mutation';
import { CreateDispersion } from '@/graphql/mutations/soberana/transactions-create-dispersion.mutation';

export function useCreateDispersion() {
  const queryClient = useQueryClient();

  return useGraphQLMutation(CreateDispersion, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallets', 'transactions'] });
    },
  });
}
