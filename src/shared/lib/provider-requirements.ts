/**
 * Provider requirements (S21), shared by the client app and the backoffice:
 * Spanish labels of each status and kind, which items the customer still has
 * to answer, and the submit input built from what the customer entered.
 *
 * Lifecycle: REQUESTED → (customer) UPLOADED → (Comercial) APPROVED | REJECTED
 * (→ customer re-uploads → UPLOADED) → (submit) SUBMITTED → (provider) RESOLVED.
 */

import { msg } from '@lingui/core/macro';
import type { MessageDescriptor } from '@lingui/core';

import type {
  ProviderRequirement,
  ProviderRequirementKind,
  ProviderRequirementStatus,
  SubmitProviderRequirementInput,
} from '@/graphql/types/provider-requirements';

type Translate = (descriptor: MessageDescriptor) => string;

/** Files a requirement document may be: PDF, PNG or JPEG. */
export const REQUIREMENT_FILE_TYPES: readonly string[] = [
  'application/pdf',
  'image/png',
  'image/jpeg',
];

/** Largest requirement document: 10 MB. */
export const REQUIREMENT_FILE_MAX_BYTES = 10 * 1024 * 1024;

const STATUS_LABELS: Readonly<Record<ProviderRequirementStatus, MessageDescriptor>> = {
  REQUESTED: msg`Solicitado al cliente`,
  UPLOADED: msg`Por revisar`,
  APPROVED: msg`Aprobado`,
  REJECTED: msg`Rechazado`,
  SUBMITTED: msg`Enviado al proveedor`,
  RESOLVED: msg`Resuelto`,
};

const KIND_LABELS: Readonly<Record<ProviderRequirementKind, MessageDescriptor>> = {
  DOCUMENT: msg`Documento`,
  VALUE: msg`Dato`,
  UBO_LINK: msg`Beneficiario final`,
};

/** Spanish labels of the documented KiraFin answers (N4). */
const OPTION_LABELS: Readonly<Record<string, MessageDescriptor>> = {
  Yes: msg`Sí`,
  No: msg`No`,
  less_than_10: msg`Menos de 10`,
  '10_to_25': msg`De 10 a 25`,
  '26_to_50': msg`De 26 a 50`,
  '51_to_100': msg`De 51 a 100`,
  '101_to_500': msg`De 101 a 500`,
  more_than_500: msg`Más de 500`,
  less_than_50000: msg`Menos de USD 50.000`,
  '50000_to_100000': msg`De USD 50.000 a 100.000`,
  '100000_to_500000': msg`De USD 100.000 a 500.000`,
  '500000_to_1000000': msg`De USD 500.000 a 1.000.000`,
  '1000000_to_5000000': msg`De USD 1.000.000 a 5.000.000`,
  '5000000_to_10000000': msg`De USD 5.000.000 a 10.000.000`,
  more_than_10000000: msg`Más de USD 10.000.000`,
  charitable_donations: msg`Donaciones benéficas`,
  investment_purposes: msg`Inversiones`,
  receive_payments_for_goods_and_services: msg`Recibir pagos por bienes y servicios`,
  third_party_money_transmission: msg`Transmisión de dinero de terceros`,
  ecommerce_retail_payments: msg`Pagos de comercio electrónico o minorista`,
  purchase_goods_and_services: msg`Compra de bienes y servicios`,
  internal_treasury: msg`Tesorería interna`,
  operating_a_company: msg`Operación de la empresa`,
  business_loans: msg`Préstamos empresariales`,
  inter_company_funds: msg`Fondos entre empresas del grupo`,
  investment_proceeds: msg`Rendimientos de inversiones`,
  owners_capital: msg`Capital de los socios`,
  sales_of_goods_and_services: msg`Venta de bienes y servicios`,
  tax_refund: msg`Devolución de impuestos`,
  third_party_funds: msg`Fondos de terceros`,
  treasury_reserves: msg`Reservas de tesorería`,
  company_funds: msg`Fondos de la empresa`,
  investments_loans: msg`Inversiones o préstamos`,
};

/**
 * Spanish label of a documented answer; an answer without one (a NAICS
 * industry slug) is shown humanized (`real_estate` → `Real estate`).
 */
export function requirementOptionLabel(option: string, t: Translate): string {
  const descriptor = OPTION_LABELS[option];
  if (descriptor) return t(descriptor);
  const words = option.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** T-S21C: Loopay completes it at the provider (console or UBO link), not the API. */
export function isProviderConsoleRequirement(
  requirement: Pick<ProviderRequirement, 'handling'>
): boolean {
  return requirement.handling === 'PROVIDER_CONSOLE';
}

/** Spanish label of a requirement status; unknown statuses are shown as they come. */
export function requirementStatusLabel(status: string, t: Translate): string {
  const descriptor = STATUS_LABELS[status as ProviderRequirementStatus];
  return descriptor ? t(descriptor) : status;
}

/** Spanish label of a requirement kind; unknown kinds are shown as they come. */
export function requirementKindLabel(kind: string, t: Translate): string {
  const descriptor = KIND_LABELS[kind as ProviderRequirementKind];
  return descriptor ? t(descriptor) : kind;
}

/** Requirements the customer still has to answer: never sent, or rejected by Comercial. */
export function requirementsAwaitingCustomer<T extends Pick<ProviderRequirement, 'status'>>(
  requirements: readonly T[]
): T[] {
  return requirements.filter(
    (requirement) => requirement.status === 'REQUESTED' || requirement.status === 'REJECTED'
  );
}

/** What the customer entered for one requirement. */
export interface RequirementDraft {
  /** Base64 data URI of the document. */
  file?: string;
  fileName?: string;
  mimeType?: string;
  value?: string;
}

/**
 * The submit input for a requirement, or null when the draft does not answer
 * it yet (no file for a DOCUMENT, blank VALUE) or the kind is not answered by
 * the customer here (UBO_LINK: we contact them).
 */
export function buildRequirementSubmitInput(
  customerId: string,
  requirement: Pick<ProviderRequirement, 'id' | 'kind'>,
  draft: RequirementDraft | undefined
): SubmitProviderRequirementInput | null {
  if (!draft) return null;

  if (requirement.kind === 'DOCUMENT') {
    if (!draft.file || !draft.fileName || !draft.mimeType) return null;
    return {
      customerId,
      requirementId: requirement.id,
      documents: [{ fileName: draft.fileName, mimeType: draft.mimeType, file: draft.file }],
    };
  }

  if (requirement.kind === 'VALUE') {
    const value = draft.value?.trim() ?? '';
    if (!value) return null;
    return { customerId, requirementId: requirement.id, value };
  }

  return null;
}
