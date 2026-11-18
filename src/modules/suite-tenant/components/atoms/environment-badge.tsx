import { useLingui } from '@lingui/react/macro';

import { Badge } from '@/shared/components/ui/badge';
import type { TenantEnvironment } from '@/modules/suite-tenant/lib/tenant-environment';

interface EnvironmentBadgeProps {
  environment: TenantEnvironment;
}

/** Prominent Sandbox / Production marker of the deployment that answered. */
export function EnvironmentBadge({ environment }: EnvironmentBadgeProps) {
  const { t } = useLingui();
  const isProduction = environment === 'production';

  return (
    <Badge
      data-testid="tenant-environment-badge"
      variant={isProduction ? 'success' : 'warning'}
      className="rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-widest"
    >
      {isProduction ? t`Production` : t`Sandbox`}
    </Badge>
  );
}
