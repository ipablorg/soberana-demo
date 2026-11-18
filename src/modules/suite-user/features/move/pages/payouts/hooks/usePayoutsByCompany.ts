/**
 * usePayoutsByCompany Hook
 *
 * Hook personalizado para gestionar la lista de payouts de una compañía
 * con filtros y paginación server-side
 */

import { PayoutsListByCompanyDocument } from '@/graphql/queries/payment';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { setCompanyHeader } from '@/shared/lib/graphql-client';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useCallback, useState } from 'react';
import type {
  OrderDirection,
  PaginationInfo,
  PayoutCompanyFilters,
  PayoutOrderBy,
  PayoutState,
  UsePayoutsByCompanyOptions,
  UsePayoutsByCompanyResult,
} from '../types';

export function usePayoutsByCompany(
  options: UsePayoutsByCompanyOptions
): UsePayoutsByCompanyResult {
  const { companyId, initialPageSize = 15, enabled = true } = options;

  // Obtener companyId del authStore y establecer el header
  const authState = useAuthStore.getState();
  setCompanyHeader(authState.user?.company_user[0]?.company?.id);

  const [filters, setFilters] = useState<PayoutCompanyFilters>({
    searchText: '',
    state: 'all',
    bankBaseIds: [],
    productIds: [],
    orderBy: 'CREATED_AT',
    orderDirection: 'DESC',
    page: 1,
    pageSize: initialPageSize,
  });

  // Transformar filtros para el backend (solo enviar valores definidos)
  const backendFilters = {
    bankBaseIds:
      filters.bankBaseIds && filters.bankBaseIds.length > 0 ? filters.bankBaseIds : undefined,
    productIds:
      filters.productIds && filters.productIds.length > 0 ? filters.productIds : undefined,
    state: filters.state !== 'all' ? filters.state : undefined,
    searchText: filters.searchText || undefined,
    createdFrom: filters.createdFrom?.toISOString(),
    createdTo: filters.createdTo?.toISOString(),
    orderBy: filters.orderBy,
    orderDirection: filters.orderDirection,
    page: filters.page,
    pageSize: filters.pageSize,
  };

  const { data, isLoading, isFetching, error, refetch } = useGraphQLQuery(
    ['payouts', 'listByCompany', companyId, backendFilters],
    PayoutsListByCompanyDocument as any,
    { filters: backendFilters },
    {
      enabled: enabled && companyId > 0,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    }
  );

  const payouts = (data as any)?.payout_listByCompanyInCountry?.payouts ?? [];
  const totalCount = (data as any)?.payout_listByCompanyInCountry?.total ?? 0;
  const totalPages = (data as any)?.payout_listByCompanyInCountry?.totalPages ?? 0;
  const hasMore = (data as any)?.payout_listByCompanyInCountry?.hasMore ?? false;

  // Acciones de filtrado (memoizadas)
  const setSearch = useCallback((searchText: string) => {
    setFilters((prev) => ({ ...prev, searchText, page: 1 }));
  }, []);

  const setStateFilter = useCallback((state: PayoutState | 'all') => {
    setFilters((prev) => ({ ...prev, state, page: 1 }));
  }, []);

  const setBankFilter = useCallback((bankIds: number[]) => {
    setFilters((prev) => ({ ...prev, bankBaseIds: bankIds, page: 1 }));
  }, []);

  const setProductFilter = useCallback((productIds: number[]) => {
    setFilters((prev) => ({ ...prev, productIds, page: 1 }));
  }, []);

  const setDateRange = useCallback((from?: Date, to?: Date) => {
    setFilters((prev) => ({
      ...prev,
      createdFrom: from,
      createdTo: to,
      page: 1,
    }));
  }, []);

  const setOrderBy = useCallback((orderBy: PayoutOrderBy) => {
    setFilters((prev) => ({ ...prev, orderBy, page: 1 }));
  }, []);

  const setOrderDirection = useCallback((direction: OrderDirection) => {
    setFilters((prev) => ({ ...prev, orderDirection: direction, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const pagination: PaginationInfo = {
    currentPage: filters.page ?? 1,
    pageSize: filters.pageSize ?? initialPageSize,
    totalPages,
    hasMore,
  };

  return {
    payouts,
    totalCount,
    isLoading,
    isFetching,
    error: error as Error | null,
    pagination,
    filters,
    setSearch,
    setStateFilter,
    setBankFilter,
    setProductFilter,
    setDateRange,
    setOrderBy,
    setOrderDirection,
    setPage,
    setPageSize,
    refetch,
  };
}
