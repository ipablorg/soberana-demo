/**
 * Backoffice decisions of the #413 withdrawal approval flow and the #410 stale
 * review, mirroring the backend guards (`dispersiones.service.ts`,
 * `withdrawal-approval.ts`, `stale-dispersion.rules.ts`). No React, no i18n.
 *
 *   approve        : AWAITING_APPROVAL (PENDING row, the gross is in the ops vault)
 *   reject         : AWAITING_APPROVAL, or APPROVED whose Mesta placement was REJECTED / BLOCKED
 *   retry funding  : the BLOCKED placement (APPROVED) or the BLOCKED funding of a placed order
 *   retry return   : RETURNING whose last return attempt failed, was rejected or never started
 */

import type {
  AdminDispersionQueueFilter,
  AdminDispersionQueueRow,
} from '@/graphql/queries/admin-loopay';
import type { AdminApproveDispersionInput } from '@/graphql/types/admin-loopay';

import { isConflictError } from '@/shared/lib/error-mapper';

import { domainErrorCode } from '../../commercial/lib/tenant-access';

/** States only the approval-flow mutations may leave (backend `APPROVAL_FLOW_LOCKED_STATES`). */
const APPROVAL_FLOW_LOCKED_STATES: ReadonlySet<string> = new Set([
  'AWAITING_APPROVAL',
  'APPROVED',
  'FUNDING',
  'RETURNING',
  'RETURN_MATCH_REQUIRED',
]);

/** Placement states of an APPROVED withdrawal whose Mesta order provably does not exist. */
const NO_ORDER_PAYOUT_STATES: ReadonlySet<string> = new Set(['REJECTED', 'BLOCKED']);

/** Return attempts that can be started again (never while one is SENT or UNKNOWN). */
const RETRYABLE_RETURN_STATUSES: ReadonlySet<string> = new Set(['FAILED', 'REJECTED']);

export type WithdrawalQueueView = 'PENDING' | 'AWAITING_APPROVAL' | 'PROCESSING';

export const WITHDRAWAL_QUEUE_VIEWS: readonly WithdrawalQueueView[] = [
  'PENDING',
  'AWAITING_APPROVAL',
  'PROCESSING',
];

/** Backend filter of a queue view: the approval view is the PENDING page narrowed to AWAITING_APPROVAL. */
export function queueFilterOf(view: WithdrawalQueueView): AdminDispersionQueueFilter {
  if (view === 'AWAITING_APPROVAL')
    return { status: 'PENDING', dispersionState: 'AWAITING_APPROVAL' };

  return { status: view };
}

export function isAwaitingApproval(row: AdminDispersionQueueRow): boolean {
  return row.dispersion_state === 'AWAITING_APPROVAL';
}

/** The manual complete / cancel / fail refuse these rows (409 `WITHDRAWAL_IN_APPROVAL_FLOW`). */
export function isInApprovalFlowLock(row: AdminDispersionQueueRow): boolean {
  return row.dispersion_state != null && APPROVAL_FLOW_LOCKED_STATES.has(row.dispersion_state);
}

export function canApproveWithdrawal(row: AdminDispersionQueueRow): boolean {
  return isAwaitingApproval(row) && row.status === 'PENDING';
}

export function canRejectWithdrawal(row: AdminDispersionQueueRow): boolean {
  if (canApproveWithdrawal(row)) return true;

  return (
    row.dispersion_state === 'APPROVED' &&
    row.payout != null &&
    NO_ORDER_PAYOUT_STATES.has(row.payout.state)
  );
}

export function canRetryFunding(row: AdminDispersionQueueRow): boolean {
  if (row.dispersion_state === 'APPROVED') return row.payout?.state === 'BLOCKED';

  return row.dispersion_state === 'PROCESSING' && row.funding_status === 'BLOCKED';
}

export function canRetryReturn(row: AdminDispersionQueueRow): boolean {
  if (row.dispersion_state !== 'RETURNING') return false;

  return row.return_status == null || RETRYABLE_RETURN_STATUSES.has(row.return_status);
}

/** #413: an approved withdrawal is funded from the ops vault, where the sweep put the gross. */
export function buildApproveWithdrawalInput(note: string): AdminApproveDispersionInput {
  const trimmed = note.trim();

  return trimmed ? { fundsLocation: 'ops_vault', note: trimmed } : { fundsLocation: 'ops_vault' };
}

export type StaleAlertKind = 'sweep-unsettled' | 'payout-no-event' | 'awaiting-approval' | 'other';

/** Which #410 rule raised a `metadata.staleAlerts` entry. */
export function staleAlertKind(key: string): StaleAlertKind {
  switch (key) {
    case 'dispersion.sweep_unsettled':
      return 'sweep-unsettled';
    case 'dispersion.payout_no_provider_event':
      return 'payout-no-event';
    case 'awaiting_approval':
    case 'dispersion.awaiting_approval_stale':
      return 'awaiting-approval';
    default:
      return 'other';
  }
}

/** Why the backend refused an approval-flow decision, when the queue has a precise message for it. */
export type WithdrawalDecisionFailure = 'mfa-required' | 'conflict';

export function withdrawalDecisionFailureOf(error: unknown): WithdrawalDecisionFailure | undefined {
  if (domainErrorCode(error) === 'MFA_REQUIRED') return 'mfa-required';
  if (isConflictError(error)) return 'conflict';

  return undefined;
}
