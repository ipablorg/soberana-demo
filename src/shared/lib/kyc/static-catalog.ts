export type SupportedCustomerType = 'individual' | 'business';

export interface RegistrationDocumentConfig {
  docType: string;
  placeholder: string;
  label: string;
}

export interface TaxIdTypeOption {
  value: string;
  label: string;
  placeholder?: string;
}

export interface DocumentTypeOptionOverride {
  label?: string;
  helperText?: string;
  numberLabel?: string;
  numberPlaceholder?: string;
  descriptionPlaceholder?: string;
}

export interface KycCountryCatalogEntry {
  iso3: string;
  name: string;
  iso2?: string;
  phoneCode?: string;
  registrationEnabled?: boolean;
  registrationDocument?: RegistrationDocumentConfig;
  taxIdOptions?: TaxIdTypeOption[];
  /** Business-specific tax ID options (KYB). Falls back to taxIdOptions when absent. */
  businessTaxIdOptions?: TaxIdTypeOption[];
  documentTypeOverrides?: Partial<Record<'PASSPORT' | 'DNI' | 'OTHER', DocumentTypeOptionOverride>>;
}

export interface RegistrationCountrySelectOption {
  value: string;
  iso3: string;
  name: string;
  iso2?: string;
  phoneCode?: string;
  supported: boolean;
  flag?: string;
}

