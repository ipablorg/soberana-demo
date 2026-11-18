/**
 * usePayins Hook
 *
 * Hook personalizado para gestionar la lista de payins con filtros y paginación server-side
 */

import { useState, useCallback } from 'react';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { PayInsListByCountryDocument } from '@/graphql/queries/collection/payins-list';
import { PayinGetVoucherDownloadUrlDocument } from '@/graphql/queries/collection/payin-get-voucher-download-url';
import { useCountryStore } from '@/shared/stores/useCountryStore';
import type { PayinFilters, UsePayinsOptions, PaginationInfo } from '../types';
import type { PayinFiltersInput, StatePayIn, PayInType } from '@/graphql/generated/graphql';

export function usePayins(options: UsePayinsOptions = {}) {
  const { selectedCountry, countries } = useCountryStore();
  const countryId: number = countries.find((c) => c.isoCode === selectedCountry)?.id!;

  const [filters, setFilters] = useState<PayinFilters>({
    searchTerm: '',
    state: 'all',
    companyIds: [],
    typeFilter: 'all',
    dateRange: undefined,
    orderBy: 'CREATED_AT',
    orderDirection: 'DESC',
    page: 1,
    pageSize: options.pageSize || 10,
  });

  // Transformar filtros frontend a formato backend
  const backendFilters: PayinFiltersInput = {
    countryId,
    searchText: filters.searchTerm || undefined,
    state: filters.state !== 'all' ? (filters.state as StatePayIn) : undefined,
    companyIds: filters.companyIds.length > 0 ? filters.companyIds : undefined,
    payInGetWay: filters.typeFilter !== 'all' ? (filters.typeFilter as PayInType) : undefined,
    createdFrom: filters.dateRange?.from.toISOString() ?? undefined,
    createdTo: filters.dateRange?.to.toISOString() ?? undefined,
    page: filters.page,
    pageSize: filters.pageSize,
  };

  const { data, isLoading, isFetching, error, refetch } = useGraphQLQuery(
    ['payins', 'list', countryId, backendFilters],
    PayInsListByCountryDocument,
    { filters: backendFilters },
    {
      enabled: countryId > 0,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    }
  );

  const payins = data?.payin_listByCountry.items || [];

  const totalCount = data?.payin_listByCountry.total ?? 0;
  const totalPages = data?.payin_listByCountry.totalPages ?? 0;
  const hasMore = filters.page * filters.pageSize < totalCount;

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

  const setTypeFilter = useCallback((typeFilter: string) => {
    setFilters((prev) => ({ ...prev, typeFilter, page: 1 }));
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

  const setPageSize = useCallback((pageSize: 10 | 15 | 25 | 50) => {
    setFilters((prev) => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const pagination: PaginationInfo = {
    currentPage: filters.page,
    pageSize: filters.pageSize,
    totalPages,
    hasMore,
  };

  return {
    payins,
    totalCount,
    isLoading,
    isFetching,
    error,
    pagination,
    filters,
    setSearch,
    setStateFilter,
    setCompanyFilter,
    setTypeFilter,
    setDateRange,
    setPage,
    setPageSize,
    refetch,
  };
}

/**
 * Hook para descargar el voucher de un payin
 */
export function usePayinVoucherDownload() {
  const [payinId, setPayinId] = useState<number | null>(null);

  const { data, isLoading, error, refetch } = useGraphQLQuery(
    ['payin', 'voucher', payinId],
    PayinGetVoucherDownloadUrlDocument,
    { payinId: payinId! },
    {
      enabled: payinId !== null,
      staleTime: 0, // Always fresh
      refetchOnWindowFocus: false,
    }
  );

  const downloadVoucher = useCallback(
    async (id: number) => {
      await setPayinId(id);

      try {
        const result = await refetch();
        const downloadUrl = result.data?.payin_getVoucherDownloadUrl;

        if (downloadUrl) {
          window.open(downloadUrl, '_blank');
        } else {
          throw new Error('No se pudo obtener la URL del comprobante');
        }
      } catch (error) {
        throw error;
      } finally {
        setPayinId(null);
      }
    },
    [refetch]
  );

  return {
    downloadVoucher,
    isLoading,
    error,
    downloadUrl: data?.payin_getVoucherDownloadUrl,
  };
}
