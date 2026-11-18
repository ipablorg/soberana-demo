import { useLocation } from 'react-router-dom';

import { EnvironmentBadge } from '@/modules/suite-tenant/components/atoms/environment-badge';
import { EnvironmentSwitchLink } from '@/modules/suite-tenant/components/molecules/environment-switch-link';
import {
  getCrossEnvironmentLink,
  normalizeEnvironment,
  type DeploymentUrls,
} from '@/modules/suite-tenant/lib/tenant-environment';

interface TenantEnvironmentBarProps {
  /** `tenant_me.environment` as the back reports it. */
  environment: string | null | undefined;
  /** Base URLs of both deployments (`readDeploymentUrls()`). */
  urls: DeploymentUrls;
}

/** Environment badge plus, when configured, the link to the same route on the other deployment. */
export function TenantEnvironmentBar({ environment, urls }: TenantEnvironmentBarProps) {
  const { pathname, search, hash } = useLocation();
  const current = normalizeEnvironment(environment);
  const link = getCrossEnvironmentLink(current, `${pathname}${search}${hash}`, urls);

  return (
    <div className="flex items-center gap-3">
      <EnvironmentBadge environment={current} />
      {link ? <EnvironmentSwitchLink link={link} /> : null}
    </div>
  );
}
