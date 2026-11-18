import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { WalletsGetBalance } from '@/graphql/queries/soberana/wallets-get-balance.query';
import { useTutorialDemoStore } from '@/shared/stores/useTutorialDemoStore';
import { DEMO_BALANCE } from '@/shared/lib/tutorial-demo-data';

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

export function useWalletBalance(walletId: string | undefined) {
  const isDemoMode = useTutorialDemoStore((s) => s.isDemoMode);

  const query = useGraphQLQuery(
    ['wallets', 'balance', walletId],
    WalletsGetBalance as any,
    { id: walletId! },
    {
      enabled: !!walletId && !isDemoMode,
      refetchInterval: 60_000,
      refetchIntervalInBackground: false,
    }
  );

  if (isDemoMode) {
    return { balance: DEMO_BALANCE, isLoading: false, error: null };
  }

  return {
    balance: (query.data as WalletBalanceResult | undefined)?.wallets_getBalance ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
}
