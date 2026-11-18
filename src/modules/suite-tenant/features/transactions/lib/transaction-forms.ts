/**
 * Money-moving forms of the tenant backoffice, built from the REST DTOs the
 * back validates (`CreateOffRampDto`, `CreateDispersionDto`,
 * `CreateCryptoTransferDto`, `CreatePaymentLinkDto`). Client-side checks
 * mirror those DTOs so the admin sees the problem before the call; the back
 * still validates everything.
 *
 * `client_reference_id` (idempotency key) is not typed by the admin: the
 * screen derives it per intent with `useConfirmIntentKey`.
 */

import type {
  TenantDispersionInput,
  TenantOffRampInput,
  TenantPaymentLinkInput,
  TenantTransferInput,
} from '@/graphql/types/tenant';

export type TransactionKind = 'off_ramp' | 'dispersion' | 'transfer' | 'payment_link';

export const TRANSACTION_KINDS: readonly TransactionKind[] = [
  'off_ramp',
  'dispersion',
  'transfer',
  'payment_link',
];

/** Purposes `CreatePaymentLinkDto` accepts (`@IsIn`). */
export const PAYMENT_LINK_PURPOSES = [
  'PERSONAL_ACCOUNT',
  'INVESTMENT',
  'REAL_ESTATE',
  'TRADE_TRANSACTIONS',
  'TAX',
  'LOAN',
  'BILLS',
  'EXPENSES_REIMBURSEMENT',
  'PROFESSIONAL_SERVICES',
] as const;

/** Rails that take (and require) `return_url` + `payer_details`. */
const ECUADOR_RAILS = ['ec_bank_transfer', 'ec_point_of_sale'];

export function isEcuadorRail(railCode: string): boolean {
  return ECUADOR_RAILS.includes(railCode.trim().toLowerCase());
}

export interface TransactionFormValues {
  customer_id: string;
  wallet_id: string;
  beneficiary_id: string;
  amount: string;
  currency: string;
  quote_id: string;
  to_address: string;
  chain: string;
  rail_code: string;
  purpose: string;
  expires_in_minutes: string;
  return_url: string;
  payer_full_name: string;
  payer_document_type: string;
  payer_document_number: string;
  payer_email: string;
  payer_phone: string;
}

export type TransactionFormField = keyof TransactionFormValues;

export type TransactionFormError =
  'required' | 'amount' | 'minutes' | 'https_url' | 'email' | 'uuid';

export type TransactionFormErrors = Partial<Record<TransactionFormField, TransactionFormError>>;

export const EMPTY_TRANSACTION_FORM: TransactionFormValues = {
  customer_id: '',
  wallet_id: '',
  beneficiary_id: '',
  amount: '',
  currency: '',
  quote_id: '',
  to_address: '',
  chain: '',
  rail_code: '',
  purpose: '',
  expires_in_minutes: '',
  return_url: '',
  payer_full_name: '',
  payer_document_type: '',
  payer_document_number: '',
  payer_email: '',
  payer_phone: '',
};

/** Fields each kind shows (and sends). */
export const FIELDS_BY_KIND: Readonly<Record<TransactionKind, readonly TransactionFormField[]>> = {
  off_ramp: ['customer_id', 'wallet_id', 'beneficiary_id', 'amount', 'currency', 'quote_id'],
  dispersion: ['customer_id', 'wallet_id', 'beneficiary_id', 'amount', 'currency'],
  transfer: ['customer_id', 'wallet_id', 'to_address', 'amount', 'currency', 'chain'],
  payment_link: [
    'customer_id',
    'wallet_id',
    'amount',
    'currency',
    'rail_code',
    'purpose',
    'expires_in_minutes',
  ],
};

/**
 * Kinds whose currency is always the source wallet's: an off-ramp becomes a
 * dispersion on the back, which refuses any other currency (400 "Dispersion
 * currency must match the wallet currency"). The form prefills and locks it.
 */
export function currencyFollowsWallet(kind: TransactionKind): boolean {
  return kind === 'off_ramp';
}

/** Currency of the wallet `walletId` among `wallets`, or '' when none is chosen. */
export function walletCurrencyOf(
  walletId: string,
  wallets: readonly { id: string; currency: string }[]
): string {
  return wallets.find((wallet) => wallet.id === walletId)?.currency ?? '';
}

export const PAYER_FIELDS: readonly TransactionFormField[] = [
  'return_url',
  'payer_full_name',
  'payer_document_type',
  'payer_document_number',
  'payer_email',
  'payer_phone',
];

