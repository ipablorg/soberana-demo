/**
 * useTransactions Hook
 * 
 * Hook for fetching and managing Bridge transactions.
 * 
 * ⚠️ MOCK VERSION: Backend pendiente de implementación.
 * Cuando esté listo, descomentar la query real.
 */

import { useState } from 'react';
// TODO: Descomentar cuando backend implemente el resolver
// import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
// import { gql } from 'graphql-request';
import type { Transaction } from '../components/TransactionHistory';

// TODO: Descomentar cuando backend esté listo
// const GetTransactionsDocument = gql`...`;

interface UseTransactionsOptions {
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

/**
 * Transactions Hook (MOCK VERSION)
 * 
 * ⚠️ Usando datos mock hasta que el backend implemente el resolver.
 * 
 * @param options - Query options
 * @returns Transaction data and operations
 */
export function useTransactions(options: UseTransactionsOptions = {}) {
  // TODO: Reemplazar con query real cuando backend esté listo
  // const { data, isLoading } = useGraphQLQuery(...);
  
  // Mock transactions (lista vacía por defecto)
  const [transactions] = useState<Transaction[]>([]);
  
  // Computed states
  const pendingCount = transactions.filter((tx) => tx.status === 'PENDING').length;
  const processingCount = transactions.filter((tx) => tx.status === 'PROCESSING').length;
  const completedCount = transactions.filter((tx) => tx.status === 'COMPLETED').length;
  const failedCount = transactions.filter((tx) => tx.status === 'FAILED').length;
  
  /**
   * Refetch (MOCK)
   */
  const refetch = async () => {
  };
  
  return {
    // Data
    transactions,
    
    // Counts
    pendingCount,
    processingCount,
    completedCount,
    failedCount,
    totalCount: transactions.length,
    
    // States
    isLoading: false,
    error: null,
    
    // Operations
    refetch,
  };
}

