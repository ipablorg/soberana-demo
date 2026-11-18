/**
 * usePayinsByCompany Hook
 *
 * Hook personalizado para gestionar la lista de payins de una compañía
 * con filtros y paginación server-side
 */

import { PayinsListByCompanyDocument } from '@/graphql/queries/payment';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { setCompanyHeader } from '@/shared/lib/graphql-client';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useCallback, useState } from 'react';
import type {
  OrderDirection,
  PaginationInfo,
  PayinCompanyFilters,
  PayinOrderBy,
  PayinState,
  UsePayinsByCompanyOptions,
  UsePayinsByCompanyResult,
} from '../types';

export function usePayinsByCompany(options: UsePayinsByCompanyOptions): UsePayinsByCompanyResult {
  const { companyId, initialPageSize = 15, enabled = true } = options;

  // Obtener companyId del authStore y establecer el header
  const authState = useAuthStore.getState();
  setCompanyHeader(authState.user?.company_user[0]?.company?.id);

  const [filters, setFilters] = useState<PayinCompanyFilters>({
    searchText: '',
    state: 'all',
    productIds: [],
    orderBy: 'CREATED_AT',
    orderDirection: 'DESC',
    page: 1,
    pageSize: initialPageSize,
  });

  // Transformar filtros para el backend (solo enviar valores definidos)
  const backendFilters = {
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
    ['payins', 'listByCompany', companyId, backendFilters],
    PayinsListByCompanyDocument as any,
    { filters: backendFilters },
    {
      enabled: enabled && companyId > 0,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    }
  );

  const payins = (data as any)?.payin_listByCompanyInCountry?.items ?? [];
  const totalCount = (data as any)?.payin_listByCompanyInCountry?.total ?? 0;
  const totalPages = (data as any)?.payin_listByCompanyInCountry?.totalPages ?? 0;
  const hasMore = (data as any)?.payin_listByCompanyInCountry?.hasMore ?? false;

  // Acciones de filtrado (memoizadas)
  const setSearch = useCallback((searchText: string) => {
    setFilters((prev) => ({ ...prev, searchText, page: 1 }));
  }, []);

  const setStateFilter = useCallback((state: PayinState | 'all') => {
    setFilters((prev) => ({ ...prev, state, page: 1 }));
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

  const setOrderBy = useCallback((orderBy: PayinOrderBy) => {
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
    payins,
    totalCount,
    isLoading,
    isFetching,
    error: error as Error | null,
    pagination,
    filters,
    setSearch,
    setStateFilter,
    setProductFilter,
    setDateRange,
    setOrderBy,
    setOrderDirection,
    setPage,
    setPageSize,
    refetch,
  };
}
