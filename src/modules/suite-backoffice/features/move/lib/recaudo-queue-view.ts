/**
 * Pure view helpers for the manual deposit queue page.
 */

import type { BadgeProps } from '@/shared/components/ui/badge';

export type PendingCountState =
  | { status: 'loading' }
  | { status: 'unavailable' }
  | { status: 'ready'; count: number };

interface PendingCountInput {
  isLoading: boolean;
  /** `total` from the paginated response, when the API sends one. */
  total: number | undefined;
  /** Rows on the loaded page, used only when `total` is missing or invalid. */
  rowsLength: number;
  /** Whether a response is available at all. Defaults to true. */
  hasData?: boolean;
}

function isValidTotal(total: number | undefined): total is number {
  return typeof total === 'number' && Number.isInteger(total) && total >= 0;
}

/**
 * Decides what the "N pending" badge shows. Never guesses a number while
 * loading, and prefers the server total (the queue is paginated, so the page
 * length would under-report it).
 */
export function resolvePendingCount({
  isLoading,
  total,
  rowsLength,
  hasData = true,
}: PendingCountInput): PendingCountState {
  if (isLoading) return { status: 'loading' };
  if (!hasData) return { status: 'unavailable' };

  return { status: 'ready', count: isValidTotal(total) ? total : rowsLength };
}

/**
 * Badge per deposit status, all through semantic tokens: pending is the solid
 * amber badge (dark text on amber, so it reads on the dark surface), approved
 * is success, rejected is destructive and reversed is muted. Unknown statuses
 * keep the shared StatePillChip mapping.
 */
const RECAUDO_STATUS_BADGE_VARIANT: Record<string, BadgeProps['variant']> = {
  PENDING: 'warning-solid',
  COMPLETED: 'success',
  REJECTED: 'destructive',
  FAILED: 'secondary',
};

export function recaudoStatusBadgeVariant(
  status: string,
): BadgeProps['variant'] | undefined {
  return RECAUDO_STATUS_BADGE_VARIANT[status.toUpperCase()];
}
