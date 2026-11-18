/**
 * Provider review status of a beneficiary: "En revisión" / "Aprobado" /
 * "Rechazado" (the rejection reason is the tooltip).
 */

import { useLingui } from '@lingui/react/macro';

import { Badge } from '@/shared/components/ui/badge';

import { reviewKindOf, type BackofficeReviewKind } from '../lib/beneficiary-review-status';

const VARIANT: Record<BackofficeReviewKind, 'warning' | 'success' | 'destructive'> = {
  in_review: 'warning',
  approved: 'success',
  rejected: 'destructive',
};

interface ReviewStatusBadgeProps {
  reviewStatus: string | null | undefined;
  reason?: string | null;
}

export function ReviewStatusBadge({ reviewStatus, reason }: ReviewStatusBadgeProps) {
  const { t } = useLingui();
  const kind = reviewKindOf(reviewStatus);
  const label = kind === 'approved' ? t`Aprobado` : kind === 'rejected' ? t`Rechazado` : t`En revisión`;

  return (
    <Badge
      variant={VARIANT[kind]}
      data-review-kind={kind}
      title={kind === 'rejected' ? (reason?.trim() || undefined) : undefined}
    >
      {label}
    </Badge>
  );
}
