/**
 * Landing banner for Comercial and Super admin (S21, "both must notice"): how
 * many provider requirements wait for them (uploads to review plus approved
 * items to send), with a link to the queue. Hidden at zero and for roles that
 * cannot open the queue, which do not ask for the counts at all.
 */

import { Link } from 'react-router-dom';
import { Plural, Trans } from '@lingui/react/macro';

import { AlertCircle } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import {
  PROVIDER_REQUIREMENTS_ROUTE,
  canAccessBackofficeRoute,
} from '@/shared/config/backoffice-modes.config';
import { useAuthStore } from '@/shared/stores/auth-store';

import { useProviderRequirementCounts } from '../hooks/use-provider-requirements';
import {
  pendingRequirementTotal,
  providerRequirementsLink,
} from '../lib/provider-requirement-rows';

const NO_STAFF_ROLES: readonly string[] = [];

export function ProviderRequirementsBannerView({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <p className="text-sm font-medium text-foreground">
          <Plural
            value={count}
            one="Hay # requerimiento de proveedor por revisar o enviar"
            other="Hay # requerimientos de proveedores por revisar o enviar"
          />
        </p>
      </div>
      <Button asChild size="sm" variant="outline" className="shrink-0">
        <Link to={providerRequirementsLink()}>
          <Trans>Ver requerimientos</Trans>
        </Link>
      </Button>
    </div>
  );
}

export function ProviderRequirementsBanner() {
  const staffRoles = useAuthStore((state) => state.user?.staff_roles ?? NO_STAFF_ROLES);
  const canReview = canAccessBackofficeRoute(PROVIDER_REQUIREMENTS_ROUTE, staffRoles);
  const { data } = useProviderRequirementCounts(canReview);
  const count = canReview
    ? pendingRequirementTotal(data?.adminLoopay_providerRequirementCounts)
    : 0;

  return <ProviderRequirementsBannerView count={count} />;
}
