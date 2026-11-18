/**
 * Pure view logic for the commercial backoffice screens: status badges,
 * payload builders and dialog validation. No React, no i18n; validation
 * returns stable error codes that the components translate.
 */

import type {
  ClientProviderOnboarding,
  CommercialOnboardingStatus,
  FeeLedgerTotal,
  FeeMode,
  FeeOperation,
} from '@/graphql/queries/admin-commercial';
import type {
  CreateAndOnboardClientInput,
  CreateFeeScheduleInput,
} from '@/graphql/mutations/admin-commercial';

/** Staff role of the commercial team (LOOPAY_ADMIN always passes). */
export const COMMERCIAL_ROLE = 'OPS_COMMERCIAL';

export const COMMERCIAL_QUERY_ROOT = 'admin-commercial' as const;

export const commercialQueryKeys = {
  onboarding: (clientId: string) => [COMMERCIAL_QUERY_ROOT, 'onboarding', clientId] as const,
  schedules: (clientId: string) => [COMMERCIAL_QUERY_ROOT, 'schedules', clientId] as const,
  ledger: (clientId: string) => [COMMERCIAL_QUERY_ROOT, 'ledger', clientId] as const,
  summary: (clientId: string) => [COMMERCIAL_QUERY_ROOT, 'summary', clientId] as const,
  providerRails: [COMMERCIAL_QUERY_ROOT, 'provider-rails'] as const,
  clientRails: (clientId: string) => [COMMERCIAL_QUERY_ROOT, 'client-rails', clientId] as const,
  /** #411 Setup screen: readiness and first customer / virtual account of one client. */
  setup: (clientId: string) => [COMMERCIAL_QUERY_ROOT, 'setup', clientId] as const,
};

/** Providers a client can be onboarded at (backend `ONBOARDING_PROVIDER_CODES`). */
export const ONBOARDING_PROVIDERS = ['mesta', 'kirafin'] as const;
export type OnboardingProvider = string;

/**
 * Providers that expose a client-onboarding API (backend
 * `ONBOARDING_PROVIDER_CODES`). The catalog decides which of them are active;
 * this set only keeps non-onboarding providers (bridge, loopayx...) out.
 */
const ONBOARDING_CAPABLE_CODES: ReadonlySet<string> = new Set(ONBOARDING_PROVIDERS);

/**
 * Onboarding providers derived from `adminLoopay_listProviders`: active and
 * onboarding-capable. Falls back to the static list when the catalog is
 * unavailable (query failed, denied for the role) or yields nothing.
 */
export function deriveOnboardingProviders(
  catalog: readonly { code: string; is_active: boolean }[] | null | undefined
): readonly OnboardingProvider[] {
  const derived = (catalog ?? [])
    .filter((p) => p.is_active && ONBOARDING_CAPABLE_CODES.has(p.code))
    .map((p) => p.code);

  return derived.length > 0 ? derived : ONBOARDING_PROVIDERS;
}

export const FEE_OPERATIONS: readonly FeeOperation[] = [
  'VA_CREATION',
  'DEPOSIT',
  'WITHDRAWAL',
  'PAYOUT',
  'P2P',
  'CRYPTO_TRANSFER',
];

export const FEE_MODES: readonly FeeMode[] = ['FIXED', 'PERCENT'];

/** Max length of the manual-link note (backend contract). */
export const MANUAL_LINK_NOTE_MAX = 500;

export type BadgeVariant = 'success' | 'warning' | 'destructive' | 'secondary';

/** Badge variant per onboarding status. */
export function onboardingBadgeVariant(status: CommercialOnboardingStatus): BadgeVariant {
  switch (status) {
    case 'LINKED':
      return 'success';
    case 'MANUAL':
      return 'secondary';
    case 'FAILED':
      return 'destructive';
    case 'PENDING':
    default:
      return 'warning';
  }
}

/** Retry is offered only while the provider is not yet linked. */
export function canRetryProvider(status: CommercialOnboardingStatus): boolean {
  return status === 'PENDING' || status === 'FAILED';
}

/** Manual link is refused by the backend once LINKED through the API. */
export function canLinkManually(status: CommercialOnboardingStatus): boolean {
  return status !== 'LINKED';
}

