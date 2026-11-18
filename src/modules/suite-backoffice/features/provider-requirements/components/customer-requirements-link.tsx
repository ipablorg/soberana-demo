/**
 * "Requerimientos: N pendientes" for one customer (Customer 360, S21): open
 * provider requirements (not yet sent to the provider), linking to the queue
 * filtered by that customer. Only for Comercial and Super admin; hidden at zero.
 */

import { Link } from 'react-router-dom';
import { Trans } from '@lingui/react/macro';

import {
  PROVIDER_REQUIREMENTS_ROUTE,
  canAccessBackofficeRoute,
} from '@/shared/config/backoffice-modes.config';
import { useAuthStore } from '@/shared/stores/auth-store';

import { useProviderRequirementsQueue } from '../hooks/use-provider-requirements';
import {
  OPEN_REQUIREMENT_STATUSES,
  providerRequirementsLink,
} from '../lib/provider-requirement-rows';

const NO_STAFF_ROLES: readonly string[] = [];

export function RequirementsPendingLink({
  customerId,
  count,
}: {
  customerId: string;
  count: number;
}) {
  if (count <= 0) return null;

  return (
    <Link
      to={providerRequirementsLink(customerId)}
      className="whitespace-nowrap text-sm font-medium text-primary underline-offset-4 hover:underline"
    >
      <Trans>Requerimientos: {count} pendientes</Trans>
    </Link>
  );
}

export function CustomerRequirementsLink({ customerId }: { customerId: string }) {
  const staffRoles = useAuthStore((state) => state.user?.staff_roles ?? NO_STAFF_ROLES);
  const enabled =
    canAccessBackofficeRoute(PROVIDER_REQUIREMENTS_ROUTE, staffRoles) && Boolean(customerId);
  const { data } = useProviderRequirementsQueue(
    {
      filter: { customerId, status: [...OPEN_REQUIREMENT_STATUSES] },
      page: 1,
      pageSize: 100,
    },
    { enabled }
  );

  const count = enabled ? (data?.adminLoopay_listProviderRequirements.total ?? 0) : 0;

  return <RequirementsPendingLink customerId={customerId} count={count} />;
}
