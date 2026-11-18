/**
 * Pure decision model for the manual recaudo (inbound deposit) queue.
 *
 * Backend guards these transitions with conditional `updateMany` statements, so
 * the rules below mirror the `where` clauses in `recaudos.service.ts`:
 *   - approve / reject require `status = PENDING`
 *   - reverse requires `status = COMPLETED` and moves the deposit to `FAILED`
 */

import type {
  AdminApproveRecaudoInput,
  AdminRejectRecaudoInput,
  AdminReverseRecaudoInput,
} from '@/graphql/types/admin-loopay';

export type RecaudoAction = 'approve' | 'reject' | 'reverse';

/** `RejectRecaudoInput.reason` and `ReverseRecaudoInput.reason` are required. */
export function isRecaudoReasonRequired(action: RecaudoAction): boolean {
  return action === 'reject' || action === 'reverse';
}

export function recaudoActionTargetStatus(action: RecaudoAction): string {
  switch (action) {
    case 'approve':
      return 'COMPLETED';
    case 'reject':
      return 'REJECTED';
    case 'reverse':
      // adminLoopay_reverseRecaudo transitions COMPLETED -> FAILED; there is
      // no REVERSED transaction status.
      return 'FAILED';
  }
}

/** Approve/reject only apply while the deposit is still pending. */
export function canDecideRecaudo(status: string): boolean {
  return status === 'PENDING';
}

/** Reversal only applies once the deposit has actually credited the wallet. */
export function canReverseRecaudo(status: string): boolean {
  return status === 'COMPLETED';
}

/** Row actions to render for a deposit, in display order. */
export function availableRecaudoActions(status: string): RecaudoAction[] {
  return [
    ...(canDecideRecaudo(status) ? (['approve', 'reject'] as const) : []),
    ...(canReverseRecaudo(status) ? (['reverse'] as const) : []),
  ];
}

export function buildApproveRecaudoInput(
  note: string,
): AdminApproveRecaudoInput {
  const trimmed = note.trim();
  return trimmed.length > 0 ? { note: trimmed } : {};
}

export function buildRejectRecaudoInput(
  reason: string,
): AdminRejectRecaudoInput {
  return { reason: reason.trim() };
}

export function buildReverseRecaudoInput(
  reason: string,
): AdminReverseRecaudoInput {
  return { reason: reason.trim() };
}
