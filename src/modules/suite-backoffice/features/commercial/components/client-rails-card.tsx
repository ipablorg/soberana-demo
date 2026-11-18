/**
 * Provider payment rails the client can use, grouped by provider. Only the
 * providers the client is LINKED/MANUAL with are listed; maintenance rails are
 * shown disabled. Switching a rail on creates the client rail (the backend
 * mirrors the provider customer id), switching it off deactivates it.
 * #411: dead providers and alias rails are never offered, one provider serves
 * a rail (a rail another provider already serves cannot be switched on) and
 * priority is not an operator choice (always 1).
 */

import { Trans, useLingui } from '@lingui/react/macro';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Switch } from '@/shared/components/ui/switch';
import { mapError } from '@/shared/lib/error-mapper';

import {
  useClientProviderOnboarding,
  useCommercialClientRails,
  useCommercialProviderRails,
  useEnableClientRail,
  useSetClientRailActive,
} from '../hooks/use-commercial';
import { CLIENT_RAIL_PRIORITY, buildRailGroups, type RailEntry } from '../lib/client-operation';
import { railDisplayName } from '../../ops-review/lib/ops-value-labels';
import { useCatalogFlags } from '../../platform-config/hooks/use-catalog-options';

export function ClientRailsCard({ clientId }: { clientId: string }) {
  const { t } = useLingui();
  const onboarding = useClientProviderOnboarding(clientId);
  const catalog = useCommercialProviderRails();
  const clientRails = useCommercialClientRails(clientId);
  const enable = useEnableClientRail(clientId);
  const setActive = useSetClientRailActive(clientId);
  const flags = useCatalogFlags();

  const loading =
    onboarding.isLoading || catalog.isLoading || clientRails.isLoading || flags.isLoading;
  const error = onboarding.error ?? catalog.error ?? clientRails.error ?? flags.error;

  if (loading) {
    return <Skeleton className="h-48 w-full rounded-xl" data-testid="rails-skeleton" />;
  }

  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-border p-4 space-y-3">
        <p className="text-sm text-destructive">{mapError(error).message}</p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            void onboarding.refetch?.();
            void catalog.refetch?.();
            void clientRails.refetch?.();
            flags.refetch();
          }}
        >
          <Trans>Volver a intentar</Trans>
        </Button>
      </div>
    );
  }

  const onboarded = (onboarding.data?.adminLoopay_clientProviderOnboarding ?? [])
    .filter((row) => row.status === 'LINKED' || row.status === 'MANUAL')
    .map((row) => ({ code: row.providerCode }));
  const clientRailRows = (clientRails.data?.adminLoopay_listClientProviderRails ?? []).map(
    (row) => ({
      id: row.id,
      providerId: row.provider_id,
      railId: row.rail_id,
      priority: row.priority,
      isActive: row.is_active,
    })
  );
  const groups = buildRailGroups(
    (catalog.data?.adminLoopay_listProviderPaymentRails ?? [])
      .filter((row) => row.is_active)
      .map((row) => ({
        providerId: row.provider.id,
        providerCode: row.provider.code,
        providerName: row.provider.name,
        providerActive: flags.providerActive.get(row.provider.id) ?? true,
        railId: row.rail.id,
        railCode: row.rail.code,
        railName: row.rail.name,
        railActive: flags.rails.get(row.rail.id)?.isActive ?? true,
        railCanonicalCode: flags.rails.get(row.rail.id)?.canonicalCode ?? null,
      })),
    onboarded,
    clientRailRows
  );
  const busy = enable.isPending || setActive.isPending;

  const toggle = (rail: RailEntry, next: boolean) => {
    if (rail.clientRailId) {
      setActive.mutate({ id: rail.clientRailId, input: { isActive: next } });

      return;
    }
    enable.mutate({
      input: {
        clientId,
        providerId: rail.providerId,
        railId: rail.railId,
        priority: CLIENT_RAIL_PRIORITY,
      },
    });
  };

  return (
    <section
      className="rounded-xl border border-border p-4 space-y-4"
      data-testid="client-rails-card"
    >
      <header className="space-y-1">
        <h3 className="text-base font-semibold">
          <Trans>Rieles habilitados</Trans>
        </h3>
        <p className="text-sm text-muted-foreground">
          <Trans>Rieles de los proveedores con los que el cliente ya está vinculado.</Trans>
        </p>
      </header>

      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          <Trans>
            Aún no hay proveedores vinculados: completa el onboarding para habilitar rieles.
          </Trans>
        </p>
      ) : (
        groups.map((group) => (
          <div
            key={group.providerId}
            className="space-y-2"
            data-testid={`rails-${group.providerCode}`}
          >
            <h4 className="text-sm font-medium">{group.providerName}</h4>
            <ul className="divide-y divide-border rounded-lg border border-border">
              {group.rails.map((rail) => {
                const disabled = busy || (rail.enabled ? !rail.canDisable : !rail.canEnable);

                return (
                  <li
                    key={rail.railId}
                    data-rail-code={rail.railCode}
                    className="flex items-center justify-between gap-3 px-3 py-2"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      {railDisplayName(rail.railName)}
                      {rail.maintenance ? (
                        <Badge variant="warning">{t`En mantenimiento`}</Badge>
                      ) : null}
                      {rail.servedByOtherProvider && !rail.enabled ? (
                        <Badge variant="secondary">{t`Ya lo sirve otro proveedor`}</Badge>
                      ) : null}
                    </span>
                    <Switch
                      checked={rail.enabled}
                      disabled={disabled}
                      aria-label={railDisplayName(rail.railName)}
                      onCheckedChange={(next) => toggle(rail, next)}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}
