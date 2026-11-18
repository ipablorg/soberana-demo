/**
 * Banks Hook
 *
 * Fetches all banks from the backend API.
 */

import { GetBanksDocument } from '@/graphql/queries/management';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';

/**
 * Bank type
 */
interface Bank {
  id: number;
  name: string;
  active: boolean;
  countryId: number;
  alternativeName: string[];
}

/**
 * Hook return type
 */
interface UseBanksReturn {
  /**
   * List of all banks from the API
   */
  banks: Bank[];

  /**
   * BreB bank (for backward compatibility)
   */
  bankId: number | null;

  /**
   * Loading state
   */
  isLoading: boolean;

  /**
   * Error message if the query failed
   */
  error: string | null;

  /**
   * Refetch the banks
   */
  refetch: () => void;
}

/**
 * Custom hook to fetch all banks
 *
 * @example
 * ```tsx
 * function PaymentForm() {
 *   const { banks, isLoading } = useBanks();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <select>
 *       {banks.map(bank => (
 *         <option key={bank.id} value={bank.id}>{bank.name}</option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useBanks(): UseBanksReturn {
  const { data, isLoading, error, refetch } = useGraphQLQuery(
    ['management', 'banks'],
    GetBanksDocument as any,
    undefined as any,
    {
      // Cache for 1 hour - banks rarely change
      staleTime: 1000 * 60 * 60,
      gcTime: 1000 * 60 * 60,
    }
  );

  const responseData = data as any;

  const banks: Bank[] = responseData?.banks ?? [];
  const brebBank = banks.find(bank => bank.name === 'BreB');

  return {
    banks,
    bankId: brebBank?.id ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch: () => {
      refetch();
    },
  };
}