export const KYC_COUNTRY_CATALOG: KycCountryCatalogEntry[] = [
  {
    iso2: 'AR',
    iso3: 'ARG',
    name: 'Argentina',
    taxIdOptions: [
      { value: 'CUIT', label: 'CUIT', placeholder: 'e.g. 20-12345678-9' },
      { value: 'CUIL', label: 'CUIL', placeholder: 'e.g. 27-12345678-4' },
      { value: 'DNI', label: 'DNI', placeholder: 'e.g. 12345678' },
    ],
  },
  { iso3: 'BOL', name: 'Bolivia' },
  {
    iso2: 'BR',
    iso3: 'BRA',
    name: 'Brazil',
    phoneCode: '+55',
    registrationEnabled: true,
    registrationDocument: { docType: 'CPF', placeholder: '123.456.789-00', label: 'CPF' },
    taxIdOptions: [
      { value: 'CPF', label: 'CPF', placeholder: 'e.g. 123.456.789-00' },
      { value: 'CNPJ', label: 'CNPJ', placeholder: 'e.g. 12.345.678/0001-90' },
    ],
    documentTypeOverrides: {
      DNI: {
        label: 'RG or national identity document',
        helperText: 'Use your Brazilian identity card or equivalent national identity document.',
        numberLabel: 'RG / identity number',
        numberPlaceholder: 'e.g. 12.345.678-9',
      },
      OTHER: {
        label: 'CNH or other government document',
        descriptionPlaceholder: 'e.g. CNH',
      },
    },
  },
  { iso3: 'CAN', name: 'Canada' },
  {
    iso2: 'CL',
    iso3: 'CHL',
    name: 'Chile',
    phoneCode: '+56',
    registrationEnabled: true,
    registrationDocument: { docType: 'RUT', placeholder: '12345678-9', label: 'RUT' },
    taxIdOptions: [{ value: 'RUT', label: 'RUT', placeholder: 'e.g. 12.345.678-9' }],
  },
  {
    iso2: 'CO',
    iso3: 'COL',
    name: 'Colombia',
    phoneCode: '+57',
    registrationEnabled: true,
    registrationDocument: { docType: 'CC', placeholder: '1234567890', label: 'Cédula de Ciudadanía' },
    taxIdOptions: [
      { value: 'CC', label: 'Cédula de ciudadanía (CC)', placeholder: 'e.g. 1234567890' },
      { value: 'CE', label: 'Cédula de extranjería (CE)', placeholder: 'e.g. 123456789' },
      { value: 'NIT', label: 'NIT', placeholder: 'e.g. 900123456-7' },
    ],
    documentTypeOverrides: {
      DNI: {
        label: 'Cédula de ciudadanía or cédula de extranjería',
        numberLabel: 'Cédula number',
        numberPlaceholder: 'e.g. 1234567890',
      },
      OTHER: {
        descriptionPlaceholder: 'e.g. Permiso especial de permanencia',
      },
    },
  },
  { iso3: 'CRI', name: 'Costa Rica' },
  { iso3: 'DOM', name: 'Dominican Republic' },
  {
    iso2: 'EC',
    iso3: 'ECU',
    name: 'Ecuador',
    phoneCode: '+593',
    registrationEnabled: true,
    registrationDocument: { docType: 'CI', placeholder: '1234567890', label: 'Cédula de Identidad' },
    taxIdOptions: [
      { value: 'CI', label: 'Cédula de identidad (CI)', placeholder: 'e.g. 1234567890' },
      { value: 'RUC', label: 'RUC', placeholder: 'e.g. 1790012345001' },
    ],
    documentTypeOverrides: {
      DNI: {
        label: 'Cédula de identidad',
        numberLabel: 'Cédula number',
        numberPlaceholder: 'e.g. 1234567890',
      },
      OTHER: {
        descriptionPlaceholder: 'e.g. Carnet de refugiado',
      },
    },
  },
  { iso3: 'SLV', name: 'El Salvador' },
  { iso3: 'FRA', name: 'France' },
  { iso3: 'DEU', name: 'Germany' },
  { iso3: 'GTM', name: 'Guatemala' },
  { iso3: 'HND', name: 'Honduras' },
  { iso3: 'IND', name: 'India' },
  { iso3: 'ITA', name: 'Italy' },
  { iso3: 'JPN', name: 'Japan' },
  {
    iso2: 'MX',
    iso3: 'MEX',
    name: 'Mexico',
    phoneCode: '+52',
    registrationEnabled: true,
    registrationDocument: { docType: 'CURP', placeholder: 'ABCD123456HDFXYZ00', label: 'CURP' },
    taxIdOptions: [
      { value: 'RFC', label: 'RFC', placeholder: 'e.g. ABCD123456EF7' },
      { value: 'CURP', label: 'CURP', placeholder: 'e.g. ABCD123456HDFXYZ09' },
    ],
    documentTypeOverrides: {
      DNI: {
        label: 'INE / voter ID',
        helperText: 'Use your INE or IFE credential if it is your primary government ID.',
        numberLabel: 'INE or voter ID number',
        numberPlaceholder: 'e.g. 1234567890123',
      },
      OTHER: {
        label: 'Residence card or other government document',
        descriptionPlaceholder: 'e.g. Tarjeta de residente',
      },
    },
  },
  { iso3: 'NIC', name: 'Nicaragua' },
  { iso3: 'NGA', name: 'Nigeria' },
  { iso3: 'PAN', name: 'Panama' },
  { iso3: 'PRY', name: 'Paraguay' },
  {
    iso2: 'PE',
    iso3: 'PER',
    name: 'Peru',
    phoneCode: '+51',
    registrationEnabled: true,
    registrationDocument: { docType: 'DNI', placeholder: '12345678', label: 'DNI' },
    taxIdOptions: [
      { value: 'DNI', label: 'DNI', placeholder: 'e.g. 12345678' },
      { value: 'RUC', label: 'RUC', placeholder: 'e.g. 12345678901' },
      { value: 'CE', label: 'Carné de extranjería (CE)', placeholder: 'e.g. 123456789' },
    ],
    documentTypeOverrides: {
      DNI: {
        label: 'DNI or carné de extranjería',
        numberLabel: 'DNI / card number',
        numberPlaceholder: 'e.g. 12345678',
      },
    },
  },
  { iso3: 'PHL', name: 'Philippines' },
  { iso3: 'PRT', name: 'Portugal', taxIdOptions: [{ value: 'NIF', label: 'NIF', placeholder: 'e.g. 123456789' }] },
  {
    iso2: 'ES',
    iso3: 'ESP',
    name: 'Spain',
    phoneCode: '+34',
    registrationEnabled: true,
    registrationDocument: { docType: 'DNI', placeholder: '12345678X', label: 'DNI' },
    taxIdOptions: [
      { value: 'DNI', label: 'DNI', placeholder: 'e.g. 12345678X' },
      { value: 'NIE', label: 'NIE', placeholder: 'e.g. X1234567L' },
      { value: 'NIF', label: 'NIF', placeholder: 'e.g. 12345678X' },
    ],
    documentTypeOverrides: {
      DNI: {
        label: 'DNI or NIE',
        numberLabel: 'DNI / NIE number',
        numberPlaceholder: 'e.g. 12345678X',
      },
    },
  },
  { iso3: 'GBR', name: 'United Kingdom' },
  {
    iso2: 'US',
    iso3: 'USA',
    name: 'United States',
    phoneCode: '+1',
    registrationEnabled: true,
    registrationDocument: { docType: 'SSN', placeholder: '123-45-6789', label: 'SSN' },
    taxIdOptions: [
      { value: 'SSN', label: 'SSN', placeholder: 'e.g. 123-45-6789' },
      { value: 'TIN', label: 'ITIN / TIN', placeholder: 'e.g. 900-70-0000' },
    ],
    businessTaxIdOptions: [
      { value: 'EIN', label: 'EIN', placeholder: 'e.g. 12-3456789' },
      { value: 'SSN', label: 'SSN (sole proprietorship)', placeholder: 'e.g. 123-45-6789' },
    ],
    documentTypeOverrides: {
      DNI: {
        label: 'National identity or residence document',
        helperText: 'Use this only if you have a national identity or residence document. Otherwise choose passport or another government document.',
        numberLabel: 'Identity document number',
        numberPlaceholder: 'e.g. A012345678',
      },
      OTHER: {
        label: 'Driver license, state ID, or other government document',
        descriptionPlaceholder: 'e.g. California driver license',
      },
    },
  },
  { iso3: 'URY', name: 'Uruguay' },
  { iso3: 'VEN', name: 'Venezuela' },
];

