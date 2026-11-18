import { isUsaDocumentType, type DocumentType } from './document-type-semantics';

interface DocumentNumberPrefillInput {
  documentType: DocumentType | null | undefined;
  currentNumber: string | null | undefined;
  taxId: string | null | undefined;
  taxIdType: string | null | undefined;
  /** The user already edited the number field (even clearing it): never refill. */
  userEdited?: boolean;
}

/**
 * A US-issued identifying document is the SSN/ITIN the user already typed as
 * their tax id in the personal step. Reuse it instead of asking twice; any
 * number the user already typed in the document step wins.
 */
export function resolveDocumentNumberPrefill({
  documentType,
  currentNumber,
  taxId,
  taxIdType,
  userEdited = false,
}: DocumentNumberPrefillInput): string | null {
  if (userEdited) return null;
  if (!documentType || !isUsaDocumentType(documentType)) return null;
  if (currentNumber?.trim()) return null;

  const normalizedTaxId = taxId?.trim();
  if (!normalizedTaxId) return null;

  // Only reuse the tax id when it is the same kind of number (SSN vs ITIN).
  const normalizedTaxIdType = taxIdType?.trim().toUpperCase();
  if (
    normalizedTaxIdType &&
    isUsaDocumentType(normalizedTaxIdType as DocumentType) &&
    normalizedTaxIdType !== documentType
  ) {
    return null;
  }

  return normalizedTaxId;
}
