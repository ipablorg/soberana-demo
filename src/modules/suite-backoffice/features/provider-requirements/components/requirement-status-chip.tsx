/** Status chip of a provider requirement: amber while it waits for review. */

import { Badge, type BadgeProps } from '@/shared/components/ui/badge';

const STATUS_VARIANTS: Readonly<Record<string, BadgeProps['variant']>> = {
  REQUESTED: 'secondary',
  UPLOADED: 'warning',
  APPROVED: 'success',
  REJECTED: 'destructive',
  SUBMITTED: 'processing',
  RESOLVED: 'outline',
};

export function RequirementStatusChip({ status, label }: { status: string; label: string }) {
  return (
    <Badge
      variant={STATUS_VARIANTS[status] ?? 'secondary'}
      className="whitespace-nowrap font-semibold"
    >
      {label}
    </Badge>
  );
}
