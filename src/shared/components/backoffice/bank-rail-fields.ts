/**
 * Rail-specific bank-detail field definitions shared by `BankDetailsDisplay`
 * and `BankDetailsForm`.
 *
 * `bankDetails` is a freeform `GraphQLJSON` column, so the keys here are the
 * conventions the platform stores. Rails without a definition fall back to a raw
 * JSON editor/view; the backend still asks them an account number.
 *
 * Pure logic (no React) so it stays unit-testable in the default node env.
 */

export type BankFieldFormat = 'mono' | 'clabe';

export interface BankRailFieldDef {
  /** JSON key inside the `bankDetails` object. */
  key: string;
  /** Spanish label shown to ops. */
  label: string;
  format?: BankFieldFormat;
  /** Whether the form treats the field as required. */
  required?: boolean;
  /** Validation pattern for the form input. */
  pattern?: RegExp;
  /** Max length for the form input. */
  maxLength?: number;
  /** Spanish names of known stored values (`checking` → "Corriente"). */
  valueLabels?: Readonly<Record<string, string>>;
}

export interface BankRailDef {
  railCode: string;
  fields: BankRailFieldDef[];
}

const ROUTING_LABEL = 'Número de ruta (routing)';
const ACCOUNT_LABEL = 'Número de cuenta';

const ACCOUNT_TYPE: BankRailFieldDef = {
  key: 'account_type',
  label: 'Tipo de cuenta',
  valueLabels: { checking: 'Corriente', savings: 'Ahorros' },
};

const US_ACH: BankRailFieldDef[] = [
  {
    key: 'routing_number',
    label: ROUTING_LABEL,
    format: 'mono',
    required: true,
    pattern: /^\d{9}$/,
    maxLength: 9,
  },
  { key: 'account_number', label: ACCOUNT_LABEL, format: 'mono', required: true, maxLength: 34 },
  ACCOUNT_TYPE,
];

const US_WIRE: BankRailFieldDef[] = [
  {
    key: 'routing_number',
    label: ROUTING_LABEL,
    format: 'mono',
    required: true,
    pattern: /^\d{9}$/,
    maxLength: 9,
  },
  { key: 'account_number', label: ACCOUNT_LABEL, format: 'mono', required: true, maxLength: 34 },
  { key: 'bank_name', label: 'Banco' },
];

/** ACH virtual account (KiraFin / Mesta `ach` rail): what a payer needs to send. */
const ACH_VA: BankRailFieldDef[] = [
  {
    key: 'routing_number',
    label: ROUTING_LABEL,
    format: 'mono',
    required: true,
    pattern: /^\d{9}$/,
    maxLength: 9,
  },
  { key: 'account_number', label: ACCOUNT_LABEL, format: 'mono', required: true, maxLength: 34 },
  { key: 'bank_name', label: 'Banco', required: true },
];

const SEPA: BankRailFieldDef[] = [
  {
    key: 'iban',
    label: 'IBAN',
    format: 'mono',
    required: true,
    pattern: /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/,
    maxLength: 34,
  },
  { key: 'bic', label: 'BIC / SWIFT', format: 'mono', maxLength: 11 },
  { key: 'holder_name', label: 'Titular' },
];

const SPEI: BankRailFieldDef[] = [
  {
    key: 'clabe',
    label: 'CLABE',
    format: 'clabe',
    required: true,
    pattern: /^\d{18}$/,
    maxLength: 18,
  },
  { key: 'bank_code', label: 'Código de banco', required: true, maxLength: 8 },
];

const PIX: BankRailFieldDef[] = [
  { key: 'pix_key', label: 'PIX Key', format: 'mono', required: true, maxLength: 77 },
  { key: 'key_type', label: 'Tipo de llave' },
];

const CO_BANK: BankRailFieldDef[] = [
  {
    key: 'account_number',
    label: 'Número de cuenta',
    format: 'mono',
    required: true,
    maxLength: 20,
  },
  { key: 'bank_code', label: 'Código de banco', required: true, maxLength: 8 },
  ACCOUNT_TYPE,
];

/** UK Faster Payments: account number and sort code. */
const FASTER_PAYMENTS: BankRailFieldDef[] = [
  { key: 'account_number', label: ACCOUNT_LABEL, format: 'mono', required: true, maxLength: 8 },
  { key: 'sort_code', label: 'Sort code', format: 'mono', required: true, maxLength: 8 },
  { key: 'bank_name', label: 'Banco' },
];

/**
 * Rails a provider console account can be linked on without a definition
 * still need an account number (the backend default).
 */
const DEFAULT_REQUIRED: BankRailFieldDef[] = [
  { key: 'account_number', label: ACCOUNT_LABEL, required: true },
];

const RAIL_DEFS: Record<string, BankRailFieldDef[]> = {
  us_ach: US_ACH,
  ach: ACH_VA,
  us_wire: US_WIRE,
  // KiraFin / Mesta wire and the combined ACH/Wire VA rail (NF-2).
  wire: US_WIRE,
  ach_wire: US_WIRE,
  faster_payments: FASTER_PAYMENTS,
  sepa: SEPA,
  iban: SEPA,
  spei: SPEI,
  pix: PIX,
  co_breb: CO_BANK,
  co_ach: CO_BANK,
};

/** Returns the field set for a rail, or `null` when no structured def exists. */
export function getRailFields(railCode: string): BankRailFieldDef[] | null {
  return RAIL_DEFS[railCode] ?? null;
}

/** Rail codes with a structured field definition (everything else → raw JSON). */
export const STRUCTURED_RAIL_CODES = Object.keys(RAIL_DEFS);

/** Formats a CLABE into groups of 4 for display. */
export function formatClabe(value: string): string {
  return value
    .replace(/\s+/g, '')
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

/** Pretty-prints a single field value according to its format hint. */
export function formatBankFieldValue(value: unknown, format?: BankFieldFormat): string {
  if (value === null || value === undefined) return '';

  const text = String(value);
  if (format === 'clabe') return formatClabe(text);

  return text;
}

/** A stored value as ops reads it: known codes named, others formatted as they are. */
export function displayBankFieldValue(value: unknown, field: BankRailFieldDef): string {
  const text = formatBankFieldValue(value, field.format);
  return field.valueLabels?.[text.trim().toLowerCase()] ?? text;
}

function toCamelCase(key: string): string {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

/**
 * Reads a field value from a `bankDetails` object as a string. Stored
 * beneficiary details use camelCase keys, so the snake_case field key falls
 * back to its camelCase spelling.
 */
export function readBankField(bankDetails: unknown, key: string): string {
  if (!bankDetails || typeof bankDetails !== 'object') return '';

  const record = bankDetails as Record<string, unknown>;
  const value = record[key] ?? record[toCamelCase(key)];

  return value === null || value === undefined ? '' : String(value);
}

/**
 * Validates a `bankDetails` object against the rail's required fields.
 * Returns the list of missing/invalid field labels (empty = valid).
 */
export function validateBankDetails(
  railCode: string,
  bankDetails: Record<string, unknown>
): string[] {
  if (!railCode.trim()) return [];
  const fields = getRailFields(railCode) ?? DEFAULT_REQUIRED;

  const errors: string[] = [];

  for (const field of fields) {
    if (!field.required) continue;

    const value = readBankField(bankDetails, field.key).trim();
    if (value.length === 0) {
      errors.push(field.label);
      continue;
    }

    if (field.pattern && !field.pattern.test(value)) {
      errors.push(field.label);
    }
  }

  return errors;
}
