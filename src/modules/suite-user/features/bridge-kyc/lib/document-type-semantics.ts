export const DOCUMENT_TYPES = ['DNI', 'PASSPORT', 'OTHER', 'SSN', 'ITIN'] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];
export type DocumentExpirationMode = 'required' | 'optional' | 'hidden';

/**
 * Tax-number-only document types (no photo capture, number only).
 * Bridge only accepts `ssn` and `itin` for US-issued identifying entries —
 * `passport`, `national_id` and `other` are rejected with
 * "is not a valid US issued document".
 */
export const USA_DOCUMENT_TYPES: readonly DocumentType[] = ['SSN', 'ITIN'];

export function isUsaDocumentType(type: string | null | undefined): boolean {
  return (USA_DOCUMENT_TYPES as readonly string[]).includes(type ?? '');
}

interface DocumentTypeSemantics {
  requiresBack: boolean;
  expirationMode: DocumentExpirationMode;
  /** Requires photo capture (front image). Tax-number types do not. */
  requiresPhoto: boolean;
  /** Requires the document number field. */
  requiresNumber: boolean;
}

type DocumentTypeSemanticsOverride = Partial<DocumentTypeSemantics>;

const DEFAULT_DOCUMENT_TYPE_SEMANTICS: Record<DocumentType, DocumentTypeSemantics> = {
  PASSPORT: {
    requiresBack: false,
    expirationMode: 'required',
    requiresPhoto: true,
    requiresNumber: false,
  },
  DNI: {
    requiresBack: true,
    expirationMode: 'optional',
    requiresPhoto: true,
    requiresNumber: false,
  },
  OTHER: {
    requiresBack: false,
    expirationMode: 'optional',
    requiresPhoto: true,
    requiresNumber: false,
  },
  SSN: {
    requiresBack: false,
    expirationMode: 'hidden',
    requiresPhoto: false,
    requiresNumber: true,
  },
  ITIN: {
    requiresBack: false,
    expirationMode: 'hidden',
    requiresPhoto: false,
    requiresNumber: true,
  },
};

const COUNTRY_DOCUMENT_TYPE_SEMANTIC_OVERRIDES: Partial<
Record<string, Partial<Record<DocumentType, DocumentTypeSemanticsOverride>>>
> = {
  COL: {
    DNI: {
      expirationMode: 'hidden',
    },
  },
  MEX: {
    DNI: {
      expirationMode: 'hidden',
    },
  },
  ECU: {
    DNI: {
      expirationMode: 'hidden',
    },
  },
};

export function documentTypeRequiresBack(type: DocumentType): boolean {
  return DEFAULT_DOCUMENT_TYPE_SEMANTICS[type].requiresBack;
}

export function documentTypeRequiresPhoto(type: DocumentType): boolean {
  return DEFAULT_DOCUMENT_TYPE_SEMANTICS[type].requiresPhoto;
}

export function documentTypeRequiresNumber(type: DocumentType): boolean {
  return DEFAULT_DOCUMENT_TYPE_SEMANTICS[type].requiresNumber;
}

export function getDocumentTypeSemantics(
  countryCode: string | null | undefined,
  documentType: DocumentType,
): DocumentTypeSemantics {
  const normalizedCountryCode = countryCode?.toUpperCase();
  const countryOverrides = normalizedCountryCode
    ? COUNTRY_DOCUMENT_TYPE_SEMANTIC_OVERRIDES[normalizedCountryCode]
    : undefined;

  return {
    ...DEFAULT_DOCUMENT_TYPE_SEMANTICS[documentType],
    ...(countryOverrides?.[documentType] ?? {}),
  };
}

export function getDocumentExpirationMode(
  countryCode: string | null | undefined,
  documentType: DocumentType,
): DocumentExpirationMode {
  return getDocumentTypeSemantics(countryCode, documentType).expirationMode;
}

export function documentTypeShowsExpiration(
  countryCode: string | null | undefined,
  documentType: DocumentType,
): boolean {
  return getDocumentExpirationMode(countryCode, documentType) !== 'hidden';
}

export function documentTypeRequiresExpiration(
  countryCode: string | null | undefined,
  documentType: DocumentType,
): boolean {
  return getDocumentExpirationMode(countryCode, documentType) === 'required';
}
