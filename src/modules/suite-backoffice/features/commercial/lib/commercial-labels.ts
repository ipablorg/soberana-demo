/**
 * Human labels for the commercial backoffice: fee enums, attempt actors and
 * onboarding failures. Labels are Lingui descriptors so they stay translatable;
 * callers resolve them with `t` from `useLingui()`.
 */

import { msg } from '@lingui/core/macro';
import type { MessageDescriptor } from '@lingui/core';

import type { FeeMode, FeeOperation } from '@/graphql/queries/admin-commercial';
import type { OnboardingResult } from '@/graphql/mutations/admin-commercial';

type Translate = (descriptor: MessageDescriptor) => string;

const FEE_OPERATION_LABELS: Record<FeeOperation, MessageDescriptor> = {
  VA_CREATION: msg`Creación de cuenta virtual`,
  DEPOSIT: msg`Depósito`,
  WITHDRAWAL: msg`Retiro`,
  PAYOUT: msg`Pago`,
  P2P: msg`P2P`,
  CRYPTO_TRANSFER: msg`Transferencia cripto`,
};

const FEE_MODE_LABELS: Record<FeeMode, MessageDescriptor> = {
  FIXED: msg`Fijo`,
  PERCENT: msg`Porcentaje`,
};

export function feeOperationLabel(operation: FeeOperation, t: Translate): string {
  const descriptor = FEE_OPERATION_LABELS[operation];
  return descriptor ? t(descriptor) : operation;
}

export function feeModeLabel(mode: FeeMode, t: Translate): string {
  const descriptor = FEE_MODE_LABELS[mode];
  return descriptor ? t(descriptor) : mode;
}

/**
 * Who triggered an onboarding attempt. The backend only returns the local user
 * id, so a directory (id -> email/name) can be supplied when available; a
 * missing actor means the system ran it.
 */
export function actorLabel(
  actorUserId: string | null | undefined,
  directory?: Readonly<Record<string, string>>
): string {
  if (!actorUserId) return 'Sistema';
  const known = directory?.[actorUserId];
  if (known) return known;
  return `Staff · ${actorUserId.slice(0, 8)}`;
}

export interface OnboardingFailure {
  status: OnboardingResult['status'];
  reason: string;
}

/** A retry/onboard call "succeeds" over HTTP even when the provider call failed. */
export function onboardingFailure(
  result: OnboardingResult | null | undefined
): OnboardingFailure | null {
  if (!result || result.status !== 'FAILED') return null;
  const message = result.errorMessage?.trim();
  const code = result.errorCode?.trim();
  const reason =
    message && code ? `${message} (${code})` : (message ?? code ?? 'Error desconocido');
  return { status: result.status, reason };
}

const ONBOARDING_STATUS_LABELS: Readonly<Record<string, MessageDescriptor>> = {
  LINKED: msg`Vinculado`,
  MANUAL: msg`Vinculado manualmente`,
  PENDING: msg`Pendiente`,
  FAILED: msg`Fallido`,
};

/** Provider onboarding status of a client (LINKED, MANUAL, ...); unknown ones stay raw. */
export function onboardingStatusLabel(status: string, t: Translate): string {
  const descriptor = ONBOARDING_STATUS_LABELS[status];
  return descriptor ? t(descriptor) : status;
}