/** Providers that "Onboard all pending" would call (LINKED/MANUAL are skipped). */
export function pendingProviders(rows: readonly ClientProviderOnboarding[]): string[] {
  return rows.filter((row) => canRetryProvider(row.status)).map((r) => r.providerCode);
}

/** Short, PII-free rendering of an attempt summary object. */
export function summarizeJson(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value !== 'object') return String(value);
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return '—';
  return entries
    .map(
      ([key, entry]) =>
        `${key}=${typeof entry === 'object' ? JSON.stringify(entry) : String(entry)}`
    )
    .join(', ');
}

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** The backend parses client ids as UUID v4; reject anything else up front. */
export function isClientIdValid(raw: string): boolean {
  return UUID_V4.test(raw.trim());
}

// ---------------------------------------------------------------------------
// Create & onboard
// ---------------------------------------------------------------------------

export interface CreateClientFormState {
  name: string;
  email: string;
  taxId: string;
  taxIdTypeId: string;
  country: string;
  providers: readonly OnboardingProvider[];
  /** `null` = never edited: follows the client country (the system already knows it). */
  allowedCountries: readonly string[] | null;
}

export const EMPTY_CREATE_CLIENT_FORM: CreateClientFormState = {
  name: '',
  email: '',
  taxId: '',
  taxIdTypeId: '',
  country: '',
  providers: ONBOARDING_PROVIDERS,
  allowedCountries: null,
};

/** Countries the client operates in: the chosen ones, else its own country. */
export function effectiveAllowedCountries(form: CreateClientFormState): readonly string[] {
  if (form.allowedCountries !== null) return form.allowedCountries;
  const own = form.country.trim().toUpperCase();

  return /^[A-Z]{3}$/.test(own) ? [own] : [];
}

export function isCreateClientFormValid(form: CreateClientFormState): boolean {
  return (
    form.name.trim() !== '' &&
    form.email.trim() !== '' &&
    form.taxId.trim() !== '' &&
    form.taxIdTypeId.trim() !== '' &&
    /^[A-Za-z]{3}$/.test(form.country.trim()) &&
    form.providers.length > 0 &&
    effectiveAllowedCountries(form).length > 0
  );
}

export function buildCreateAndOnboardInput(
  form: CreateClientFormState
): CreateAndOnboardClientInput {
  return {
    name: form.name.trim(),
    email: form.email.trim(),
    taxId: form.taxId.trim(),
    taxIdTypeId: form.taxIdTypeId.trim(),
    country: form.country.trim().toUpperCase(),
    providers: [...form.providers],
    allowedCustomerCountries: [...effectiveAllowedCountries(form)],
  };
}

// ---------------------------------------------------------------------------
// Manual link dialog
// ---------------------------------------------------------------------------

export type ManualLinkError = 'ID_REQUIRED' | 'NOTE_REQUIRED' | 'NOTE_TOO_LONG';

export function validateManualLink(input: {
  providerCustomerId: string;
  note: string;
}): ManualLinkError | null {
  if (input.providerCustomerId.trim() === '') return 'ID_REQUIRED';
  const note = input.note.trim();
  if (note === '') return 'NOTE_REQUIRED';
  if (note.length > MANUAL_LINK_NOTE_MAX) return 'NOTE_TOO_LONG';
  return null;
}

export function buildManualLinkVariables(
  clientId: string,
  provider: string,
  input: { providerCustomerId: string; note: string }
) {
  return {
    clientId,
    provider,
    providerCustomerId: input.providerCustomerId.trim(),
    note: input.note.trim(),
  };
}

// ---------------------------------------------------------------------------
// Fee schedule dialog (decimals are strings per the backend contract)
// ---------------------------------------------------------------------------

export interface FeeScheduleFormState {
  railCode: string;
  operation: FeeOperation;
  mode: FeeMode;
  value: string;
  minAmount: string;
  maxAmount: string;
  currency: string;
}

export const EMPTY_FEE_SCHEDULE_FORM: FeeScheduleFormState = {
  railCode: '',
  operation: 'DEPOSIT',
  mode: 'PERCENT',
  value: '',
  minAmount: '',
  maxAmount: '',
  currency: '',
};

export type FeeScheduleError =
  | 'VALUE_INVALID'
  | 'PERCENT_OUT_OF_RANGE'
  | 'MIN_INVALID'
  | 'MAX_INVALID'
  | 'MIN_GREATER_THAN_MAX'
  | 'CURRENCY_INVALID';

