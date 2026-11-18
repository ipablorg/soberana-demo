/**
 * `virtualAccounts_receiveOptions` and `virtualAccounts_request`.
 *
 * A successful request refreshes the options (status flips to requested) and
 * the deposit instructions (an active account shows its bank details).
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { VirtualAccountsRequest } from '@/graphql/mutations/soberana/virtual-accounts-request.mutation';
import { VirtualAccountsReceiveOptions } from '@/graphql/queries/soberana/receive-options.query';
import { graphqlClient } from '@/shared/lib/graphql-client';

import type { ReceiveOption } from '../lib/receive-options';

export const RECEIVE_OPTIONS_QUERY_KEY = ['virtualAccounts', 'receiveOptions'] as const;

export interface RequestVirtualAccountVariables {
  country: string;
  currency: string;
  railCode: string;
}

export interface RequestVirtualAccountResult {
  /** False when an existing request or account was returned (idempotent). */
  created: boolean;
  request: ReceiveOption;
}

export function useReceiveOptions() {
  return useQuery({
    queryKey: RECEIVE_OPTIONS_QUERY_KEY,
    queryFn: async (): Promise<ReceiveOption[]> => {
      const result = await graphqlClient.request(VirtualAccountsReceiveOptions, {});
      return result.virtualAccounts_receiveOptions;
    },
    staleTime: 60_000,
  });
}

export function useRequestVirtualAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RequestVirtualAccountVariables): Promise<RequestVirtualAccountResult> => {
      const result = await graphqlClient.request(VirtualAccountsRequest, { input });
      return result.virtualAccounts_request;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RECEIVE_OPTIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['wallets', 'depositInstructions'] });
    },
  });
}
