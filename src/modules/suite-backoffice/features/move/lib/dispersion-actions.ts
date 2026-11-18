/**
 * Pure decision model for the manual dispersion (outbound withdrawal) queue.
 *
 * Mirrors the guards in `dispersiones.service.ts`:
 *   - approve  : PENDING    -> PROCESSING (requires a funds location)
 *   - reject   : PENDING    -> REJECTED   (reason required, releases the hold)
 *   - complete : PROCESSING -> COMPLETED  (settlement reference / fiat leg)
 *   - fail     : PROCESSING -> FAILED     (reason required, refunds the customer)
 */

import type { AdminCancelDispersionInput } from '@/graphql/mutations/admin-loopay';
import type {
  AdminApproveDispersionInput,
  AdminCompleteDispersionInput,
  AdminDispersionFundsLocation,
  AdminFailDispersionInput,
  AdminRejectDispersionInput,
} from '@/graphql/types/admin-loopay';

export type DispersionAction =
  | 'approve'
  | 'complete'
  | 'reject'
  | 'fail'
  | 'cancel';

export const DISPERSION_FUNDS_LOCATIONS: readonly AdminDispersionFundsLocation[] =
  ['customer_vault', 'provider', 'ops_vault'];

/** `RejectDispersionInput` and `FailDispersionInput` both demand a reason. */
export function isDispersionReasonRequired(action: DispersionAction): boolean {
  return action === 'reject' || action === 'fail' || action === 'cancel';
}

export function dispersionActionTargetStatus(action: DispersionAction): string {
  switch (action) {
    case 'approve':
      return 'PROCESSING';
    case 'complete':
      return 'COMPLETED';
    case 'reject':
      return 'REJECTED';
    case 'fail':
      return 'FAILED';
    case 'cancel':
      return 'CANCELLED';
  }
}

/** Approve and reject only apply while the withdrawal is still pending. */
export function canApproveDispersion(status: string): boolean {
  return status === 'PENDING';
}

/** Complete and fail only apply once the withdrawal is being processed. */
export function canSettleDispersion(status: string): boolean {
  return status === 'PROCESSING';
}

export function buildApproveDispersionInput(
  fundsLocation: AdminDispersionFundsLocation,
  note: string,
): AdminApproveDispersionInput {
  const trimmed = note.trim();
  return {
    fundsLocation,
    ...(trimmed.length > 0 ? { note: trimmed } : {}),
  };
}

export interface CompleteDispersionFormValues {
  externalReference: string;
  note: string;
  fiatAmount: string;
  fiatCurrency: string;
  fiatRate: string;
  fiatBankRate: string;
  fiatFees: string;
}

/**
 * Only sends the `fiat` block when at least one of its fields was filled in;
 * the backend treats an all-empty settlement as "no fiat leg recorded".
 */
export function buildCompleteDispersionInput(
  values: CompleteDispersionFormValues,
): AdminCompleteDispersionInput {
  const fiat = {
    ...(values.fiatAmount.trim() && { amount: values.fiatAmount.trim() }),
    ...(values.fiatCurrency.trim() && {
      currency: values.fiatCurrency.trim().toUpperCase(),
    }),
    ...(values.fiatRate.trim() && { rate: values.fiatRate.trim() }),
    ...(values.fiatBankRate.trim() && { bank_rate: values.fiatBankRate.trim() }),
    ...(values.fiatFees.trim() && { fees: values.fiatFees.trim() }),
  };

  return {
    ...(values.externalReference.trim() && {
      externalReference: values.externalReference.trim(),
    }),
    ...(values.note.trim() && { note: values.note.trim() }),
    ...(Object.keys(fiat).length > 0 ? { fiat } : {}),
  };
}

export function buildRejectDispersionInput(
  reason: string,
): AdminRejectDispersionInput {
  return { reason: reason.trim() };
}

export function buildCancelDispersionInput(
  reason: string,
): AdminCancelDispersionInput {
  return { reason: reason.trim() };
}

export function buildFailDispersionInput(
  reason: string,
): AdminFailDispersionInput {
  return { reason: reason.trim() };
}
