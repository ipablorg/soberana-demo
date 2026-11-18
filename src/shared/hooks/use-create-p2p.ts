import { useQueryClient } from '@tanstack/react-query';
import { useGraphQLMutation } from '@/shared/hooks/use-graphql-mutation';
import { TransactionsCreateP2P } from '@/graphql/mutations/soberana/transactions-create-p2p.mutation';

/**
 * `client_reference_id` is MANDATORY (back answers 400 IDEMPOTENCY_KEY_REQUIRED
 * without it). Build it with `useConfirmIntentKey` from `@/shared/lib/idempotency-key`
 * and reuse it on every retry of the same intent.
 */
export interface CreateP2PVariables {
  input: {
    source_wallet_id: string;
    destination_wallet_id: string;
    currency: string;
    amount: string;
    client_reference_id: string;
  };
}

export interface CreateP2PResult {
  transactions_createP2P: { transaction_id: string; status: string; message: string };
}

export function useCreateP2P() {
  const queryClient = useQueryClient();

  return useGraphQLMutation<CreateP2PResult, CreateP2PVariables>(TransactionsCreateP2P as any, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallets', 'transactions'] });
    },
  });
}
