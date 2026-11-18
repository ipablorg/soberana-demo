/**
 * Pure parsers that turn the freeform `kyc_data` and `address_details` JSON
 * columns into labeled fields for the KYC dossier dialog.
 *
 * The backend stores KYC payloads as `GraphQLJSON`, so the shape varies by
 * provider and customer type. These parsers extract the common keys ops needs
 * at a glance and leave anything unmapped as a collapsible JSON leftover.
 */

import { EMPTY_CELL, formatOpsDateTime } from '../../ops-review/lib/ops-formatting';

export interface DossierField {
  label: string;
  value: string;
}

export interface ParsedDossierSection {
  fields: DossierField[];
  /** Pretty-printed JSON of the keys that were not mapped to a label. */
  leftover: string | null;
}

const ADDRESS_LABELS: Record<string, string> = {
  street: 'Calle',
  street_line_2: 'Complemento',
  address_line_1: 'Calle',
  address_line_2: 'Complemento',
  city: 'Ciudad',
  subdivision: 'Estado / Provincia',
  state: 'Estado / Provincia',
  postal_code: 'Código postal',
  zip_code: 'Código postal',
  country: 'País',
  country_code: 'País',
};

const INDIVIDUAL_KYC_LABELS: Record<string, string> = {
  first_name: 'Nombre',
  middle_name: 'Segundo nombre',
  last_name: 'Apellido',
  full_name: 'Nombre completo',
  dob: 'Fecha de nacimiento',
  birth_date: 'Fecha de nacimiento',
  date_of_birth: 'Fecha de nacimiento',
  nationality: 'Nacionalidad',
  occupation: 'Ocupación',
  tax_id: 'Identificación tributaria',
  tax_id_type: 'Tipo de identificación',
  document_number: 'Número de documento',
  email: 'Correo',
  phone: 'Teléfono',
};

const BUSINESS_KYC_LABELS: Record<string, string> = {
  legal_name: 'Razón social',
  legalName: 'Razón social',
  entity_type: 'Tipo de entidad',
  entityType: 'Tipo de entidad',
  incorporation_date: 'Fecha de constitución',
  registration_number: 'Número de registro',
  industry: 'Industria',
  website: 'Sitio web',
  tax_id: 'Identificación tributaria',
  doing_business_as: 'Nombre comercial',
  // KYB form keys (snake_case API payload and camelCase persisted form).
  business_legal_name: 'Razón social',
  businessLegalName: 'Razón social',
  business_trade_name: 'Nombre comercial',
  businessTradeName: 'Nombre comercial',
  business_type: 'Tipo de empresa',
  businessType: 'Tipo de empresa',
  business_industry: 'Industria',
  businessIndustry: 'Industria',
  business_description: 'Descripción del negocio',
  businessDescription: 'Descripción del negocio',
  incorporationDate: 'Fecha de constitución',
  registrationNumber: 'Número de registro',
  number_of_employees: 'Número de empleados',
  numberOfEmployees: 'Número de empleados',
  is_financial_institution: '¿Es una institución financiera?',
  isFinancialInstitution: '¿Es una institución financiera?',
  primary_website: 'Sitio web',
  primaryWebsite: 'Sitio web',
  website_absence_reason: 'Motivo por el que no tiene sitio web',
  websiteAbsenceReason: 'Motivo por el que no tiene sitio web',
  estimated_annual_revenue_usd: 'Ingresos anuales estimados (USD)',
  estimatedAnnualRevenueUsd: 'Ingresos anuales estimados (USD)',
  expected_monthly_payments_usd: 'Pagos mensuales esperados (USD)',
  expectedMonthlyPaymentsUsd: 'Pagos mensuales esperados (USD)',
  source_of_funds: 'Origen de los fondos',
  sourceOfFunds: 'Origen de los fondos',
  account_purpose: 'Propósito de la cuenta',
  accountPurpose: 'Propósito de la cuenta',
  is_dao: 'Es una DAO',
  isDao: 'Es una DAO',
  // Keys of the persisted KYB row the dossier used to print in English (N-6).
  customerId: 'ID del cliente',
  customer_id: 'ID del cliente',
  expectedMonthlyPayments: 'Pagos mensuales esperados (USD)',
  expected_monthly_payments: 'Pagos mensuales esperados (USD)',
  operatesInProhibitedCountries: 'Opera en países prohibidos',
  operates_in_prohibited_countries: 'Opera en países prohibidos',
  conductsMoneyServices: 'Presta servicios monetarios',
  conducts_money_services: 'Presta servicios monetarios',
  createdAt: 'Creado',
  created_at: 'Creado',
  updatedAt: 'Actualizado',
  updated_at: 'Actualizado',
};

