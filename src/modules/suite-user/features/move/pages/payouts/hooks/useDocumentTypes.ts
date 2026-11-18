/**
 * Document Types Hook
 *
 * Fetches available document types from the backend API for a specific country.
 * Provides a mapping of document type names to their IDs.
 */

import { DocumentTypesByCountryDocument } from '@/graphql/queries/management';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';

/**
 * Document type from API response
 */
interface DocumentType {
  id: number;
  type: string;
}

/**
 * Hook return type
 */
interface UseDocumentTypesReturn {
  /**
   * Array of document types from the API
   */
  documentTypes: DocumentType[];

  /**
   * Map of normalized type names to IDs for easy lookup
   * Example: { 'cc': 1, 'cedula': 1, 'nit': 2 }
   */
  documentTypeMap: Record<string, number>;

  /**
   * Loading state
   */
  isLoading: boolean;

  /**
   * Error message if the query failed
   */
  error: string | null;

  /**
   * Refetch the document types
   */
  refetch: () => void;
}

/**
 * Normalize document type string for mapping
 * Converts to lowercase and removes accents
 *
 * @param type - Document type string
 * @returns Normalized string
 */
const normalizeType = (type: string): string => {
  return type
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove accents
};

/**
 * Custom hook to fetch and manage document types
 *
 * @example
 * ```tsx
 * function PaymentForm() {
 *   const { documentTypes, documentTypeMap, isLoading } = useDocumentTypes();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   // Use the map to get ID from type string
 *   const ccId = documentTypeMap['cc']; // 1
 *   const nitId = documentTypeMap['nit']; // 2
 *
 *   return (
 *     <select>
 *       {documentTypes.map(dt => (
 *         <option key={dt.id} value={dt.id}>{dt.type}</option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useDocumentTypes(): UseDocumentTypesReturn {
  const { data, isLoading, error, refetch } = useGraphQLQuery(
    ['management', 'documentTypes', 1],
    DocumentTypesByCountryDocument as any,
    { countryId: 1 }, // Colombia
    {
      // Cache for 1 hour - document types rarely change
      staleTime: 1000 * 60 * 60,
      gcTime: 1000 * 60 * 60,
    }
  );

  // Build the mapping from type names to IDs
  const documentTypeMap: Record<string, number> = {};

  const responseData = data as any;

  if (responseData?.documentTypesByCountryId) {
    responseData.documentTypesByCountryId.forEach((dt: DocumentType) => {
      const normalized = normalizeType(dt.type);
      documentTypeMap[normalized] = dt.id;

      // Add common abbreviations/aliases
      // TODO: Consider moving these mappings to backend or configuration
      if (normalized === 'cedula de ciudadania') {
        documentTypeMap['cc'] = dt.id;
        documentTypeMap['cedula'] = dt.id;
        documentTypeMap['cédula'] = dt.id;
      } else if (normalized === 'cedula de extranjeria') {
        documentTypeMap['ce'] = dt.id;
      } else if (normalized === 'tarjeta de identidad') {
        documentTypeMap['ti'] = dt.id;
      }
    });
  }

  return {
    documentTypes: responseData?.documentTypesByCountryId ?? [],
    documentTypeMap,
    isLoading,
    error: error?.message ?? null,
    refetch: () => {
      refetch();
    },
  };
}