export const ISO2_TO_ISO3: Record<string, string> = Object.fromEntries(
  KYC_COUNTRY_CATALOG
    .filter((entry): entry is KycCountryCatalogEntry & { iso2: string } => Boolean(entry.iso2))
    .map((entry) => [entry.iso2, entry.iso3]),
);

function isRegistrationCountrySupported(
  entry: KycCountryCatalogEntry,
): entry is KycCountryCatalogEntry & {
  iso2: string;
  phoneCode: string;
  registrationDocument: RegistrationDocumentConfig;
} {
  return Boolean(entry.registrationEnabled && entry.iso2 && entry.phoneCode && entry.registrationDocument);
}

function getFlagEmoji(iso2: string | undefined): string | undefined {
  if (!iso2 || !/^[A-Z]{2}$/.test(iso2)) {
    return undefined;
  }

  return Array.from(iso2).map((char) => String.fromCodePoint(127397 + char.charCodeAt(0))).join('');
}

export const REGISTRATION_COUNTRY_OPTIONS = KYC_COUNTRY_CATALOG.filter(
  isRegistrationCountrySupported,
);

export const REGISTRATION_COUNTRY_SELECT_OPTIONS: RegistrationCountrySelectOption[] = KYC_COUNTRY_CATALOG.map((entry) => ({
  value: entry.iso2 ?? `unsupported:${entry.iso3}`,
  iso3: entry.iso3,
  name: entry.name,
  iso2: entry.iso2,
  phoneCode: entry.phoneCode,
  supported: isRegistrationCountrySupported(entry),
  flag: getFlagEmoji(entry.iso2),
}));

export const REGISTRATION_UNSUPPORTED_COUNTRY_OPTIONS = REGISTRATION_COUNTRY_SELECT_OPTIONS.filter(
  (entry) => !entry.supported,
);

