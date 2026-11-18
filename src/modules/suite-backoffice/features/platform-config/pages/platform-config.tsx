/**
 * `/backoffice/platform` — provider & platform config (PLATFORM_ADMIN only).
 *
 * The route itself is only registered for PLATFORM_ADMIN / LOOPAY_ADMIN (see
 * `suite-backoffice-routes.tsx`); the backend gates every operation again.
 */

import { Trans, useLingui } from '@lingui/react/macro';

import { PageHeader } from '@/shared/components/common/PageHeader';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';

import { ClientDefaultsTab } from '../components/client-defaults-tab';
import { ClientProviderRailsTab } from '../components/client-provider-rails-tab';
import { CutoverTab } from '../components/cutover-tab';
import { PaymentRailsTab } from '../components/payment-rails-tab';
import { ProviderRailsTab } from '../components/provider-rails-tab';
import { ProvidersTab } from '../components/providers-tab';
import { ReadinessTab } from '../components/readiness-tab';

export default function PlatformConfig() {
  const { t } = useLingui();

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={t`Proveedores y plataforma`}
        subtitle={t`Configuración por cliente de proveedores, rieles y cutover.`}
      />

      <Tabs defaultValue="readiness" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="readiness">
            <Trans>Readiness</Trans>
          </TabsTrigger>
          <TabsTrigger value="providers">
            <Trans>Proveedores</Trans>
          </TabsTrigger>
          <TabsTrigger value="payment-rails">
            <Trans>Rieles de pago</Trans>
          </TabsTrigger>
          <TabsTrigger value="provider-rails">
            <Trans>Proveedor ↔ riel</Trans>
          </TabsTrigger>
          <TabsTrigger value="client-provider-rails">
            <Trans>Cliente ↔ proveedor ↔ riel</Trans>
          </TabsTrigger>
          <TabsTrigger value="client-defaults">
            <Trans>Defaults del cliente</Trans>
          </TabsTrigger>
          <TabsTrigger value="cutover">
            <Trans>Cutover</Trans>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="readiness">
          <ReadinessTab />
        </TabsContent>
        <TabsContent value="providers">
          <ProvidersTab />
        </TabsContent>
        <TabsContent value="payment-rails">
          <PaymentRailsTab />
        </TabsContent>
        <TabsContent value="provider-rails">
          <ProviderRailsTab />
        </TabsContent>
        <TabsContent value="client-provider-rails">
          <ClientProviderRailsTab />
        </TabsContent>
        <TabsContent value="client-defaults">
          <ClientDefaultsTab />
        </TabsContent>
        <TabsContent value="cutover">
          <CutoverTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