/** Spanish names of the KYB enum values, by the field they belong to. */
const BUSINESS_TYPE_VALUES: Record<string, string> = {
  cooperative: 'Cooperativa',
  corporation: 'Sociedad anónima (Corporation)',
  llc: 'Sociedad de responsabilidad limitada (LLC)',
  limited_liability_company: 'Sociedad de responsabilidad limitada (LLC)',
  partnership: 'Sociedad colectiva (Partnership)',
  sole_prop: 'Empresario individual',
  sole_proprietorship: 'Empresario individual',
  trust: 'Fideicomiso (Trust)',
  other: 'Otro',
};

const SOURCE_OF_FUNDS_VALUES: Record<string, string> = {
  business_loans: 'Préstamos empresariales',
  grants: 'Subvenciones',
  inter_company_funds: 'Fondos entre empresas',
  investment_proceeds: 'Ingresos por inversiones',
  legal_settlement: 'Acuerdo legal',
  owners_capital: 'Capital de los propietarios',
  pension_retirement: 'Pensión o jubilación',
  sale_of_assets: 'Venta de activos',
  sales_of_goods_and_services: 'Venta de bienes y servicios',
  third_party_funds: 'Fondos de terceros',
  treasury_reserves: 'Reservas de tesorería',
};

const ACCOUNT_PURPOSE_VALUES: Record<string, string> = {
  charitable_donations: 'Donaciones benéficas',
  ecommerce_retail_payments: 'Pagos de comercio electrónico o minorista',
  investment_purposes: 'Inversiones',
  other: 'Otro',
  payments_to_friends_or_family_abroad: 'Pagos a familiares o amigos en el exterior',
  payroll: 'Nómina',
  personal_or_living_expenses: 'Gastos personales o de vida',
  protect_wealth: 'Proteger el patrimonio',
  purchase_goods_and_services: 'Compra de bienes y servicios',
  receive_payments_for_goods_and_services: 'Recibir pagos por bienes y servicios',
  tax_optimization: 'Optimización fiscal',
  third_party_money_transmission: 'Transmisión de dinero de terceros',
  treasury_management: 'Gestión de tesorería',
};

const INDUSTRY_VALUES: Record<string, string> = {
  technology: 'Tecnología',
  finance: 'Finanzas',
  healthcare: 'Salud',
  retail: 'Comercio minorista',
  manufacturing: 'Manufactura',
  consulting: 'Consultoría',
  real_estate: 'Bienes raíces',
  education: 'Educación',
  entertainment: 'Entretenimiento',
  transportation: 'Transporte',
  other: 'Otro',
};

const VALUE_LABELS_BY_KEY: Record<string, Record<string, string>> = {
  businessType: BUSINESS_TYPE_VALUES,
  business_type: BUSINESS_TYPE_VALUES,
  entityType: BUSINESS_TYPE_VALUES,
  entity_type: BUSINESS_TYPE_VALUES,
  sourceOfFunds: SOURCE_OF_FUNDS_VALUES,
  source_of_funds: SOURCE_OF_FUNDS_VALUES,
  accountPurpose: ACCOUNT_PURPOSE_VALUES,
  account_purpose: ACCOUNT_PURPOSE_VALUES,
  businessIndustry: INDUSTRY_VALUES,
  business_industry: INDUSTRY_VALUES,
  industry: INDUSTRY_VALUES,
};

const AMOUNT_RANGE = /^(\d+)_(\d+|plus)$/;
const MIDNIGHT_UTC = /^(\d{4})-(\d{2})-(\d{2})T00:00:00(\.0+)?Z$/;
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

function groupThousands(digits: string): string {
  return Number(digits).toLocaleString('es-CO');
}

/**
 * A scalar as ops reads it: enum codes named, amount ranges (`0_4999`) as
 * "0 – 4.999 USD", midnight-UTC dates (`2020-05-10T00:00:00.000Z`) as
 * `10/05/2020` and other ISO timestamps in the local time. Anything else
 * (plain `YYYY-MM-DD` dates included) is kept as it is.
 */
function displayValue(key: string, text: string): string {
  const named = VALUE_LABELS_BY_KEY[key]?.[text];
  if (named) return named;

  const range = AMOUNT_RANGE.exec(text);
  if (range) {
    return range[2] === 'plus'
      ? `${groupThousands(range[1])} USD o más`
      : `${groupThousands(range[1])} – ${groupThousands(range[2])} USD`;
  }

  const date = MIDNIGHT_UTC.exec(text);
  if (date) return `${date[3]}/${date[2]}/${date[1]}`;

  if (ISO_TIMESTAMP.test(text)) {
    const formatted = formatOpsDateTime(text);
    return formatted === EMPTY_CELL ? text : formatted;
  }

  return text;
}

/** Document purposes (`category`) as ops reads them; unknown ones stay raw. */
const DOCUMENT_CATEGORY_LABELS: Record<string, string> = {
  PROOF_OF_ADDRESS: 'Comprobante de domicilio',
  SUPPORTING: 'Documento de soporte',
  SUPPORTING_DOCUMENT: 'Documento de soporte',
  IDENTITY: 'Documento de identidad',
  IDENTITY_DOCUMENT: 'Documento de identidad',
  ID_FRONT: 'Documento de identidad (frente)',
  ID_BACK: 'Documento de identidad (reverso)',
  SELFIE: 'Selfie',
  PROOF_OF_INCORPORATION: 'Certificado de constitución',
  BUSINESS_FORMATION: 'Documento de constitución',
  OWNERSHIP_INFORMATION: 'Información de propiedad',
  PROOF_OF_SOURCE_OF_FUNDS: 'Soporte del origen de fondos',
  TAX_ID: 'Documento tributario',
};

