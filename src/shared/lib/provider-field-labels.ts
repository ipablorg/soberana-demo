/**
 * Spanish labels of the customer data providers report missing
 * (`missing_fields`) and of provider requirement keys (S21). Lingui
 * descriptors; callers resolve them with `t`. Shared by the backoffice and the
 * client app, so both name a requirement the same way.
 */

import { msg } from '@lingui/core/macro';
import type { MessageDescriptor } from '@lingui/core';

type Translate = (descriptor: MessageDescriptor) => string;

const FIELD_LABELS: Readonly<Record<string, MessageDescriptor>> = {
  phone: msg`Teléfono de la empresa`,
  formationDate: msg`Fecha de constitución`,
  businessType: msg`Tipo de empresa`,
  businessIndustry: msg`Industria de la empresa`,
  website: msg`Sitio web o motivo por el que no tiene`,
  registrationNumber: msg`Número de registro de la empresa`,
  isFinancialInstitution: msg`¿Es una institución financiera?`,
  numberOfEmployees: msg`Número de empleados`,
  registeredAddress: msg`Dirección de registro`,
  representativeName: msg`Representante legal (nombre y apellido)`,
  businessName: msg`Razón social`,
  email: msg`Correo electrónico`,
  country: msg`País`,
  firstName: msg`Nombre`,
  lastName: msg`Apellido`,
  birthDate: msg`Fecha de nacimiento`,
  gender: msg`Género`,
  occupation: msg`Ocupación`,
  documentNumber: msg`Número de documento`,
  identityDocument: msg`Documento de identidad`,
  // KiraFin `missing_fields` tokens (snake_case), reported as RFI blockers.
  business_name: msg`Razón social`,
  legal_name: msg`Razón social`,
  business_type: msg`Tipo de empresa`,
  business_industry: msg`Industria de la empresa`,
  industry: msg`Industria de la empresa`,
  business_description: msg`Descripción del negocio`,
  incorporation_date: msg`Fecha de constitución`,
  formation_date: msg`Fecha de constitución`,
  registration_number: msg`Número de registro de la empresa`,
  ein: msg`EIN (número de identificación fiscal de EE. UU.)`,
  tax_id: msg`Número de identificación fiscal`,
  tin: msg`Número de identificación fiscal`,
  primary_website: msg`Sitio web o motivo por el que no tiene`,
  number_of_employees: msg`Número de empleados`,
  is_financial_institution: msg`¿Es una institución financiera?`,
  address: msg`Dirección de registro`,
  street: msg`Dirección de registro`,
  address_line_1: msg`Dirección de registro`,
  city: msg`Ciudad`,
  state: msg`Departamento o estado`,
  postal_code: msg`Código postal`,
  zip_code: msg`Código postal`,
  first_name: msg`Nombre`,
  last_name: msg`Apellido`,
  date_of_birth: msg`Fecha de nacimiento`,
  birth_date: msg`Fecha de nacimiento`,
  nationality: msg`Nacionalidad`,
  document_number: msg`Número de documento`,
  id_number: msg`Número de documento`,
  ssn: msg`SSN (número de seguro social de EE. UU.)`,
  source_of_funds: msg`Origen de los fondos`,
  expected_monthly_volume: msg`Volumen mensual esperado`,
  ownership_percentage: msg`Porcentaje de participación`,
  beneficial_owners: msg`Beneficiarios finales`,
  proof_of_address: msg`Comprobante de domicilio`,
  articles_of_incorporation: msg`Acta de constitución`,
  file_shareholder_registry: msg`Registro de accionistas`,
  shareholder_registry: msg`Registro de accionistas`,
  file_articles_of_incorporation: msg`Acta de constitución`,
  file_proof_of_address: msg`Comprobante de domicilio`,
  file_identity_document: msg`Documento de identidad`,
  identity_document: msg`Documento de identidad`,
  // KiraFin RFI keys (N-6): company, questionnaire, documents and persons.
  company_registration_number: msg`Número de registro de la empresa`,
  account_purpose: msg`Propósito de la cuenta`,
  high_risk_industries: msg`¿Opera en industrias de alto riesgo?`,
  is_nbfi_vasp: msg`¿Es una entidad financiera no bancaria o proveedor de activos virtuales (NBFI/VASP)?`,
  business_legal_history: msg`Historial legal de la empresa`,
  pep_status: msg`¿Es una persona expuesta políticamente (PEP)?`,
  past_owner_interaction: msg`Relación previa con los propietarios`,
  expected_transaction_count: msg`Número de transacciones esperadas al mes`,
  expected_monthly_payments: msg`Pagos mensuales esperados`,
  transaction_countries: msg`Países con los que opera`,
  tos_accepted_version: msg`Aceptación de los términos del proveedor`,
  beneficial_owner: msg`Beneficiario final`,
  phone_number: msg`Teléfono`,
  address_street: msg`Dirección (calle)`,
  address_city: msg`Ciudad`,
  address_state: msg`Departamento o estado`,
  address_zip_code: msg`Código postal`,
  address_country: msg`País de residencia`,
  document_type: msg`Tipo de documento`,
  country_of_birth: msg`País de nacimiento`,
  aggregate_ownership: msg`Porcentaje de participación total`,
  director_appointment_date: msg`Fecha de nombramiento como director`,
  representing_start_date: msg`Fecha de inicio como representante`,
  tax_residence_country: msg`País de residencia fiscal`,
  'identifying_information:front': msg`Documento de identidad (frente)`,
  'identifying_information:back': msg`Documento de identidad (reverso)`,
  'identifying_information:file_proof_of_address': msg`Comprobante de domicilio`,
  // Mesta business documents (SENDER_BUSINESS_DOCUMENTS_NOT_ADDED asks both).
  address_proof: msg`Comprobante de domicilio de la empresa`,
  business_registration_proof: msg`Comprobante de registro mercantil`,
  file_business_formation: msg`Documento de constitución de la empresa`,
  file_certificate_of_good_standing: msg`Certificado de vigencia (good standing)`,
  file_director_registry: msg`Registro de directores`,
  file_bylaws: msg`Estatutos de la empresa`,
  file_company_fiscal_registration: msg`Registro fiscal de la empresa`,
  file_fatca: msg`Formulario FATCA`,
  file_portfolio_statement: msg`Estado de portafolio`,
  file_certificate_of_registration: msg`Certificado de registro`,
  file_source_of_wealth: msg`Soporte del origen del patrimonio`,
  file_ein_letter: msg`Carta de asignación del EIN`,
};

