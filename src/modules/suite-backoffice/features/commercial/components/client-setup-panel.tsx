/**
 * #411 Setup tab (container): reads what the checklist needs for one client
 * (registration, enabled rails, fee schedules, API key, readiness of the
 * enabled rails, first approved customer and virtual account) and renders it.
 */

import { Trans } from '@lingui/react/macro';

import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { mapError } from '@/shared/lib/error-mapper';
import { useAuthStore } from '@/shared/stores/auth-store';

import { useClientApiKeyInfo } from '../../clients/hooks/use-clients';
import { canManageClients } from '../../clients/lib/clients-logic';
import {
  useClientSetupReadiness,
  useFirstApprovedCustomer,
  useFirstOpenVirtualAccount,
} from '../hooks/use-client-setup';
import {
  useClientProviderOnboarding,
  useCommercialClientRails,
  useFeeSchedules,
} from '../hooks/use-commercial';
import {
  buildSetupChecklist,
  remainingReadinessIssues,
  type SetupReadiness,
  type SetupTab,
} from '../lib/client-setup';
import { SetupChecklist } from './setup-checklist';

interface ClientSetupPanelProps {
  clientId: string;
  onGoTo: (tab: SetupTab) => void;
}

/** Where the super admin edits the name, tax id and country of a client. */
const CLIENT_EDIT_PATH = '/backoffice/clients';

export function ClientSetupPanel({ clientId, onGoTo }: ClientSetupPanelProps) {
  const staffRoles = useAuthStore((state) => state.user?.staff_roles);
  const client = useClientApiKeyInfo(clientId);
  const onboarding = useClientProviderOnboarding(clientId);
  const rails = useCommercialClientRails(clientId);
  const fees = useFeeSchedules(clientId, false);
  const readiness = useClientSetupReadiness(clientId);
  const firstCustomer = useFirstApprovedCustomer(clientId);
  const firstCustomerId = firstCustomer.data?.adminLoopay_listCustomers[0]?.id ?? null;
  const firstVa = useFirstOpenVirtualAccount(clientId, firstCustomerId);

  const required = [client, onboarding, rails, fees, readiness];
  if (required.some((query) => query.isLoading)) {
    return <Skeleton className="h-80 w-full rounded-xl" data-testid="setup-skeleton" />;
  }

  const error = required.find((query) => query.error)?.error;
  if (error) {
    return (
      <div role="alert" className="space-y-3 rounded-xl border border-border p-4">
        <p className="text-sm text-destructive">{mapError(error).message}</p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => required.forEach((query) => void query.refetch?.())}
        >
          <Trans>Volver a intentar</Trans>
        </Button>
      </div>
    );
  }

  const entity = client.data?.adminLoopay_getClient;
  const readinessRow = (readiness.data?.adminLoopay_platformReadiness ?? []).find(
    (row) => row.client_id === clientId
  );

  const setupReadiness: SetupReadiness | null = readinessRow
    ? {
        missingPairings: readinessRow.missing_pairings,
        issueKeys: (readinessRow.issue_keys ?? []).map((issue) => ({
          key: issue.key,
          params: issue.params ?? {},
        })),
        deadProviderJunctionsActive: readinessRow.dead_provider_junctions_active ?? 0,
      }
    : null;

  const steps = buildSetupChecklist({
    client: entity
      ? { name: entity.name, taxId: entity.tax_id ?? null, country: entity.country ?? null }
      : null,
    onboarding: onboarding.data?.adminLoopay_clientProviderOnboarding ?? [],
    readiness: setupReadiness,
    activeRailCount: (rails.data?.adminLoopay_listClientProviderRails ?? []).filter(
      (row) => row.is_active
    ).length,
    activeFeeOperations: (fees.data?.adminLoopay_listFeeSchedules ?? [])
      .filter((schedule) => schedule.active)
      .map((schedule) => schedule.operation),
    apiKeyPrefix: entity?.api_key_prefix ?? null,
    apiKeyRotatedAt: entity?.api_key_rotated_at ?? null,
    clientStatus: entity?.status ?? null,
    firstCustomerApproved: firstCustomerId !== null,
    firstVirtualAccountOpen: (firstVa.data?.adminLoopay_listVirtualAccounts.data.length ?? 0) > 0,
  });

  return (
    <SetupChecklist
      steps={steps}
      onGoTo={onGoTo}
      issues={remainingReadinessIssues(setupReadiness)}
      clientEditHref={canManageClients(staffRoles) ? CLIENT_EDIT_PATH : null}
    />
  );
}
