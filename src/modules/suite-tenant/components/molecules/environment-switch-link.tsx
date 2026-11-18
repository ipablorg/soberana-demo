import { Trans } from '@lingui/react/macro';

import { ExternalLink } from '@/shared/components/animated-icons';
import type { CrossEnvironmentLink } from '@/modules/suite-tenant/lib/tenant-environment';

interface EnvironmentSwitchLinkProps {
  link: CrossEnvironmentLink;
}

/** "Open in Production/Sandbox": the same route on the other deployment. */
export function EnvironmentSwitchLink({ link }: EnvironmentSwitchLinkProps) {
  return (
    <a
      data-testid="tenant-environment-switch"
      href={link.href}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary underline-offset-4 transition-colors duration-150 hover:underline"
    >
      {link.target === 'production' ? (
        <Trans>Open in Production</Trans>
      ) : (
        <Trans>Open in Sandbox</Trans>
      )}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}
