/**
 * IntegrationsMarketplace — first-class home for the API integrations
 * page (the default tab in `SettingsView`).
 *
 * Today the marketplace ships exactly one real integration: Loopay X.
 * It renders as a single highlighted card with the brand mark on the
 * canonical `bg-card` token (no hardcoded plate). Future integrations
 * land as additional cards here without changing the surrounding
 * shell — the grid auto-flows.
 *
 * The local `<h2>Integraciones</h2>` was intentionally removed in
 * favor of the active `<TabsTrigger>` as the section identifier, so
 * the page hierarchy collapses to: PageHeader → tabs → cards.
 */

import { useMemo, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import { useNavigate } from 'react-router-dom';
import {
  IntegrationCard,
  type IntegrationCardProps,
} from '@/shared/components/common/integration-card';
import LogoCompact from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png';
import LogoWide     from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png';
import LogoGradient from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png';
import { useElementsIntegrationStore } from '@/shared/stores/use-elements-integration-store';
import { useWorkflowComposerStore } from '@/shared/stores/use-workflow-composer-store';
import { WorkflowActivationDialog } from './workflow-activation-dialog';

export function IntegrationsMarketplace() {
  const { t } = useLingui();
  const navigate = useNavigate();

  const elementsEnabled = useElementsIntegrationStore((s) => s.enabled);
  const elementsEnable  = useElementsIntegrationStore((s) => s.enable);
  const elementsDisable = useElementsIntegrationStore((s) => s.disable);

  const workflowEnabled = useWorkflowComposerStore((s) => s.enabled);
  const workflowEnable  = useWorkflowComposerStore((s) => s.enable);
  const workflowDisable = useWorkflowComposerStore((s) => s.disable);

  const [activationOpen, setActivationOpen] = useState(false);

  const elementsStatus: IntegrationCardProps['status'] = useMemo(() => {
    if (elementsEnabled) return 'connected';
    return 'available';
  }, [elementsEnabled]);

  const handleElementsToggle = (next: boolean) => {
    if (next) elementsEnable();
    else elementsDisable();
  };

  const handleWorkflowToggle = (next: boolean) => {
    if (next) setActivationOpen(true);
    else workflowDisable();
  };

  return (
    <>
    <WorkflowActivationDialog
      open={activationOpen}
      onClose={() => setActivationOpen(false)}
      onSuccess={() => { workflowEnable(); setActivationOpen(false); }}
    />
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground max-w-2xl">
        <Trans>
          Activa los productos de tu pila financiera. Una activación, todo el sistema responde.
        </Trans>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Workflow Composer — primero */}
        <IntegrationCard
          id="workflow-composer"
          name="Workflow Composer"
          tagline={t`Automatiza flujos de pago visuales.`}
          description={t`Diseña pipelines de pagos arrastrando nodos. Conecta Soberana, FX y webhooks en un solo canvas.`}
          heroContent={
            <div className="flex flex-col items-center justify-center gap-3 h-full w-full bg-card">
              {workflowEnabled ? (
                <img src={LogoGradient} alt="Soberana" className="w-auto" style={{height: '4.2vw', minHeight: '24px', maxHeight: '64px'}} />
              ) : (
                <>
                  <img src={LogoCompact} alt="Soberana" className="w-auto dark:hidden opacity-80" style={{height: '4.2vw', minHeight: '24px', maxHeight: '64px'}} />
                  <img src={LogoWide}    alt="Soberana" className="w-auto hidden dark:block opacity-80" style={{height: '4.2vw', minHeight: '24px', maxHeight: '64px'}} />
                </>
              )}
              <span className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                Workflow Composer
              </span>
            </div>
          }
          status="beta"
          highlight={workflowEnabled}
          enabled={workflowEnabled}
          onToggle={handleWorkflowToggle}
          onConfigure={() => navigate('/workflow')}
        />

        {/* Loopay Elements */}
        <IntegrationCard
          id="elements"
          name="Loopay Elements"
          tagline={t`Widgets de pago en tu app. Sin fricción.`}
          description={t`Embebe botones de pago, KYC y dashboards en minutos. Shadow DOM aislado o Headless SDK — tú eliges.`}
          heroContent={
            <div className="flex flex-col items-center justify-center gap-3 h-full w-full bg-card">
              {elementsEnabled ? (
                <img src={LogoGradient} alt="Soberana" className="w-auto" style={{height: '4.2vw', minHeight: '24px', maxHeight: '64px'}} />
              ) : (
                <>
                  <img src={LogoCompact} alt="Soberana" className="w-auto dark:hidden opacity-80" style={{height: '4.2vw', minHeight: '24px', maxHeight: '64px'}} />
                  <img src={LogoWide}    alt="Soberana" className="w-auto hidden dark:block opacity-80" style={{height: '4.2vw', minHeight: '24px', maxHeight: '64px'}} />
                </>
              )}
              <span className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                Elements
              </span>
            </div>
          }
          status={elementsStatus}
          highlight={elementsEnabled}
          enabled={elementsEnabled}
          onToggle={handleElementsToggle}
          onConfigure={() => navigate('/elements')}
        />
      </div>
    </div>
    </>
  );
}
