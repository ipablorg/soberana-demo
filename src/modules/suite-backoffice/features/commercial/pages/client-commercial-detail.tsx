/**
 * `/backoffice/commercial/clients/:clientId` — commercial view of one client.
 * #411: it opens on Setup, the checklist that leaves the client ready to
 * operate; each missing step links to its tab (provider onboarding, rails,
 * fees, API key). `?tab=` opens a given tab directly.
 *
 * Epic 2026-11 S4/S5 (commercial dual user): the header offers "Enter tenant
 * backoffice" (act as one of the client's admins) and the Setup tab invites
 * the client's tenant admin, both for LOOPAY_ADMIN and OPS_COMMERCIAL.
 */

import { Trans, useLingui } from '@lingui/react/macro';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import { PageHeader } from '@/shared/components/common/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

import { ApiKeyPanel } from '../../clients/components/api-key-panel';
import { useClientApiKeyInfo } from '../../clients/hooks/use-clients';
import { useClientOptions } from '../../ops-review/hooks/use-client-options';
import { AllowedCountriesCard } from '../components/allowed-countries-card';
import { ClientRailsCard } from '../components/client-rails-card';
import { ClientSetupPanel } from '../components/client-setup-panel';
import { EnterTenantBackofficeButton } from '../components/enter-tenant-backoffice-button';
import { FeesPanel } from '../components/fees-panel';
import { InviteTenantAdminCard } from '../components/invite-tenant-admin-card';
import { LedgerPanel } from '../components/ledger-panel';
import { OnboardingPanel } from '../components/onboarding-panel';

const DETAIL_TABS = ['setup', 'onboarding', 'operation', 'fees', 'ledger', 'api-key'] as const;
type DetailTab = (typeof DETAIL_TABS)[number];

export default function ClientCommercialDetail() {
  const { t } = useLingui();
  const { clientId = '' } = useParams<{ clientId: string }>();
  const { options } = useClientOptions();
  const keyInfo = useClientApiKeyInfo(clientId);
  const clientName = options.find((option) => option.client_id === clientId)?.client_name;
  const client = keyInfo.data?.adminLoopay_getClient;
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('tab');
  const tab = requested && DETAIL_TABS.includes(requested as DetailTab) ? requested : 'setup';
  const goTo = (next: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', next);
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={clientName ?? client?.name ?? t`Perfil comercial del cliente`}
        subtitle={t`Perfil comercial: onboarding, tarifas y API key`}
        actions={
          <div className="flex flex-wrap items-start gap-2">
            <EnterTenantBackofficeButton
              clientId={clientId}
              clientActive={client ? client.status === 'ACTIVE' : undefined}
            />
            <Button asChild variant="outline">
              <Link to="/backoffice/commercial/clients/new">
                <Trans>Nuevo cliente</Trans>
              </Link>
            </Button>
          </div>
        }
      />

      <Tabs value={tab} onValueChange={goTo} className="space-y-4">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="setup">
            <Trans>Configuración</Trans>
          </TabsTrigger>
          <TabsTrigger value="onboarding">
            <Trans>Onboarding</Trans>
          </TabsTrigger>
          <TabsTrigger value="operation">
            <Trans>Operación</Trans>
          </TabsTrigger>
          <TabsTrigger value="fees">
            <Trans>Tarifas</Trans>
          </TabsTrigger>
          <TabsTrigger value="ledger">
            <Trans>Movimientos</Trans>
          </TabsTrigger>
          <TabsTrigger value="api-key">
            <Trans>API key</Trans>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="setup" className="space-y-4">
          <ClientSetupPanel clientId={clientId} onGoTo={goTo} />
          <InviteTenantAdminCard clientId={clientId} />
        </TabsContent>
        <TabsContent value="onboarding">
          <OnboardingPanel clientId={clientId} />
        </TabsContent>
        <TabsContent value="operation" className="space-y-4">
          {client ? (
            <AllowedCountriesCard
              key={`${client.id}:${JSON.stringify(client.config ?? null)}`}
              clientId={clientId}
              clientCountry={client.country}
              config={client.config}
            />
          ) : (
            <Skeleton className="h-40 w-full rounded-xl" />
          )}
          <ClientRailsCard clientId={clientId} />
        </TabsContent>
        <TabsContent value="fees">
          <FeesPanel clientId={clientId} />
        </TabsContent>
        <TabsContent value="ledger">
          <LedgerPanel clientId={clientId} />
        </TabsContent>
        <TabsContent value="api-key">
          <ApiKeyPanel
            clientId={clientId}
            prefix={client?.api_key_prefix}
            rotatedAt={client?.api_key_rotated_at}
            expiresAt={client?.api_key_expires_at}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