const REQUIRED_BY_KIND: Readonly<Record<TransactionKind, readonly TransactionFormField[]>> = {
  off_ramp: ['wallet_id', 'beneficiary_id', 'amount', 'currency'],
  dispersion: ['wallet_id', 'beneficiary_id', 'amount', 'currency'],
  transfer: ['wallet_id', 'to_address', 'amount', 'currency', 'chain'],
  payment_link: ['customer_id', 'wallet_id', 'amount', 'currency', 'rail_code'],
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function amountOf(value: string): number {
  return Number(value.trim().replace(',', '.'));
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

/** Fields the kind shows, including the payer block for Ecuador payment links. */
export function visibleFields(
  kind: TransactionKind,
  values: TransactionFormValues
): TransactionFormField[] {
  const fields = [...FIELDS_BY_KIND[kind]];
  if (kind === 'payment_link' && isEcuadorRail(values.rail_code)) fields.push(...PAYER_FIELDS);

  return fields;
}

export function validateTransactionForm(
  kind: TransactionKind,
  values: TransactionFormValues
): TransactionFormErrors {
  const errors: TransactionFormErrors = {};
  const required = [...REQUIRED_BY_KIND[kind]];
  if (kind === 'payment_link' && isEcuadorRail(values.rail_code)) required.push(...PAYER_FIELDS);

  for (const field of required) {
    if (!values[field].trim()) errors[field] = 'required';
  }

  if (!errors.amount) {
    const amount = amountOf(values.amount);
    if (!Number.isFinite(amount) || amount < 0.01) errors.amount = 'amount';
  }

  if (kind === 'payment_link') {
    for (const field of ['customer_id', 'wallet_id'] as const) {
      if (!errors[field] && !UUID.test(values[field].trim())) errors[field] = 'uuid';
    }
    const minutes = values.expires_in_minutes.trim();
    if (minutes && (!Number.isInteger(Number(minutes)) || Number(minutes) < 1)) {
      errors.expires_in_minutes = 'minutes';
    }
    if (isEcuadorRail(values.rail_code)) {
      if (!errors.return_url && !isHttpsUrl(values.return_url.trim()))
        errors.return_url = 'https_url';
      if (!errors.payer_email && !EMAIL.test(values.payer_email.trim()))
        errors.payer_email = 'email';
    }
  }

  return errors;
}

/** Same intent ⇔ same fingerprint: the idempotency key survives retries of one intent only. */
export function intentFingerprint(kind: TransactionKind, values: TransactionFormValues): string {
  return [kind, ...visibleFields(kind, values).map((field) => values[field].trim())].join('|');
}

export type TransactionInput =
  | { kind: 'off_ramp'; input: TenantOffRampInput }
  | { kind: 'dispersion'; input: TenantDispersionInput }
  | { kind: 'transfer'; input: TenantTransferInput }
  | { kind: 'payment_link'; input: TenantPaymentLinkInput };

/** REST body of the chosen kind (only its fields, empty optionals omitted). */
export function toTransactionInput(
  kind: TransactionKind,
  values: TransactionFormValues,
  clientReferenceId: string
): TransactionInput {
  const v = (field: TransactionFormField) => values[field].trim();
  const amount = amountOf(values.amount);
  const currency = v('currency').toUpperCase();

  switch (kind) {
    case 'off_ramp': {
      const input: TenantOffRampInput = {
        wallet_id: v('wallet_id'),
        beneficiary_id: v('beneficiary_id'),
        amount,
        currency,
        client_reference_id: clientReferenceId,
      };
      if (v('quote_id')) input.quote_id = v('quote_id');
      return { kind, input };
    }
    case 'dispersion':
      return {
        kind,
        input: {
          wallet_id: v('wallet_id'),
          beneficiary_id: v('beneficiary_id'),
          amount,
          currency,
          client_reference_id: clientReferenceId,
        },
      };
    case 'transfer':
      return {
        kind,
        input: {
          wallet_id: v('wallet_id'),
          to_address: v('to_address'),
          amount,
          currency,
          chain: v('chain'),
          client_reference_id: clientReferenceId,
        },
      };
    case 'payment_link': {
      const input: TenantPaymentLinkInput = {
        customer_id: v('customer_id'),
        wallet_id: v('wallet_id'),
        amount,
        currency,
        rail_code: v('rail_code'),
      };
      if (v('purpose')) input.purpose = v('purpose');
      if (v('expires_in_minutes')) input.expires_in_minutes = Number(v('expires_in_minutes'));
      if (isEcuadorRail(input.rail_code)) {
        input.return_url = v('return_url');
        input.payer_details = {
          full_name: v('payer_full_name'),
          document_type: v('payer_document_type'),
          document_number: v('payer_document_number'),
          email: v('payer_email'),
          phone: v('payer_phone'),
        };
      }
      return { kind, input };
    }
  }
}
