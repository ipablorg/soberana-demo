/**
 * "Enter tenant backoffice" (epic 2026-11 S5, T5.2): LOOPAY_ADMIN and
 * OPS_COMMERCIAL open the client's tenant backoffice as one of its admins
 * (`x-act-as-client`, audited on every request). The backend requires a
 * second factor in the staff member's token; when it is missing the button
 * says so and links to the second-factor setup.
 */

import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Link, useNavigate } from 'react-router-dom';

import { Building2 } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { mapError } from '@/shared/lib/error-mapper';
import { queryClient } from '@/shared/lib/query-client';
import { canActAsTenant } from '@/shared/lib/staff-roles';
import { TENANT_HOME_ROUTE } from '@/shared/lib/tenant-roles';
import { useActAsStore } from '@/shared/stores/act-as-store';
import { useAuthStore } from '@/shared/stores/auth-store';

import { actAsFailureOf, type ActAsFailure } from '../lib/tenant-access';

/** Where staff enrol a second factor (same target as the backoffice MFA gate). */
const MFA_SETTINGS_ROUTE = '/suite/settings';

interface EnterTenantBackofficeButtonProps {
  clientId: string;
  /** False when the client is known not to be ACTIVE (its tenant backoffice refuses every call). */
  clientActive?: boolean;
}

interface Failure {
  kind: ActAsFailure | 'other';
  message: string;
}

export function EnterTenantBackofficeButton({
  clientId,
  clientActive,
}: EnterTenantBackofficeButtonProps) {
  const staffRoles = useAuthStore((state) => state.user?.staff_roles);
  const startActAs = useActAsStore((state) => state.startActAs);
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);

  if (!canActAsTenant(staffRoles)) return null;

  const inactive = clientActive === false;

  const handleClick = async () => {
    setIsStarting(true);
    setFailure(null);
    try {
      await startActAs(clientId);
      queryClient.clear();
      navigate(TENANT_HOME_ROUTE);
    } catch (error) {
      setFailure({ kind: actAsFailureOf(error) ?? 'other', message: mapError(error).message });
      setIsStarting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        disabled={inactive || isStarting}
        aria-describedby={inactive ? 'act-as-inactive-hint' : undefined}
        onClick={() => void handleClick()}
        data-testid="enter-tenant-backoffice"
      >
        <Building2 className="h-4 w-4" aria-hidden="true" />
        <Trans>Enter tenant backoffice</Trans>
      </Button>
      {inactive ? (
        <p id="act-as-inactive-hint" className="text-xs text-muted-foreground">
          <Trans>Only an active client has a tenant backoffice.</Trans>
        </p>
      ) : null}
      {failure ? <ActAsFailureMessage failure={failure} /> : null}
    </div>
  );
}

function ActAsFailureMessage({ failure }: { failure: Failure }) {
  const { t } = useLingui();

  return (
    <div
      role="alert"
      className="max-w-sm text-right text-xs text-destructive"
      data-testid="act-as-error"
    >
      {failure.kind === 'mfa-required' ? (
        <p>
          {t`Entering a client's backoffice needs a second factor on your account.`}{' '}
          <Link to={MFA_SETTINGS_ROUTE} className="font-medium underline underline-offset-2">
            <Trans>Set up two-step verification, then sign in again.</Trans>
          </Link>
        </p>
      ) : failure.kind === 'forbidden' ? (
        <p>{t`Your role cannot enter a client's backoffice.`}</p>
      ) : failure.kind === 'client-not-found' ? (
        <p>
          <Trans>This client no longer exists.</Trans>
        </p>
      ) : failure.kind === 'client-not-active' ? (
        <p>
          <Trans>Only an active client has a tenant backoffice.</Trans>
        </p>
      ) : (
        <p>{failure.message}</p>
      )}
    </div>
  );
}