export const REGISTRATION_PHONE_CODE_OPTIONS = REGISTRATION_COUNTRY_OPTIONS.map((entry) => ({
  iso2: entry.iso2,
  name: entry.name,
  phoneCode: entry.phoneCode,
  flag: getFlagEmoji(entry.iso2),
}));

export const COUNTRY_SELECT_VALUES = REGISTRATION_COUNTRY_OPTIONS.map((entry) => entry.iso2) as string[];

export function getRegistrationDocumentConfig(countryIso2: string | null | undefined): RegistrationDocumentConfig | null {
  if (!countryIso2) return null;

  return REGISTRATION_COUNTRY_OPTIONS.find((entry) => entry.iso2 === countryIso2)?.registrationDocument ?? null;
}

export function getCountryByIso3(countryIso3: string | null | undefined): KycCountryCatalogEntry | undefined {
  if (!countryIso3) return undefined;
  return KYC_COUNTRY_CATALOG.find((entry) => entry.iso3 === countryIso3.toUpperCase());
}

export function getCountryByIso2(countryIso2: string | null | undefined): KycCountryCatalogEntry | undefined {
  if (!countryIso2) return undefined;
  return KYC_COUNTRY_CATALOG.find((entry) => entry.iso2 === countryIso2.toUpperCase());
}

export function getTaxIdTypeOptions(
  countryCode: string | null | undefined,
  customerType?: 'individual' | 'business',
): TaxIdTypeOption[] {
  if (!countryCode) return [];

  const normalized = countryCode.toUpperCase();
  const byIso3 = getCountryByIso3(normalized);
  if (byIso3?.taxIdOptions || byIso3?.businessTaxIdOptions) {
    if (customerType === 'business') {
      return byIso3.businessTaxIdOptions ?? byIso3.taxIdOptions ?? [];
    }
    return byIso3.taxIdOptions ?? [];
  }

  const byIso2 = getCountryByIso2(normalized);
  if (byIso2?.taxIdOptions || byIso2?.businessTaxIdOptions) {
    if (customerType === 'business') {
      return byIso2.businessTaxIdOptions ?? byIso2.taxIdOptions ?? [];
    }
    return byIso2.taxIdOptions ?? [];
  }
  return [];
}

export function getDefaultTaxIdType(
  countryCode: string | null | undefined,
  customerType?: 'individual' | 'business',
): string {
  return getTaxIdTypeOptions(countryCode, customerType)[0]?.value ?? '';
}

export function getTaxIdTypeOption(
  countryCode: string | null | undefined,
  taxIdType: string | null | undefined,
  customerType?: 'individual' | 'business',
): TaxIdTypeOption | undefined {
  if (!taxIdType) return undefined;
  return getTaxIdTypeOptions(countryCode, customerType).find(
    (option) => option.value === taxIdType.toUpperCase(),
  );
}

export function getTaxIdTypeLabel(
  countryCode: string | null | undefined,
  taxIdType: string | null | undefined,
  customerType?: 'individual' | 'business',
): string {
  return getTaxIdTypeOption(countryCode, taxIdType, customerType)?.label ?? taxIdType ?? '';
}

export function isAllowedTaxIdType(
  countryCode: string | null | undefined,
  taxIdType: string | null | undefined,
  customerType?: 'individual' | 'business',
): boolean {
  if (!taxIdType) return false;
  return getTaxIdTypeOptions(countryCode, customerType).some(
    (option) => option.value === taxIdType.toUpperCase(),
  );
}

export function getDocumentTypeOverrides(countryCode: string | null | undefined): Partial<Record<'PASSPORT' | 'DNI' | 'OTHER', DocumentTypeOptionOverride>> | undefined {
  if (!countryCode) return undefined;

  const normalized = countryCode.toUpperCase();
  return getCountryByIso3(normalized)?.documentTypeOverrides ?? getCountryByIso2(normalized)?.documentTypeOverrides;
}
