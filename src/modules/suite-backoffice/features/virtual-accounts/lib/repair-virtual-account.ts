/**
 * S22 repair of a blocked VA request (`adminLoopay_repairVirtualAccountRequest`):
 * which rows offer it, whether the backend refused because the provider
 * returned no bank details (then staff type them, with a second confirmation),
 * and why it refused the provider account id.
 */

import { msg } from '@lingui/core/macro';
import type { MessageDescriptor } from '@lingui/core';

import type { AdminVirtualAccountRequest } from '@/graphql/types/admin-loopay';

type Translate = (descriptor: MessageDescriptor) => string;

interface GraphQLErrorEntry {
  message?: string;
  extensions?: { code?: string; error_code?: string };
}

/** The only backend code that opens the typed bank details (with `confirmManualBankDetails`). */
const MANUAL_BANK_DETAILS_REQUIRED = 'VA_MANUAL_BANK_DETAILS_REQUIRED';

function errorEntries(error: unknown): GraphQLErrorEntry[] {
  if (!error || typeof error !== 'object') return [];
  const errors = (error as { response?: { errors?: unknown } }).response?.errors;
  return Array.isArray(errors) ? (errors as GraphQLErrorEntry[]) : [];
}

function errorCodes(error: unknown): string[] {
  return errorEntries(error).map(
    (entry) => entry.extensions?.error_code ?? entry.extensions?.code ?? ''
  );
}

/** True when the repair must be resent with typed, confirmed bank details. */
export function needsManualBankDetails(error: unknown): boolean {
  return errorCodes(error).includes(MANUAL_BANK_DETAILS_REQUIRED);
}

/** Why the provider refused the typed account id, in Spanish; undefined otherwise. */
export function describeRepairVirtualAccountError(
  error: unknown,
  t: Translate
): string | undefined {
  const codes = errorCodes(error);
  if (codes.includes('VA_PROVIDER_ACCOUNT_NOT_FOUND')) {
    return t(msg`El proveedor no tiene una cuenta con ese ID para este cliente. Verifique el ID.`);
  }
  if (codes.includes('VA_PROVIDER_ACCOUNT_NOT_OWNED')) {
    return t(msg`Esa cuenta del proveedor pertenece a otro cliente. No se puede vincular aquí.`);
  }
  return undefined;
}

/**
 * Same rule as the backend `isRepairableVaRequest`: only PROVIDER_ONBOARDING,
 * or REQUESTED with blockers.
 */
export function isRepairableRequest(
  request: Pick<AdminVirtualAccountRequest, 'state' | 'blockers'>
): boolean {
  if (request.state === 'PROVIDER_ONBOARDING') return true;
  return request.state === 'REQUESTED' && request.blockers.length > 0;
}
