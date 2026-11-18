/**
 * "Solicitar cuenta virtual" in Customer 360.
 *
 * Commercial, operations and the super admin request a virtual account for a
 * customer from the backoffice (`adminLoopay_requestVirtualAccount`); the
 * customer app only shows the accounts. The backend runs the same service as
 * before: business-only (VA_BUSINESS_ONLY), rail maintenance, idempotent per
 * customer and rail, and the request still goes to the operations review queue.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';

import type {
  AdminClientKycStatus,
  AdminReceiveOption,
  AdminRequestVirtualAccountInput,
} from '@/graphql/types/admin-loopay';

import { providerDisplayName } from '@/shared/lib/rail-provider-labels';

import { railDisplayName } from '../../ops-review/lib/ops-value-labels';

const RECEIVE_OPTION_FIELDS = `
  country
  currency
  railCode
  railName
  provider
  providers
  status
  requestId
  virtualAccountId
  vaRequestState
  blockers {
    code
    category
    message
  }
  reason
  eligible
  ineligibleReason
`;

export interface CustomerReceiveOptionsQuery {
  adminLoopay_customerReceiveOptions: AdminReceiveOption[];
}

export interface CustomerReceiveOptionsQueryVariables {
  customerId: string;
  country?: string;
}

export const CustomerReceiveOptionsDocument = parse(/* GraphQL */ `
  query AdminLoopayCustomerReceiveOptions($customerId: String!, $country: String) {
    adminLoopay_customerReceiveOptions(customerId: $customerId, country: $country) {
      ${RECEIVE_OPTION_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  CustomerReceiveOptionsQuery,
  CustomerReceiveOptionsQueryVariables
>;

export type RequestVirtualAccountBlockReason = 'kyc_not_approved';

export interface RequestVirtualAccountAvailability {
  visible: boolean;
  enabled: boolean;
  blockedReason: RequestVirtualAccountBlockReason | null;
}

export function getRequestVirtualAccountAvailability({
  canRequest,
  kycStatus,
}: {
  canRequest: boolean;
  kycStatus: AdminClientKycStatus;
}): RequestVirtualAccountAvailability {
  if (!canRequest) {
    return { visible: false, enabled: false, blockedReason: null };
  }

  if (kycStatus !== 'APPROVED') {
    return { visible: true, enabled: false, blockedReason: 'kyc_not_approved' };
  }

  return { visible: true, enabled: true, blockedReason: null };
}

export interface ReceiveOptionRow {
  key: string;
  label: string;
  provider: string;
  statusLabel: string;
  /** `request` only for an eligible, still available option. */
  action: 'request' | 'none';
  note: string | null;
  option: AdminReceiveOption;
}

const STATUS_LABELS: Record<AdminReceiveOption['status'], string> = {
  available: 'Disponible',
  requested: 'Solicitada',
  active: 'Activa',
  rejected: 'Rechazada',
};

const INELIGIBLE_NOTES: Record<NonNullable<AdminReceiveOption['ineligibleReason']>, string> = {
  VA_BUSINESS_ONLY: 'Solo empresas (incluye unipersonales)',
  RAIL_UNDER_MAINTENANCE: 'Riel en mantenimiento',
};

function noteFor(option: AdminReceiveOption): string | null {
  if (option.status === 'rejected') return option.reason;
  if (!option.eligible && option.ineligibleReason) {
    return INELIGIBLE_NOTES[option.ineligibleReason];
  }

  return null;
}

export function describeReceiveOptions(options: readonly AdminReceiveOption[]): ReceiveOptionRow[] {
  return options.map((option) => ({
    key: `${option.country}-${option.currency}-${option.railCode}`,
    label: `${railDisplayName(option.railName)} · ${option.country} · ${option.currency}`,
    provider: providerDisplayName(option.provider),
    statusLabel: STATUS_LABELS[option.status],
    action: option.status === 'available' && option.eligible ? 'request' : 'none',
    note: noteFor(option),
    option,
  }));
}

export function buildRequestVirtualAccountInput(
  customerId: string,
  option: AdminReceiveOption
): AdminRequestVirtualAccountInput {
  return {
    customerId,
    country: option.country,
    currency: option.currency,
    railCode: option.railCode,
  };
}

const ERROR_MESSAGES: Record<string, string> = {
  VA_BUSINESS_ONLY: 'Las cuentas virtuales son solo para empresas (incluye unipersonales).',
  RAIL_UNDER_MAINTENANCE: 'El riel está en mantenimiento. Inténtalo más tarde.',
  KYC_NOT_APPROVED: 'El cliente necesita el KYC aprobado.',
  RAIL_NOT_AVAILABLE: 'Ese riel no está disponible para este país y moneda.',
  VA_REQUEST_EXISTS: 'Ya existe una solicitud para este riel.',
};

interface BackendError {
  response?: {
    errors?: {
      message?: string;
      extensions?: { error_code?: string; code?: string };
    }[];
  };
  message?: string;
}

/** Friendly Spanish text for the known request failures; undefined for anything else. */
export function classifyRequestVirtualAccountError(error: unknown): string | undefined {
  const failure = error as BackendError;
  const first = failure?.response?.errors?.[0];
  const haystack = [
    first?.extensions?.error_code,
    first?.extensions?.code,
    first?.message,
    failure?.message,
  ].filter((part): part is string => typeof part === 'string');

  for (const code of Object.keys(ERROR_MESSAGES)) {
    if (haystack.some((part) => part.includes(code))) return ERROR_MESSAGES[code];
  }

  return undefined;
}
