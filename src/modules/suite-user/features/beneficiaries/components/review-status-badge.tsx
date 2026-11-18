/**
 * ReviewStatusBadge
 *
 * Provider review of a beneficiary, shown everywhere the beneficiary appears:
 * "En revisión" (created at the provider, not usable yet), "Aprobado" (usable
 * for payouts) and "Rechazado" (with the provider's reason as a tooltip).
 */

import { useLingui } from '@lingui/react/macro';

import { Badge } from '@/shared/components/ui/badge';

import {
  getReviewState,
  type ReviewableBeneficiary,
  type ReviewKind,
} from '../lib/beneficiary-review';

const VARIANT: Record<ReviewKind, 'warning' | 'success' | 'destructive'> = {
  in_review: 'warning',
  approved: 'success',
  rejected: 'destructive',
};

interface ReviewStatusBadgeProps {
  beneficiary: ReviewableBeneficiary;
  className?: string;
}

export function ReviewStatusBadge({ beneficiary, className }: ReviewStatusBadgeProps) {
  const { t } = useLingui();
  const { kind, reason } = getReviewState(beneficiary);

  const label =
    kind === 'approved' ? t`Aprobado` : kind === 'rejected' ? t`Rechazado` : t`En revisión`;

  return (
    <Badge
      variant={VARIANT[kind]}
      className={className}
      data-review-kind={kind}
      title={reason ?? undefined}
    >
      {label}
    </Badge>
  );
}
