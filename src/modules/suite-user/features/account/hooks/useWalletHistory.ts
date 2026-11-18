/**
 * useWalletHistory Hook
 * 
 * Fetches wallet transaction history from Bridge API.
 * GET /api/bridge/wallets/:walletId/history
 */

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/stores/auth-store';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

// Default wallet ID (same as useBridgeWalletBalance)
const DEFAULT_WALLET_ID = '7cb3e901-f6a2-4cde-bbe1-bf8b398d6d2b';

/**
 * Source/Destination details
 */
export interface TransferEndpoint {
  payment_rail?: string;
  currency?: string;
  address?: string;
  external_account_id?: string | null;
  payment_scheme?: string;
  to_address?: string;
  from_address?: string;
}

/**
 * Transaction history item from Bridge API
 */
export interface WalletHistoryItem {
  amount: string;
  developerFee: string;
  customerId: string;
  source: TransferEndpoint;
  destination: TransferEndpoint;
  createdAt: string;
  updatedAt: string;
}

/**
 * Wallet history response from Bridge API
 */
export interface WalletHistoryResponse {
  count: number;
  data: WalletHistoryItem[];
}

/**
 * Fetch wallet history from Bridge API
 */
async function fetchWalletHistory(
  walletId: string,
  token: string,
  limit: number = 20
): Promise<WalletHistoryResponse> {
  const response = await fetch(
    `${API_BASE}/api/bridge/wallets/${walletId}/history?limit=${limit}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Hook to get wallet transaction history
 * 
 * @param walletId - Optional wallet ID, defaults to the main wallet
 * @param limit - Number of transactions to fetch (default: 20)
 * @param enabled - Whether the query should run (default: true)
 * 
 * @example
 * ```tsx
 * const { history, isLoading, error } = useWalletHistory();
 * 
 * // Or with custom wallet ID
 * const { history } = useWalletHistory('custom-wallet-id', 50);
 * ```
 */
export function useWalletHistory(
  walletId: string = DEFAULT_WALLET_ID,
  limit: number = 20,
  enabled: boolean = true
) {
  const token = useAuthStore((state) => state.token);

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['wallet-history', walletId, limit],
    queryFn: () => fetchWalletHistory(walletId, token!, limit),
    enabled: enabled && !!token && !!walletId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 2,
  });

  return {
    history: data?.data || [],
    count: data?.count || 0,
    isLoading,
    isFetching,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