/**
 * Provider status codes (not a field) as a sentence ops can act on. `{0}` is
 * not used: a provider name is part of the code family below.
 */
const BLOCKER_CODE_LABELS: Readonly<Record<string, MessageDescriptor>> = {
  WALLET_NOT_PROVISIONED: msg`El cliente todavía no tiene billetera: créela antes de reintentar el alta.`,
  MESTA_UNSUPPORTED_STATE: msg`Mesta no atiende empresas registradas en este estado de EE. UU.`,
  MESTA_UNSUPPORTED_COUNTRY: msg`Mesta no atiende empresas de este país.`,
  KIRAFIN_UNSUPPORTED_STATE: msg`KiraFin no atiende empresas registradas en este estado de EE. UU.`,
  KIRAFIN_UNSUPPORTED_COUNTRY: msg`KiraFin no atiende empresas de este país.`,
  MESTA_UBO_NOT_CREATED: msg`Beneficiarios finales de la empresa (Mesta aún no los tiene)`,
  MESTA_SENDER_BUSINESS_DOCUMENTS_NOT_ADDED: msg`Documentos de la empresa: comprobante de domicilio y de registro mercantil`,
};

/** Provider rejections without a known reason; the provider detail is appended. */
const UNKNOWN_REJECTION_LABELS: Readonly<Record<string, MessageDescriptor>> = {
  MESTA_UNKNOWN: msg`Mesta rechazó el alta sin un motivo reconocido`,
  MESTA_UNKNOWN_BLOCKER: msg`Mesta rechazó el alta sin un motivo reconocido`,
  KIRAFIN_UNKNOWN: msg`KiraFin rechazó el alta sin un motivo reconocido`,
  MESTA_VERIFY_FAILED: msg`Mesta no pudo iniciar la verificación`,
};

/** Provider sections of a grouped token (`associated_persons:nationality`). */
const GROUP_LABELS: Readonly<Record<string, MessageDescriptor>> = {
  associated_persons: msg`Personas asociadas`,
  identifying_information: msg`Documentos de la empresa`,
  additional_info: msg`Información adicional`,
  business_profile: msg`Perfil de la empresa`,
};

/** Fallback translation when no `t` is at hand: the source (Spanish) text. */
export const sourceText: Translate = (descriptor) => descriptor.message ?? descriptor.id;

/** Every VA strategy field reported in a `<PROVIDER>_MISSING_<FIELD>` code. */
const MISSING_CODE_FIELDS: Readonly<Record<string, string>> = {
  BUSINESSNAME: 'businessName',
  EMAIL: 'email',
  COUNTRY: 'country',
  PHONE: 'phone',
  FORMATIONDATE: 'formationDate',
  BUSINESSTYPE: 'businessType',
  REGISTRATIONNUMBER: 'registrationNumber',
  ISFINANCIALINSTITUTION: 'isFinancialInstitution',
  NUMBEROFEMPLOYEES: 'numberOfEmployees',
  WEBSITEABSENCEREASON: 'website',
  ADDRESS: 'registeredAddress',
  REPRESENTATIVE: 'representativeName',
  FIRSTNAME: 'firstName',
  LASTNAME: 'lastName',
  BIRTHDATE: 'birthDate',
  GENDER: 'gender',
  OCCUPATION: 'occupation',
  DOCUMENTNUMBER: 'documentNumber',
  IDENTITYDOCUMENT: 'identityDocument',
};

