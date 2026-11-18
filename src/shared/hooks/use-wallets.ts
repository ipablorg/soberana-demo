import { useAuth } from '@/shared/hooks/use-auth';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { WalletsListByCustomer } from '@/graphql/queries/soberana/wallets-list-by-customer.query';
import { useTutorialDemoStore } from '@/shared/stores/useTutorialDemoStore';
import {
  DEMO_DEFAULT_WALLET,
  DEMO_WALLET,
} from '@/shared/lib/tutorial-demo-data';

export interface DefaultWallet {
  currency: string;
  chain: string;
}

interface Wallet {
  id: string;
  customer_id: string;
  currency: string;
  chain: string;
  status: string;
  alias: string | null;
  address: string | null;
  created_at: string;
}

interface WalletsListResult {
  wallets_listByCustomer: {
    data: Wallet[];
    default_wallet?: DefaultWallet | null;
    has_more: boolean;
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export function useWallets() {
  const isDemoMode = useTutorialDemoStore((s) => s.isDemoMode);
  const { user } = useAuth();
  const customerId = user?.customer_profile_id;

  const query = useGraphQLQuery(
    ['wallets', 'list', customerId],
    WalletsListByCustomer as any,
    { customerId: customerId! },
    {
      enabled: !!customerId && !isDemoMode,
      staleTime: 30_000,
    }
  );

  if (isDemoMode) {
    return {
      wallets: [DEMO_WALLET],
      defaultWallet: DEMO_DEFAULT_WALLET,
      pagination: null,
      isLoading: false,
      error: null,
      refetch: query.refetch,
    };
  }

  const result = (query.data as WalletsListResult | undefined)?.wallets_listByCustomer;

  return {
    wallets: result?.data ?? [],
    defaultWallet: result?.default_wallet ?? null,
    pagination: result ? {
      hasMore: result.has_more,
      page: result.page,
      pageSize: result.page_size,
      total: result.total,
      totalPages: result.total_pages,
    } : null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
