/**
 * useBankAccounts Hook
 * 
 * Custom hook for managing bank accounts (CRUD operations).
 * 
 * ⚠️ MOCK VERSION: Backend pendiente de implementación.
 * Cuando el backend esté listo, descomentar las queries reales.
 */

import { useState, useCallback } from 'react';
import { useLingui } from '@lingui/react/macro';
// TODO: Descomentar cuando backend esté listo
// import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
// import { useGraphQLMutation } from '@/shared/hooks/use-graphql-mutation';
// import { GetBankAccountsDocument } from '@/graphql/queries/management';
// import { CreateBankAccountDocument } from '@/graphql/mutations/management';
import type { BankAccount, CreateBankAccountInput } from '../types/bank-account.types';
import { toast } from 'sonner';

/**
 * Bank Accounts Hook (MOCK VERSION)
 * 
 * ⚠️ Usando datos mock hasta que el backend implemente los resolvers.
 * 
 * @returns Bank accounts state and operations
 */
export function useBankAccounts() {
  const { t } = useLingui();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // TODO: Reemplazar con query real cuando backend esté listo
  // const { data, isLoading } = useGraphQLQuery(...);
  
  /**
   * Create a new bank account (MOCK - Bridge API Format)
   * 
   * @param input - Bank account data (Bridge API format)
   * @returns Promise with created account
   */
  const createAccount = useCallback(async (input: CreateBankAccountInput): Promise<BankAccount | null> => {
    setIsCreating(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock account with Bridge API format
      const newAccount: BankAccount = {
        id: `ext_account_${Date.now()}`,
        customer_id: 'cust_mock_123',
        account_type: input.account_type,
        status: 'active',
        created_at: new Date().toISOString(),
      };
      
      // Add specific fields based on account type
      if (input.account_type === 'us' && 'account' in input) {
        newAccount.account = {
          last_4: input.account.account_number.slice(-4),
          routing_number: input.account.routing_number,
          account_owner_name: input.account.account_owner_name,
        };
      } else if (input.account_type === 'iban' && 'iban' in input) {
        newAccount.iban = {
          last_4: input.iban.account_number.slice(-4),
          bic: input.iban.bic,
          account_owner_name: input.iban.account_owner_name,
        };
      } else if (input.account_type === 'mx' && 'account' in input) {
        newAccount.account = {
          last_4: input.account.clabe.slice(-4),
          account_owner_name: input.account.account_owner_name,
        };
      } else if (input.account_type === 'br' && 'account' in input) {
        newAccount.account = {
          last_4: input.account.pix_key.slice(-4),
          account_owner_name: input.account.account_owner_name,
        };
      } else if (input.account_type === 'co' && 'account' in input) {
        newAccount.account = {
          last_4: input.account.account_number.slice(-4),
          account_owner_name: input.account.account_owner_name,
        };
      }
      
      setAccounts(prev => [...prev, newAccount]);
      
      toast.success(t`Cuenta bancaria agregada`, {
        description: t`Todo en orden`,
      });
      
      return newAccount;
    } catch (error) {
      console.error('Error creating bank account:', error);
      toast.error(t`No pudimos agregar la cuenta bancaria`);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [accounts.length, t]);
  
  /**
   * Set default bank account (MOCK)
   */
  const setDefaultAccount = useCallback(async (accountId: string): Promise<void> => {
    toast.info(t`Próximamente`);
  }, [t]);
  
  /**
   * Delete bank account (MOCK)
   */
  const deleteAccount = useCallback(async (accountId: string): Promise<void> => {
    toast.info(t`Próximamente`);
  }, [t]);
  
  /**
   * Refetch accounts (MOCK)
   */
  const refetch = useCallback(async () => {
  }, []);
  
  const defaultAccount = accounts.find((acc) => acc.isDefault);
  
  return {
    // State
    accounts,
    defaultAccount,
    isLoading,
    error: null,
    
    // Operations
    createAccount,
    setDefaultAccount,
    deleteAccount,
    refetch,
    
    // Mutation states
    isCreating,
  };
}

/**
 * Hook to get available banks list
 * 
 * ⚠️ Esta query SÍ existe en el backend actual.
 */
export function useAvailableBanks() {
  // TODO: Implementar cuando se necesite
  return {
    banks: [],
    isLoading: false,
  };
}

