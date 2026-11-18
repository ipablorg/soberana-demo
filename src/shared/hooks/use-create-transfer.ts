import { useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '@/shared/lib/graphql-client';
import { TransactionsCreateTransfer } from '@/graphql/mutations/soberana/transactions-create-transfer.mutation';
import { normalizeDirectTransferContractFields } from '@/shared/lib/crypto-transfer';

export interface CreateCryptoTransferPayload {
  wallet_id: string;
  to_address: string;
  amount: string;
  currency: string;
  chain: string;
  /** MANDATORY idempotency key (see `@/shared/lib/idempotency-key`); reuse it on retries of the same intent. */
  client_reference_id: string;
}

export interface CreateCryptoTransferResponse {
  transaction_id: string;
  status: string;
  message: string;
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();

  return useMutation<CreateCryptoTransferResponse, Error, CreateCryptoTransferPayload>({
    mutationFn: async (payload) => {
      // Never drop or blank-out the key: the back rejects a missing one with 400.
      const clientReferenceId = payload.client_reference_id?.trim();
      if (!clientReferenceId) {
        throw new Error('client_reference_id is required for crypto transfers.');
      }

      const normalized = normalizeDirectTransferContractFields({
        to_address: payload.to_address,
        amount: payload.amount,
        currency: payload.currency,
        chain: payload.chain,
        client_reference_id: payload.client_reference_id,
      });

      const result = await graphqlClient.request(TransactionsCreateTransfer, {
        input: {
          wallet_id: payload.wallet_id,
          to_address: normalized.to_address,
          amount: normalized.amount,
          currency: normalized.currency,
          chain: normalized.chain,
          client_reference_id: clientReferenceId,
        } as never,
      });

      return result.transactions_createTransfer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallets', 'transactions'] });
    },
  });
}
