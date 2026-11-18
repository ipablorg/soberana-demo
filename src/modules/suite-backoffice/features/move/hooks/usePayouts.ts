/**
 * usePayouts Hook
 *
 * Hook personalizado para gestionar la lista de payouts con filtros y paginación server-side
 */

import { useState, useCallback } from 'react';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { PayoutsListByCountryDocument } from '@/graphql/queries/payment';
import { useCountryStore } from '@/shared/stores/useCountryStore';
import { adaptPayouts } from '../api/payouts-adapter';
import type { PayoutFilters, UsePayoutsOptions, PaginationInfo } from '../types';
import type {
  PayoutFiltersInput,
  StatePayout,
  PayoutOrderBy,
  OrderDirection,
} from '@/graphql/generated/graphql';

export function usePayouts(options: UsePayoutsOptions = {}) {
  const { selectedCountry, countries } = useCountryStore();
  const countryId: number = countries.find((c) => c.isoCode === selectedCountry)?.id!;

  const [filters, setFilters] = useState<PayoutFilters>({
    searchTerm: '',
    state: 'all',
    companyIds: [],
    bankIds: [],
    productIds: [],
    dateRange: undefined,
    orderBy: 'CREATED_AT',
    orderDirection: 'DESC',
    page: 1,
    pageSize: options.pageSize || 15,
  });

  // Transformar filtros frontend a formato backend
  const backendFilters: PayoutFiltersInput = {
    countryId,
    searchText: filters.searchTerm || undefined,
    state: filters.state !== 'all' ? (filters.state as StatePayout) : undefined,
    companyIds: filters.companyIds.length > 0 ? filters.companyIds : undefined,
    bankBaseIds: filters.bankIds.length > 0 ? filters.bankIds : undefined,
    productIds: filters.productIds.length > 0 ? filters.productIds : undefined,
    createdFrom: filters.dateRange?.from.toISOString() ?? undefined,
    createdTo: filters.dateRange?.to.toISOString() ?? undefined,
    orderBy: filters.orderBy as PayoutOrderBy,
    orderDirection: filters.orderDirection as OrderDirection,
    page: filters.page,
    pageSize: filters.pageSize,
  };

  const { data, isLoading, isFetching, error, refetch } = useGraphQLQuery(
    ['payouts', 'list', countryId, backendFilters],
    PayoutsListByCountryDocument,
    { filters: backendFilters },
    {
      enabled: countryId > 0,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    }
  );

  const payouts = data?.payout_listByCountry.payouts
    ? adaptPayouts(data.payout_listByCountry.payouts)
    : [];

  const totalCount = data?.payout_listByCountry.total ?? 0;
  const totalPages = data?.payout_listByCountry.totalPages ?? 0;
  const hasMore = data?.payout_listByCountry.hasMore ?? false;

  // Acciones de filtrado (memoizadas)
  const setSearch = useCallback((searchTerm: string) => {
    setFilters((prev) => ({ ...prev, searchTerm, page: 1 }));
  }, []);

  const setStateFilter = useCallback((state: string) => {
    setFilters((prev) => ({ ...prev, state, page: 1 }));
  }, []);

  const setCompanyFilter = useCallback((companyIds: number[]) => {
    setFilters((prev) => ({ ...prev, companyIds, page: 1 }));
  }, []);

  const setBankFilter = useCallback((bankIds: number[]) => {
    setFilters((prev) => ({ ...prev, bankIds, page: 1 }));
  }, []);

  const setProductFilter = useCallback((productIds: number[]) => {
    setFilters((prev) => ({ ...prev, productIds, page: 1 }));
  }, []);

  const setDateRange = useCallback((from?: Date, to?: Date) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: from && to ? { from, to } : undefined,
      page: 1,
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: 15 | 25 | 50) => {
    setFilters((prev) => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const pagination: PaginationInfo = {
    currentPage: filters.page,
    pageSize: filters.pageSize,
    totalPages,
    hasMore,
  };

  return {
    payouts,
    totalCount,
    isLoading,
    isFetching,
    error,
    pagination,
    filters,
    setSearch,
    setStateFilter,
    setCompanyFilter,
    setBankFilter,
    setProductFilter,
    setDateRange,
    setPage,
    setPageSize,
    refetch,
  };
}
