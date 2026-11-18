import {
  DOCUMENT_TYPES,
  USA_DOCUMENT_TYPES,
  getDocumentExpirationMode,
  isUsaDocumentType,
  type DocumentExpirationMode,
  type DocumentType,
} from './document-type-semantics';
import { getDocumentTypeOverrides } from '@/shared/lib/kyc/static-catalog';

export interface DocumentTypeOption {
  value: DocumentType;
  label: string;
  helperText?: string;
  numberLabel: string;
  numberPlaceholder?: string;
  descriptionPlaceholder?: string;
  expirationMode: DocumentExpirationMode;
}

type DocumentTypeOptionConfig = Omit<DocumentTypeOption, 'value'>;

const DEFAULT_DOCUMENT_TYPE_CONFIG: Record<DocumentType, DocumentTypeOptionConfig> = {
  PASSPORT: {
    label: 'Passport',
    helperText: 'Use your passport if you are identifying with your travel document.',
    numberLabel: 'Passport number',
    numberPlaceholder: 'e.g. AB1234567',
    expirationMode: 'required',
  },
  DNI: {
    label: 'National identity document',
    helperText: 'Use the main government identity document issued in your country.',
    numberLabel: 'Government ID number',
    numberPlaceholder: 'e.g. 12345678',
    expirationMode: 'optional',
  },
  OTHER: {
    label: 'Other government document',
    helperText: 'Use another government-issued identity document if passport or national ID do not apply.',
    numberLabel: 'Document number',
    numberPlaceholder: 'e.g. DL1234567',
    descriptionPlaceholder: 'e.g. Residence card or driver license',
    expirationMode: 'optional',
  },
  SSN: {
    label: 'Social Security Number (SSN)',
    helperText: 'US-issued documents only accept SSN or ITIN.',
    numberLabel: 'SSN number',
    numberPlaceholder: 'e.g. 123-45-6789',
    expirationMode: 'hidden',
  },
  ITIN: {
    label: 'Individual Taxpayer Identification Number (ITIN)',
    helperText: 'Use this if you do not have a Social Security Number.',
    numberLabel: 'ITIN number',
    numberPlaceholder: 'e.g. 900-70-0000',
    expirationMode: 'hidden',
  },
};

export function getDocumentTypeOptions(countryCode: string | null | undefined): DocumentTypeOption[] {
  const normalizedCountryCode = countryCode?.toUpperCase();
  const countryOverrides = getDocumentTypeOverrides(normalizedCountryCode);

  // Bridge rejects `passport`, `national_id` and `other` for US-issued
  // identifying entries ("is not a valid US issued document") — only SSN and
  // ITIN are accepted there. Conversely, SSN/ITIN are US-only types and are
  // never offered for other issuing countries.
  const availableTypes = normalizedCountryCode === 'USA'
    ? USA_DOCUMENT_TYPES
    : DOCUMENT_TYPES.filter((type) => !isUsaDocumentType(type));

  return availableTypes.map((value) => ({
    value,
    ...DEFAULT_DOCUMENT_TYPE_CONFIG[value],
    ...(countryOverrides?.[value] ?? {}),
    expirationMode: getDocumentExpirationMode(normalizedCountryCode, value),
  }));
}

export function getDocumentTypeOption(
  countryCode: string | null | undefined,
  documentType: DocumentType | null | undefined,
): DocumentTypeOption | undefined {
  if (!documentType) return undefined;

  return getDocumentTypeOptions(countryCode).find((option) => option.value === documentType);
}
