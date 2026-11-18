/**
 * useLiquidationAddresses Hook
 * 
 * Fetches liquidation addresses from Bridge API for the current customer.
 * Uses the Bridge customer ID from virtual accounts.
 */

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useBridgeVirtualAccounts } from '@/modules/suite-user/features/move/pages/payins/hooks/useBridgeVirtualAccounts';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export interface LiquidationAddress {
  liquidationAddressId: string;
  address: string;
  chain: string; // 'base' | 'ethereum' | 'tron' | 'solana'
  currency: string; // 'usdc' | 'usdt'
  destinationCurrency: string; // 'usd' | 'usdc'
  createdAt: string;
  destinationAddress?: string;
}

interface LiquidationAddressesResponse {
  liquidationAddresses: LiquidationAddress[];
  total: number;
  hasMore: boolean;
}

/**
 * Fetch liquidation addresses from Bridge API
 */
async function fetchLiquidationAddresses(
  customerId: string,
  token: string
): Promise<LiquidationAddress[]> {
  const response = await fetch(
    `${API_BASE}/api/bridge/customers/${customerId}/liquidation-addresses`,
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

  const data: LiquidationAddressesResponse = await response.json();
  return data.liquidationAddresses || [];
}

/**
 * Hook to get liquidation addresses for the current Bridge customer
 * 
 * @example
 * ```tsx
 * const { liquidationAddresses, isLoading, error } = useLiquidationAddresses();
 * ```
 */
export function useLiquidationAddresses() {
  // Get auth token
  const token = useAuthStore((state) => state.token);
  
  // Get Bridge customer ID from virtual accounts
  const { virtualAccounts, isLoading: isLoadingVirtualAccounts } = useBridgeVirtualAccounts();
  const bridgeCustomerId = virtualAccounts[0]?.customerId || null;

  // Query liquidation addresses
  const {
    data: liquidationAddresses = [],
    isLoading: isLoadingAddresses,
    error,
    refetch,
  } = useQuery({
    queryKey: ['liquidation-addresses', bridgeCustomerId],
    queryFn: () => fetchLiquidationAddresses(bridgeCustomerId!, token!),
    enabled: !!bridgeCustomerId && !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  return {
    liquidationAddresses,
    bridgeCustomerId,
    isLoading: isLoadingVirtualAccounts || isLoadingAddresses,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
