/**
 * Payout Validation Hook
 *
 * Validates mapped CSV data against DocumentTypesByCountry and GetBanks queries
 * to ensure all data is correct before proceeding to step 3 (review)
 */

import { DocumentTypesByCountryDocument } from '@/graphql/queries/management/document-types';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { useMemo } from 'react';
import type { MappedRow } from './useColumnMapper';
import { useBankNormalizer } from './useBankNormalizer';

interface ValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
  suggestion?: string;
}

interface ValidationWarning {
  row: number;
  field: string;
  value: string;
  message: string;
  normalizedValue: string;
  confidence: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    warningRows: number;
  };
}

export function usePayoutValidation() {
  // Fetch document types
  const {
    data: documentTypesData,
    isLoading: isLoadingDocTypes,
    error: docTypesError,
  } = useGraphQLQuery(
    ['management', 'documentTypes', 1],
    DocumentTypesByCountryDocument as any,
    { countryId: 1 }
  );

  // Use bank normalizer hook
  const {
    findBank,
    activeBanks,
    isLoading: isLoadingBanks,
    error: banksError,
  } = useBankNormalizer();

  // Build document types map
  const validDocumentTypes = useMemo(() => {
    if (!documentTypesData || !(documentTypesData as any)?.documentTypesByCountryId) return new Set<string>();
    return new Set(
      (documentTypesData as any).documentTypesByCountryId.map((dt: any) => dt.type.toLowerCase().trim())
    );
  }, [documentTypesData]);

  const isLoading = isLoadingDocTypes || isLoadingBanks;
  const hasError = !!docTypesError || !!banksError;

  /**
   * Validate mapped rows against fetched data
   */
  const validateRows = (rows: MappedRow[]): ValidationResult => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    rows.forEach((row, index) => {
      // Validate document type
      const docType = row['tipo de documento']?.toLowerCase().trim();
      if (docType && !validDocumentTypes.has(docType)) {
        errors.push({
          row: index + 1,
          field: 'tipo de documento',
          value: row['tipo de documento'] || '',
          message: `Revisa el tipo de documento. Opciones válidas: ${Array.from(validDocumentTypes).join(', ')}`,
        });
      }

      // Validate required fields
      if (!row.nombre?.trim()) {
        errors.push({
          row: index + 1,
          field: 'nombre',
          value: '',
          message: 'Ingresa el nombre',
        });
      }

      if (!row['numero de documento']?.trim()) {
        errors.push({
          row: index + 1,
          field: 'numero de documento',
          value: '',
          message: 'Ingresa el número de documento',
        });
      }

      if (!row['numero de cuenta']?.trim()) {
        errors.push({
          row: index + 1,
          field: 'numero de cuenta',
          value: '',
          message: 'Ingresa el número de cuenta',
        });
      }

      if (!row['tipo de cuenta']?.trim()) {
        errors.push({
          row: index + 1,
          field: 'tipo de cuenta',
          value: '',
          message: 'Selecciona el tipo de cuenta',
        });
      }

      if (!row.referencia?.trim()) {
        errors.push({
          row: index + 1,
          field: 'referencia',
          value: '',
          message: 'Ingresa la referencia',
        });
      }

      // Validate amount
      const valor = row.valor;
      if (!valor || valor === '0' || valor === '0.00') {
        errors.push({
          row: index + 1,
          field: 'valor',
          value: valor || '',
          message: 'Ingresa un monto mayor a 0',
        });
      }

      // Validate bank name using normalizer
      const bankName = row.banco?.trim();
      if (bankName) {
        const bankMatch = findBank(bankName);

        if (bankMatch.matchType === 'none') {
          errors.push({
            row: index + 1,
            field: 'banco',
            value: bankName,
            message: `Banco "${bankName}" no encontrado en la base de datos`,
            suggestion: 'Verifica el nombre del banco',
          });
        } else if (bankMatch.matchType === 'fuzzy' && bankMatch.confidence < 90) {
          warnings.push({
            row: index + 1,
            field: 'banco',
            value: bankName,
            message: `Se normalizó "${bankName}" a "${bankMatch.normalizedName}"`,
            normalizedValue: bankMatch.normalizedName,
            confidence: bankMatch.confidence,
          });
        }
      } else {
        errors.push({
          row: index + 1,
          field: 'banco',
          value: '',
          message: 'Ingresa el banco',
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalRows: rows.length,
        validRows: rows.length - errors.length,
        invalidRows: errors.length,
        warningRows: warnings.length,
      },
    };
  };

  return {
    validateRows,
    isLoading,
    hasError,
    validDocumentTypes: Array.from(validDocumentTypes),
    banks: activeBanks,
    findBank,
  };
}
