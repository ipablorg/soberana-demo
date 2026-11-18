/**
 * useCompanyProducts Hook
 * 
 * Custom hook for fetching company products with their USD-converted balances.
 * Used in the unified accounts view to display all account balances.
 * 
 * @example
 * ```tsx
 * const { products, totalBalanceUsd, isLoading, error } = useCompanyProducts();
 * ```
 */

import { useMemo } from 'react';

export interface CompanyProduct {
  id: number;
  slug: string;
  balanceUsd: number;
  originalCurrency: string;
  exchangeRate: number | null;
  /** Calculated field: formatted product name from slug */
  displayName: string;
  /** Calculated field: type of account (bank/wallet based on currency) */
  type: 'bank' | 'wallet';
}

interface UseCompanyProductsOptions {
  /** Company ID to fetch products for. If null, fetches all products for current user's company */
  companyId?: number | null;
  /** Enable/disable query execution */
  enabled?: boolean;
}

export function useCompanyProducts(_options: UseCompanyProductsOptions = {}) {
  // Return empty/default values
  const isLoading = false;
  const error = null;
  const refetch = () => Promise.resolve();

  // ========================================
  // Data Transformation
  // ========================================

  const products = useMemo<CompanyProduct[]>(() => {
    return [];
  }, []);

  // ========================================
  // Computed Values
  // ========================================

  const totalBalanceUsd = useMemo(() => {
    return products.reduce((sum, product) => sum + product.balanceUsd, 0);
  }, [products]);

  const bankProducts = useMemo(() => {
    return products.filter((p) => p.type === 'bank');
  }, [products]);

  const walletProducts = useMemo(() => {
    return products.filter((p) => p.type === 'wallet');
  }, [products]);

  const bankBalanceUsd = useMemo(() => {
    return bankProducts.reduce((sum, product) => sum + product.balanceUsd, 0);
  }, [bankProducts]);

  const walletBalanceUsd = useMemo(() => {
    return walletProducts.reduce((sum, product) => sum + product.balanceUsd, 0);
  }, [walletProducts]);

  // ========================================
  // Return API
  // ========================================

  return {
    // Raw data
    products,
    bankProducts,
    walletProducts,

    // Aggregated balances
    totalBalanceUsd,
    bankBalanceUsd,
    walletBalanceUsd,

    // States
    isLoading,
    error,
    refetch,
  };
}
