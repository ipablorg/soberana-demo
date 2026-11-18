import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { WalletsGetBalance } from '@/graphql/queries/soberana/wallets-get-balance.query';
import { getWalletCurrencyLabel } from '@/shared/lib/receive-wallet';

const POLLING_INTERVAL_MS = 60000;

export interface BridgeWallet {
  walletId: string;
  customerId: string;
  address: string;
  chain: string;
  currency: string;
  balance: string;
  contractAddress: string;
}

interface WalletBalance {
  wallet_id: string;
  currency: string;
  available_balance: string;
  spendable_balance: string;
  pending_balance: string;
  total_balance: string;
  updated_at: string;
}

interface WalletBalanceResult {
  wallets_getBalance: WalletBalance;
}

function formatBalance(balance: string): string {
  const num = parseFloat(balance);
  if (isNaN(num)) return '0.0000';
  return num.toFixed(4);
}

export function useBridgeWalletBalance(walletId?: string) {
  const query = useGraphQLQuery(
    ['bridge-wallet-balance', walletId ?? ''],
    WalletsGetBalance as any,
    { id: walletId! },
    {
      enabled: !!walletId,
      refetchInterval: POLLING_INTERVAL_MS,
      refetchIntervalInBackground: false,
    }
  );

  const wallet = (query.data as WalletBalanceResult | undefined)?.wallets_getBalance;

  // Create a BridgeWallet compatible object from the GraphQL response
  const bridgeWallet: BridgeWallet | null = wallet ? {
    walletId: wallet.wallet_id,
    customerId: '', // Not returned by GraphQL, but keep interface
    address: '', // Not returned
    chain: '', // Not returned
    currency: wallet.currency,
    balance: wallet.available_balance, // using available_balance as the main balance
    contractAddress: '',
  } : null;

  return {
    wallet: bridgeWallet,
    balance: wallet ? formatBalance(wallet.available_balance) : null,
    currency: getWalletCurrencyLabel(wallet?.currency) ?? '—',
    chain: null,
    address: null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
