import { useQueryClient } from '@tanstack/react-query';
import { useGraphQLMutation } from '@/shared/hooks/use-graphql-mutation';
import { CreateOffRamp } from '@/graphql/mutations/soberana/create-offramp.mutation';

/**
 * `client_reference_id` is MANDATORY (back answers 400 IDEMPOTENCY_KEY_REQUIRED
 * without it). Build it with `useConfirmIntentKey` from `@/shared/lib/idempotency-key`
 * and reuse it on every retry of the same intent.
 */
export interface CreateOffRampVariables {
  input: {
    wallet_id: string;
    beneficiary_id: string;
    currency: string;
    amount: string;
    quote_id?: string | null;
    client_reference_id: string;
  };
}

export interface CreateOffRampResult {
  transactions_createOffRamp: { transaction_id: string; status: string; message: string };
}

export function useCreateOffRamp() {
  const queryClient = useQueryClient();

  return useGraphQLMutation<CreateOffRampResult, CreateOffRampVariables>(CreateOffRamp as any, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallets', 'transactions'] });
    },
  });
}
