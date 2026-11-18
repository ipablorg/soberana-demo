/**
 * Create Builder Payment Hook
 *
 * Handles the creation of bulk payout transactions using GraphQL mutation.
 */

import { CreateSelfPayOutMany } from '@/graphql/mutations/payment';
import { useGraphQLMutation } from '@/shared/hooks/use-graphql-mutation';
import type { MappedRow } from './useColumnMapper';
import { useDocumentTypes } from './useDocumentTypes';
import { useBankNormalizer } from './useBankNormalizer';
import { useAuthStore } from '@/shared/stores/auth-store';

interface CreateBuilderPaymentParams {
  paymentData: MappedRow[];
  companyId?: number;
  companyProductId?: number;
}

interface CreateBuilderPaymentResponse {
  success: boolean;
  batchId: string;
  message: string;
  processedCount: number;
  totalAmount: number;
}

/**
 * Bank account type mapping (from CSV column to API value)
 *
 * TODO: Fetch these from API instead of hardcoding
 */
const ACCOUNT_TYPE_MAP: Record<string, string> = {
  ahorros: 'ahorros',
  ahorro: 'ahorros',
  corriente: 'corriente',
  current: 'corriente',
};

/**
 * Get bank account type from string
 *
 * @param type - Account type string from CSV
 * @returns Normalized account type, defaults to SAVINGS if not found
 */
const getAccountType = (type: string): string => {
  const normalized = type.toLowerCase().trim();
  return ACCOUNT_TYPE_MAP[normalized] ?? 'SAVINGS'; // Default to SAVINGS
};

/**
 * Parse amount value from CSV (handles both strings and numbers)
 *
 * @param value - Amount value from CSV
 * @returns Parsed number value
 */
const parseAmount = (value: string | number): number => {
  if (typeof value === 'number') return value;

  // Remove currency symbols, commas, and spaces
  const cleaned = value.replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Extract user-friendly error message from GraphQL error
 * 
 * @param error - Error object from mutation
 * @returns Cleaned error message
 */
const extractErrorMessage = (error: any): string => {
  // Try to get the error message from different possible locations
  const errorMessage = 
    error?.message || 
    error?.errors?.[0]?.message || 
    error?.graphQLErrors?.[0]?.message ||
    'Error desconocido al procesar los pagos';

  // Split at "GraphQL error in createSelfPayOutMany: " and get the part after it
  const parts = errorMessage.split('GraphQL error in createSelfPayOutMany: ');
  
  if (parts.length > 1) {
    // Take only the first part (before any additional colons)
    // Example: "The next transactions references are duplicated in the database: 000018: additional info"
    // Result: "The next transactions references are duplicated in the database: 000018"
    const cleanMessage = parts[1].trim();
    
    // Find if there are multiple colons and take only up to the second occurrence
    const colonMatches = cleanMessage.match(/:/g);
    if (colonMatches && colonMatches.length > 1) {
      // Split by colon and take first two parts (message + reference number)
      const messageParts = cleanMessage.split(':');
      return `${messageParts[0]}: ${messageParts[1]}`.trim();
    }
    
    return cleanMessage;
  }

  // If the pattern doesn't match, try to find any ": " and return what's after it
  const colonParts = errorMessage.split(': ');
  if (colonParts.length > 1) {
    // Take only first two parts if there are multiple colons
    if (colonParts.length > 2) {
      return `${colonParts[1]}: ${colonParts[2]}`.trim();
    }
    return colonParts.slice(1).join(': ').trim();
  }

  return errorMessage;
};

export function useCreateBuilderPayment() {
  // Fetch document types from API
  const { documentTypeMap, isLoading: isLoadingDocTypes } = useDocumentTypes();

  // Use bank normalizer to find banks by name
  const { findBank, isLoading: isLoadingBanks } = useBankNormalizer();

  const mutation = useGraphQLMutation(CreateSelfPayOutMany as any, {
    onSuccess: () => {},
    onError: (error) => {
      console.error('[✗] Payment batch creation failed:', error);
    },
  });

  /**
   * Get document type ID from string using API data
   *
   * @param type - Document type string from CSV
   * @returns Document type ID, defaults to 1 (CC) if not found
   */
  const getDocumentTypeId = (type: string): number => {
    const normalized = type.toLowerCase().trim();
    return documentTypeMap[normalized] ?? 1; // Default to CC if not found
  };

  const createPayment = async ({
    paymentData,
  }: CreateBuilderPaymentParams): Promise<CreateBuilderPaymentResponse | null> => {
    const authState = useAuthStore.getState();

    // Transform MappedRow[] to GraphQL mutation format
    const transformedData = paymentData.map((row) => {
      // Normalize bank name to get bank ID
      const bankName = row.banco ?? '';
      const bankResult = findBank(bankName);
      
      return {
        beneficiaryName: row.nombre,
        documentTypeId: getDocumentTypeId(row['tipo de documento'] ?? ''),
        documentNumber: row['numero de documento'],
        bankBaseId: bankResult.bankId > 0 ? bankResult.bankId : 57, // Use normalized bank ID or fallback to BreB
        bankAccountType: getAccountType(row['tipo de cuenta'] ?? ''),
        bankAccount: row['numero de cuenta'],
        Amount: parseAmount(row.valor ?? 0),
        externalIdentifier: row.referencia || '',
      };
    });

    try {
      const result = await mutation.mutateAsync({
        input: {
          companyId:authState.user?.company_user[0].company.id,
          companyProductId:authState.user?.company_user[0].company.CompanyProduct?.[0].id,
          data: transformedData,
        },
      });

      // Calculate total amount
      const totalAmount = paymentData.reduce((sum, row) => {
        return sum + parseAmount(row.valor ?? 0);
      }, 0);

      // Extract response data
      const mutationResponse = (result as any)?.payout_createSelfPayOutMany;
      const processedCount = mutationResponse?.count ?? paymentData.length;

      // Generate a unique batch ID (timestamp + random)
      const batchId = `BATCH-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      return {
        success: true,
        batchId,
        message: `${processedCount} pago${processedCount !== 1 ? 's' : ''} procesado${processedCount !== 1 ? 's' : ''}`,
        processedCount,
        totalAmount,
      };
    } catch (err) {
      console.error('[✗] Mutation error:', err);
      
      // Return error details to be displayed
      const errorMessage = extractErrorMessage(err);
      
      return {
        success: false,
        batchId: '',
        message: errorMessage,
        processedCount: 0,
        totalAmount: 0,
      };
    }
  };

  const reset = () => {
    mutation.reset();
  };

  return {
    createPayment,
    isLoading: mutation.isPending || isLoadingDocTypes || isLoadingBanks,
    error: mutation.error?.message ?? null,
    reset,
  };
}
