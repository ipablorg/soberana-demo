import { Badge } from '@/shared/components/ui/badge';
import { humanizeCode, statusTone } from '@/modules/suite-tenant/lib/tenant-format';

interface StatusBadgeProps {
  status: string | null | undefined;
}

/** REST status value as a readable, tone-coded badge. */
export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant={statusTone(status)} className="rounded-md text-xs font-medium">
      {humanizeCode(status)}
    </Badge>
  );
}