/**
 * The field a VA blocker code asks for (`KIRAFIN_RFI_INCORPORATION_DATE` →
 * `incorporation_date`, `MESTA_MISSING_FORMATIONDATE` → `formationDate`), or
 * `null` when the code is not a missing-data blocker.
 */
export function providerBlockerField(code: string): string | null {
  const missing = /^[A-Z]+_MISSING_(.+)$/.exec(code);
  if (missing) return MISSING_CODE_FIELDS[missing[1]] ?? missing[1].toLowerCase();
  const rfi = /^[A-Z]+_RFI_(.+)$/.exec(code);
  if (rfi) return rfi[1].toLowerCase();
  return null;
}

/** Label of a backend missing-field name; unknown names are shown as they come. */
export function providerFieldLabel(field: string, t: Translate): string {
  const descriptor = FIELD_LABELS[field] ?? BLOCKER_CODE_LABELS[field];
  if (descriptor) return t(descriptor);

  const separator = field.indexOf(':');
  if (separator > 0) {
    const group = GROUP_LABELS[field.slice(0, separator)];
    const token = field.slice(separator + 1);
    const tokenLabel = FIELD_LABELS[token] ? t(FIELD_LABELS[token]) : token;
    return group ? `${t(group)}: ${tokenLabel}` : `${field.slice(0, separator)}: ${tokenLabel}`;
  }

  return field;
}

/**
 * A VA blocker as ops reads it: a status code as a sentence, a missing-data
 * code by its structured key (the provider message may be redacted), and any
 * other code by its message (or the code itself).
 */
export function providerBlockerLabel(
  code: string,
  message: string | null | undefined,
  t: Translate
): string {
  const sentence = BLOCKER_CODE_LABELS[code];
  if (sentence) return t(sentence);

  const detail = message?.trim() ?? '';
  const unknown = UNKNOWN_REJECTION_LABELS[code];
  if (unknown) return detail ? `${t(unknown)}: ${detail}` : `${t(unknown)}.`;

  const field = providerBlockerField(code);
  if (field) return providerFieldLabel(field, t);

  return detail || code;
}

export type ProviderFieldGroupId =
  'documents' | 'ownership' | 'questionnaire' | 'company' | 'other';

export interface ProviderFieldGroup {
  id: ProviderFieldGroupId;
  title: string;
  items: { key: string; label: string }[];
}

const GROUP_TITLES: Readonly<Record<ProviderFieldGroupId, MessageDescriptor>> = {
  documents: msg`Documentos`,
  ownership: msg`Propietarios y representantes`,
  questionnaire: msg`Cuestionario de cumplimiento`,
  company: msg`Datos de la empresa`,
  other: msg`Otros`,
};

/** Compliance questionnaire answers the provider asks (KiraFin RFI). */
const QUESTIONNAIRE_KEYS: ReadonlySet<string> = new Set([
  'account_purpose',
  'source_of_funds',
  'high_risk_industries',
  'is_nbfi_vasp',
  'business_legal_history',
  'pep_status',
  'expected_monthly_volume',
  'expected_transaction_count',
  'expected_monthly_payments',
  'transaction_countries',
  'tos_accepted_version',
]);

const GROUP_ORDER: readonly ProviderFieldGroupId[] = [
  'documents',
  'ownership',
  'questionnaire',
  'company',
  'other',
];

function groupOf(key: string): ProviderFieldGroupId {
  const tokens = key.split(':');
  const last = tokens[tokens.length - 1];
  if (
    tokens[0] === 'identifying_information' ||
    tokens.includes('identifying_information') ||
    last.startsWith('file_')
  ) {
    return 'documents';
  }
  if (tokens[0] === 'associated_persons' || key === 'beneficial_owners') return 'ownership';
  if (QUESTIONNAIRE_KEYS.has(key) || tokens[0] === 'additional_info') return 'questionnaire';
  if (FIELD_LABELS[key]) return 'company';
  return 'other';
}

/** Label of a key inside its group, without the provider section prefix. */
function groupedLabel(key: string, t: Translate): string {
  const separator = key.indexOf(':');
  if (separator < 0 || FIELD_LABELS[key]) return providerFieldLabel(key, t);
  const token = key.slice(separator + 1);
  const descriptor = FIELD_LABELS[token];
  return descriptor ? t(descriptor) : token;
}

/**
 * Missing items grouped as ops handles them with the provider: documents,
 * owners and representatives, the compliance questionnaire, and the rest.
 * Keys keep their order inside each group; empty groups are left out.
 */
export function groupProviderFields(keys: readonly string[], t: Translate): ProviderFieldGroup[] {
  return GROUP_ORDER.map((id) => ({
    id,
    title: t(GROUP_TITLES[id]),
    items: keys
      .filter((key) => groupOf(key) === id)
      .map((key) => ({ key, label: groupedLabel(key, t) })),
  })).filter((group) => group.items.length > 0);
}
