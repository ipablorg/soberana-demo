/**
 * Provider payout model for v2 dispersions (`metadata.providerPayout`).
 *
 * v2 rows are the ones carrying `dispersion_state`; legacy rows never do, and
 * the queue keeps treating them exactly as before.
 *
 * `providerPayout.state` (OPERATIONS.md 3.4.1):
 *   PLACED / AWAITING_FUNDS -> the provider is paying (no manual action)
 *   EXECUTED / FAILED / RETURNED -> terminal
 *   BLOCKED / REJECTED / UNKNOWN -> never confirmed at the provider: manual fallback
 */

import type {
  AdminDispersionPayout,
  AdminDispersionQueueRow,
} from '@/graphql/queries/admin-loopay';

import { canApproveDispersion, canSettleDispersion } from './dispersion-actions';
import { isInApprovalFlowLock } from './dispersion-approval';

export type PayoutTone = 'success' | 'warning' | 'destructive' | 'processing' | 'secondary';

/** The provider holds (or may hold) the money movement: manual actions would double pay. */
const IN_FLIGHT_STATES: ReadonlySet<string> = new Set(['PLACED', 'AWAITING_FUNDS']);

/** Payout never confirmed at the provider, so ops may settle it by hand. */
const MANUAL_FALLBACK_STATES: ReadonlySet<string> = new Set([
  'BLOCKED',
  'REJECTED',
  'UNKNOWN',
]);

export function isV2Dispersion(row: AdminDispersionQueueRow): boolean {
  return row.dispersion_state != null;
}

export function hasPayoutInFlight(
  payout: AdminDispersionPayout | null | undefined,
): boolean {
  return payout != null && IN_FLIGHT_STATES.has(payout.state);
}

export function payoutTone(state: string): PayoutTone {
  switch (state) {
    case 'EXECUTED':
      return 'success';
    case 'PLACED':
    case 'AWAITING_FUNDS':
      return 'processing';
    case 'FAILED':
    case 'REJECTED':
      return 'destructive';
    case 'BLOCKED':
    case 'UNKNOWN':
    case 'RETURNED':
      return 'warning';
    default:
      return 'secondary';
  }
}

/** Completar: manual fallback of a PENDING v2 row whose payout was not placed. */
export function canCompleteManually(row: AdminDispersionQueueRow): boolean {
  if (!isV2Dispersion(row)) return canSettleDispersion(row.status);
  // #413: a row in the approval flow leaves it only through its own mutations.
  if (isInApprovalFlowLock(row)) return false;
  if (row.status === 'PENDING') {
    return row.payout == null || MANUAL_FALLBACK_STATES.has(row.payout.state);
  }
  return canSettleDispersion(row.status) && !hasPayoutInFlight(row.payout);
}

/** Cancelar: only v2 PENDING rows, and never while a payout is in flight. */
export function canCancelDispersion(row: AdminDispersionQueueRow): boolean {
  return (
    isV2Dispersion(row) &&
    row.status === 'PENDING' &&
    !isInApprovalFlowLock(row) &&
    !hasPayoutInFlight(row.payout)
  );
}

/** Fallar: PROCESSING rows; v2 rows additionally need no payout in flight. */
export function canFailDispersion(row: AdminDispersionQueueRow): boolean {
  if (!canSettleDispersion(row.status)) return false;
  if (isInApprovalFlowLock(row)) return false;
  return !isV2Dispersion(row) || !hasPayoutInFlight(row.payout);
}

/**
 * Legacy Rechazar of a PENDING v1 row (v2 has no manual approval gate; the
 * #413 approval-flow decisions are in `dispersion-approval.ts`).
 */
export function canApproveOrRejectDispersion(row: AdminDispersionQueueRow): boolean {
  return !isV2Dispersion(row) && canApproveDispersion(row.status);
}
