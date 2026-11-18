import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { WalletsTransactions } from '@/graphql/queries/soberana/wallets-transactions.query';

interface WalletTransactionFilters {
  page?: number;
  page_size?: number;
  type?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

interface WalletsTransactionsResult {
  wallets_transactions: {
    transactions: unknown[];
    has_more: boolean;
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export function useWalletTransactions(walletId: string | undefined, filters?: WalletTransactionFilters) {
  const query = useGraphQLQuery(
    ['wallets', 'transactions', walletId, filters],
    WalletsTransactions as any,
    { id: walletId!, filters },
    {
      enabled: !!walletId,
    }
  );

  const data = (query.data as WalletsTransactionsResult | undefined)?.wallets_transactions;

  return {
    transactions: data?.transactions ?? [],
    pagination: data ? {
      hasMore: data.has_more,
      page: data.page,
      pageSize: data.page_size,
      total: data.total,
      totalPages: data.total_pages,
    } : null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