const DECIMAL = /^\d+(\.\d{1,8})?$/;

export function isValidDecimalString(raw: string): boolean {
  return DECIMAL.test(raw.trim());
}

/** Scales a validated decimal string to an integer (8 decimals) for exact compare. */
function toScaled(raw: string): bigint {
  const [whole, frac = ''] = raw.trim().split('.');
  return BigInt(whole + frac.padEnd(8, '0'));
}

export function validateFeeSchedule(form: FeeScheduleFormState): FeeScheduleError | null {
  const value = form.value.trim();
  if (!isValidDecimalString(value)) return 'VALUE_INVALID';
  if (form.mode === 'PERCENT' && toScaled(value) > toScaled('100')) {
    return 'PERCENT_OUT_OF_RANGE';
  }
  const min = form.minAmount.trim();
  const max = form.maxAmount.trim();
  if (min !== '' && !isValidDecimalString(min)) return 'MIN_INVALID';
  if (max !== '' && !isValidDecimalString(max)) return 'MAX_INVALID';
  if (min !== '' && max !== '' && toScaled(min) > toScaled(max)) {
    return 'MIN_GREATER_THAN_MAX';
  }
  const currency = form.currency.trim();
  if (currency !== '' && !/^[A-Za-z]{3,10}$/.test(currency)) {
    return 'CURRENCY_INVALID';
  }
  return null;
}

export function buildFeeScheduleInput(
  clientId: string,
  form: FeeScheduleFormState
): CreateFeeScheduleInput {
  const orNull = (raw: string) => (raw.trim() === '' ? null : raw.trim());
  return {
    clientId,
    railCode: orNull(form.railCode),
    operation: form.operation,
    mode: form.mode,
    value: form.value.trim(),
    minAmount: orNull(form.minAmount),
    maxAmount: orNull(form.maxAmount),
    // A currency only makes sense for a flat fee.
    currency: form.mode === 'FIXED' ? orNull(form.currency.toUpperCase()) : null,
  };
}

/** `12.5` PERCENT -> `12.5%`; FIXED keeps the currency when known. */
export function formatFeeValue(mode: FeeMode, value: string, currency: string | null): string {
  return mode === 'PERCENT' ? `${value}%` : `${value} ${currency ?? ''}`.trim();
}

// ---------------------------------------------------------------------------
// Ledger filters + summary
// ---------------------------------------------------------------------------

export interface LedgerFilterState {
  /** `YYYY-MM-DD` from a date input, inclusive. */
  from: string;
  /** `YYYY-MM-DD` from a date input, inclusive in the UI. */
  to: string;
  operation: FeeOperation | '';
}

export const EMPTY_LEDGER_FILTER: LedgerFilterState = {
  from: '',
  to: '',
  operation: '',
};

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The backend `to` is exclusive, the date input is inclusive: send the start of
 * the following UTC day so the chosen end date is fully included.
 */
export function buildLedgerVariables(clientId: string, f: LedgerFilterState) {
  const from = ISO_DAY.test(f.from) ? `${f.from}T00:00:00.000Z` : null;
  let to: string | null = null;
  if (ISO_DAY.test(f.to)) {
    const next = new Date(`${f.to}T00:00:00.000Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    to = next.toISOString();
  }
  return { clientId, from, to, operation: f.operation === '' ? null : f.operation };
}

export function isLedgerRangeValid(f: LedgerFilterState): boolean {
  return !(ISO_DAY.test(f.from) && ISO_DAY.test(f.to) && f.from > f.to);
}

/** Groups the summary rows by operation so each shows its per-currency totals. */
export function groupSummaryByOperation(
  totals: readonly FeeLedgerTotal[]
): { operation: FeeOperation; totals: { currency: string; total: string }[] }[] {
  const byOperation = new Map<FeeOperation, { currency: string; total: string }[]>();
  for (const row of totals) {
    const list = byOperation.get(row.operation) ?? [];
    list.push({ currency: row.currency, total: row.total });
    byOperation.set(row.operation, list);
  }
  return [...byOperation.entries()].map(([operation, rows]) => ({
    operation,
    totals: rows.sort((a, b) => a.currency.localeCompare(b.currency)),
  }));
}