export function documentCategoryLabel(category: string): string {
  return DOCUMENT_CATEGORY_LABELS[category.toUpperCase()] ?? category;
}

/** An unknown key as readable words (`someNewField` → "Some new field"). */
function humanizeKey(key: string): string {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : key;
}

/** Keys whose value is an array; shown as a count rather than a JSON blob. */
const ARRAY_COUNT_LABELS: Record<string, string> = {
  identifying_documents: 'Documentos identificatorios',
  identifyingDocuments: 'Documentos identificatorios',
  associated_persons: 'UBOs / personas asociadas',
  associatedPersons: 'UBOs / personas asociadas',
  ubos: 'UBOs',
  documents: 'Documentos',
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  );
}

function scalarToString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === 'yes') return 'Sí';
    if (trimmed === 'no') return 'No';
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}

function buildLeftover(entries: [string, unknown][]): string | null {
  if (entries.length === 0) return null;

  try {
    return JSON.stringify(Object.fromEntries(entries), null, 2);
  } catch {
    return null;
  }
}

/**
 * Parses an address JSON object into labeled fields. Unknown keys are kept as
 * a leftover JSON block.
 */
export function parseAddressDetails(
  addressDetails: unknown,
): ParsedDossierSection {
  if (!isPlainObject(addressDetails)) {
    return { fields: [], leftover: null };
  }

  const fields: DossierField[] = [];
  const leftover: [string, unknown][] = [];

  for (const [key, value] of Object.entries(addressDetails)) {
    const label = ADDRESS_LABELS[key];
    if (label) {
      const text = scalarToString(value);
      if (text) fields.push({ label, value: text });
    } else {
      leftover.push([key, value]);
    }
  }

  return { fields, leftover: buildLeftover(leftover) };
}

/** Business data kept for the VA providers (`provider_profile`), in display order. */
const PROVIDER_PROFILE_LABELS: ReadonlyArray<readonly [string, string]> = [
  ['registrationNumber', 'Número de registro'],
  ['numberOfEmployees', 'Número de empleados'],
  ['isFinancialInstitution', '¿Es una institución financiera?'],
  ['websiteAbsenceReason', 'Motivo por el que no tiene sitio web'],
  ['representativeFirstName', 'Nombre del representante legal'],
  ['representativeLastName', 'Apellido del representante legal'],
];

/**
 * Parses the provider profile (N-10) into labeled rows: what the providers
 * get that the KYB form has no column for. Unknown keys go to the leftover.
 */
export function parseProviderProfile(profile: unknown): ParsedDossierSection {
  if (!isPlainObject(profile)) {
    return { fields: [], leftover: null };
  }

  const fields: DossierField[] = [];
  for (const [key, label] of PROVIDER_PROFILE_LABELS) {
    const text = scalarToString(profile[key]);
    if (text) fields.push({ label, value: text });
  }

  const known = new Set(PROVIDER_PROFILE_LABELS.map(([key]) => key));
  const leftover = Object.entries(profile).filter(([key]) => !known.has(key));

  return { fields, leftover: buildLeftover(leftover) };
}

/**
 * Parses the KYC data JSON object into labeled fields, choosing the label map
 * by customer type. Array-valued keys become a count; nested objects fall into
 * the leftover so nothing is silently dropped.
 */
export function parseKycData(
  kycData: unknown,
  customerType: string,
): ParsedDossierSection {
  if (!isPlainObject(kycData)) {
    return { fields: [], leftover: null };
  }

  const isBusiness = customerType === 'business';
  const labelMap = isBusiness
    ? { ...INDIVIDUAL_KYC_LABELS, ...BUSINESS_KYC_LABELS }
    : INDIVIDUAL_KYC_LABELS;

  const fields: DossierField[] = [];
  const leftover: [string, unknown][] = [];

  for (const [key, value] of Object.entries(kycData)) {
    const countLabel = ARRAY_COUNT_LABELS[key];
    if (countLabel && Array.isArray(value)) {
      fields.push({ label: countLabel, value: String(value.length) });
      continue;
    }

    const label = labelMap[key];
    if (label) {
      const text = scalarToString(value);
      if (text) fields.push({ label, value: displayValue(key, text) });
      continue;
    }

    // Scalars without a known label still surface as a row (key as readable
    // words), so ops never misses a value; nested structures go to the leftover.
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      const text = scalarToString(value);
      if (text) fields.push({ label: humanizeKey(key), value: displayValue(key, text) });
    } else {
      leftover.push([key, value]);
    }
  }

  return { fields, leftover: buildLeftover(leftover) };
}
