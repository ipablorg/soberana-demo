/**
 * "N PENDIENTES / APROBADOS / RECHAZADOS / REVERTIDOS / DEPÓSITOS" counter next
 * to the queue title; the label follows the Estado selection (`kind`).
 *
 * Amber while pending deposits wait, neutral otherwise or at zero, a skeleton
 * while the count is unknown (never a made-up number) and hidden when it is
 * unavailable. Uppercase comes from CSS over sentence-case source strings.
 */

import { Plural } from '@lingui/react/macro';

import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';

import type { RecaudoCountKind } from '../lib/recaudo-filters';
import type { PendingCountState } from '../lib/recaudo-queue-view';

interface PendingCountBadgeProps {
  state: PendingCountState;
  /** Which status the count is about; defaults to the pending queue. */
  kind?: RecaudoCountKind;
}

function CountLabel({
  kind,
  count,
}: {
  kind: RecaudoCountKind;
  count: number;
}) {
  switch (kind) {
    case 'COMPLETED':
      return <Plural value={count} one="# aprobado" other="# aprobados" />;
    case 'REJECTED':
      return <Plural value={count} one="# rechazado" other="# rechazados" />;
    case 'FAILED':
      return <Plural value={count} one="# revertido" other="# revertidos" />;
    case 'MIXED':
      return <Plural value={count} one="# depósito" other="# depósitos" />;
    case 'PENDING':
      return <Plural value={count} one="# pendiente" other="# pendientes" />;
  }
}

export function PendingCountBadge({
  state,
  kind = 'PENDING',
}: PendingCountBadgeProps) {
  if (state.status === 'unavailable') return null;

  if (state.status === 'loading') {
    return <Skeleton aria-hidden="true" className="h-6 w-28" />;
  }

  const count = state.count;

  return (
    <Badge
      variant={kind === 'PENDING' && count > 0 ? 'warning-solid' : 'secondary'}
      className="font-semibold uppercase tracking-wide tabular-nums"
    >
      <CountLabel kind={kind} count={count} />
    </Badge>
  );
}
