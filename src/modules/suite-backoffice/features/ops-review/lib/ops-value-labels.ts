/**
 * Spanish labels for raw backend values the ops screens used to print as they
 * came (customer type, endorsement reason, recaudo origin, legacy rail names).
 * Lingui descriptors; callers resolve them with `t`. Unknown values stay raw
 * so no information is lost.
 */

import { msg } from '@lingui/core/macro';
import type { MessageDescriptor } from '@lingui/core';

import { EMPTY_CELL } from './ops-formatting';

type Translate = (descriptor: MessageDescriptor) => string;

const CUSTOMER_TYPE_LABELS: Readonly<Record<string, MessageDescriptor>> = {
  individual: msg`Persona natural`,
  business: msg`Empresa`,
};

const ENDORSEMENT_REASON_LABELS: Readonly<Record<string, MessageDescriptor>> = {
  customer_va_request: msg`Solicitud de cuenta virtual del cliente`,
};

const RECAUDO_SOURCE_LABELS: Readonly<Record<string, MessageDescriptor>> = {
  bank_transfer: msg`Transferencia bancaria`,
  cash: msg`Efectivo`,
  provider_manual: msg`Manual del proveedor`,
  other: msg`Otro`,
};

const RELATIONSHIP_LABELS: Readonly<Record<string, MessageDescriptor>> = {
  SELF: msg`Cuenta propia`,
  FAMILY: msg`Familiar`,
  FRIEND: msg`Amigo`,
  EMPLOYEE: msg`Empleado`,
  BUSINESS: msg`Empresa`,
  OTHER: msg`Otro`,
  THIRD_PARTY: msg`Tercero`,
};

function labelOr(
  map: Readonly<Record<string, MessageDescriptor>>,
  value: string | null | undefined,
  t: Translate,
  key: (value: string) => string = (v) => v
): string {
  if (!value?.trim()) return EMPTY_CELL;
  const descriptor = map[key(value.trim())];
  return descriptor ? t(descriptor) : value;
}

export function customerTypeLabel(type: string | null | undefined, t: Translate): string {
  return labelOr(CUSTOMER_TYPE_LABELS, type, t, (v) => v.toLowerCase());
}

export function endorsementReasonLabel(reason: string | null | undefined, t: Translate): string {
  return labelOr(ENDORSEMENT_REASON_LABELS, reason, t);
}

export function recaudoSourceLabel(source: string | null | undefined, t: Translate): string {
  return labelOr(RECAUDO_SOURCE_LABELS, source, t);
}

/** `INDIVIDUAL · SELF` as "Persona natural · Cuenta propia" (beneficiary queues). */
export function beneficiaryHolderLabel(
  holderType: string | null | undefined,
  relationship: string | null | undefined,
  t: Translate
): string {
  return `${customerTypeLabel(holderType, t)} · ${labelOr(RELATIONSHIP_LABELS, relationship, t, (v) => v.toUpperCase())}`;
}

/** Rail names carry an internal "(legacy)" suffix ops should not see. */
export function railDisplayName(name: string): string {
  return name.replace(/\s*\(legacy\)\s*$/i, '').trim() || name;
}
