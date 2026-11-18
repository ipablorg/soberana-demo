import { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet';
import { Stepper } from '@/shared/components/ui/stepper';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Check,
  Layers,
  FileCode,
  Webhook,
  Shield,
} from '@/shared/components/animated-icons';
import { useWidgetBuilder } from '../hooks/use-widget-builder';
import { VALID_WIDGET_TYPES } from '../config/widget-catalog';
import { RAIL_GROUPS } from '../config/rails-catalog';
import { DEFAULT_THEME } from '../config/branding-defaults';
import { WidgetTypeSelector } from '../components/studio/WidgetTypeSelector';
import { BrandingEditor } from '../components/studio/BrandingEditor';
import { RailSelector } from '../components/studio/RailSelector';
import { FeatureToggler } from '../components/studio/FeatureToggler';
import { LivePreview } from '../components/studio/LivePreview';
import { CodeSnippetPanel } from '../components/studio/CodeSnippetPanel';
import { HeadlessCompliancePreview } from '../components/preview/headless/HeadlessCompliancePreview';
import { useElementsStore } from '../stores/use-elements-store';
import type { WidgetType, SDKDeliveryMode, WebhookEventName } from '../types';

const WIDGET_STEP_LABELS = [
  t`Tipo`,
  t`Branding`,
  t`Rieles`,
  t`Código`,
];
const HEADLESS_STEP_LABELS = [
  t`Tipo`,
  t`SDK Config`,
  t`Rieles`,
  t`Código`,
  t`Avanzado`,
];

const WEBHOOK_EVENTS: { value: WebhookEventName; label: string }[] = [
  { value: 'payment:success', label: 'payment:success' },
  { value: 'payment:failed', label: 'payment:failed' },
  { value: 'kyc:completed', label: 'kyc:completed' },
  { value: 'invoice:paid', label: 'invoice:paid' },
  { value: 'compliance:rule_triggered', label: 'compliance:rule_triggered' },
  { value: 'compliance:escalation_required', label: 'compliance:escalation_required' },
  { value: 'treasury:threshold_alert', label: 'treasury:threshold_alert' },
];

export function WidgetBuilder() {
  const { type } = useParams<{ type: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('edit');

  const {
    step,
    config,
    isHeadless,
    canAdvance,
    selectType,
    selectDeliveryMode,
    setBuilderName,
    setBuilderTheme,
    setBuilderRails,
    setBuilderFeatures,
    setBuilderComplianceRules,
    setBuilderWebhookConfig,
    advanceBuilder,
    backBuilder,
    resetBuilder,
    saveBuilderWidget,
  } = useWidgetBuilder();

  const widgets = useElementsStore(s => s.widgets);

  useEffect(() => {
    if (editId) {
      const widget = widgets.find(w => w.id === editId);
      if (widget) {
        useElementsStore.getState().patchBuilder({
          type: widget.type,
          name: widget.name,
          theme: widget.theme,
          enabledRails: widget.enabledRails,
          features: widget.features,
          deliveryMode: widget.deliveryMode ?? 'widget',
          complianceRules: widget.complianceRules,
        });
        useElementsStore.getState().setBuilderStep(0);
        return;
      }
    }
    if (type && VALID_WIDGET_TYPES.includes(type as WidgetType) && !config.type) {
      selectType(type as WidgetType);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fires once on mount
  }, []);

  const isValidType = type && VALID_WIDGET_TYPES.includes(type as WidgetType);
  if (!isValidType) {
    navigate('/elements', { replace: true });
    return null;
  }

  const lastStep = isHeadless ? 4 : 3;

  const handleSave = () => {
    const savedId = saveBuilderWidget();
    if (savedId) navigate(`/elements/preview/${savedId}`);
  };

  const stepLabels = isHeadless ? HEADLESS_STEP_LABELS : WIDGET_STEP_LABELS;
  const stepperItems = stepLabels.map((title, i) => ({
    title,
    helper: '',
    ...(i < step ? { state: 'complete' as const } : {}),
  }));

  const widgetType = config.type ?? (type as WidgetType);

  // Build a full WidgetConfig for preview/code panel
  const savedConfig = {
    id: 'preview',
    type: widgetType ?? ('payment-button' as WidgetType),
    name: config.name ?? '',
    theme: config.theme ?? DEFAULT_THEME,
    enabledRails: config.enabledRails ?? [],
    features: config.features ?? {},
    targetSegment: 'generic' as const,
    allowedOrigins: [],
    createdAt: '',
    updatedAt: '',
    status: 'draft' as const,
    deliveryMode: config.deliveryMode ?? 'widget',
    complianceRules: config.complianceRules,
    webhookConfig: config.webhookConfig?.endpoint
      ? {
          endpoint: config.webhookConfig.endpoint,
          events: config.webhookConfig.events ?? [],
          format: config.webhookConfig.format ?? 'json',
          retryPolicy: config.webhookConfig.retryPolicy ?? { maxRetries: 3, backoffMs: 1000 },
        }
      : undefined,
  };

  const renderStepContent = () => {
    switch (step) {
      // ── Step 0: Type + delivery mode ──────────────────────────
      case 0:
        return (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="font-heading font-semibold text-foreground">
                <Trans>Elige el tipo de widget</Trans>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                <Trans>Selecciona el tipo que mejor se adapta a tu caso de uso.</Trans>
              </p>
            </div>

            <WidgetTypeSelector
              selected={config.type ?? null}
              onSelect={selectType}
            />

            {/* Delivery mode toggle */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                <Trans>Modo de entrega</Trans>
              </label>
              <div className="flex gap-2 rounded-lg border border-border bg-muted p-1">
                <DeliveryModeButton
                  active={!isHeadless}
                  icon={<Layers className="h-3.5 w-3.5" />}
                  label={t`Widget (Shadow DOM)`}
                  description={t`Copia y pega. Listo en minutos.`}
                  onClick={() => selectDeliveryMode('widget' as SDKDeliveryMode)}
                />
                <DeliveryModeButton
                  active={isHeadless}
                  icon={<FileCode className="h-3.5 w-3.5" />}
                  label={t`Headless SDK`}
                  description={t`Tu DOM, tus estilos. Control total.`}
                  onClick={() => selectDeliveryMode('headless' as SDKDeliveryMode)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                <Trans>Nombre del widget</Trans>
              </label>
              <Input
                value={config.name ?? ''}
                onChange={e => setBuilderName(e.target.value)}
                placeholder={t`ej. Checkout Freelancers`}
              />
            </div>
          </div>
        );

      // ── Step 1: Branding (widget) or SDK Config (headless) ────
      case 1:
        if (isHeadless) {
          return (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-heading font-semibold text-foreground">
                  <Trans>SDK Configuration</Trans>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  <Trans>Configura las reglas de compliance y el webhook de tu integración.</Trans>
                </p>
              </div>

              {/* Hook format info */}
              <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground"><Trans>Hook de integración</Trans></p>
                  <Badge variant="secondary" className="ml-auto text-xs font-mono">
                    {widgetType === 'payment-button' && 'usePayment'}
                    {widgetType === 'kyc-module' && 'useKyc'}
                    {widgetType === 'wallet-dashboard' && 'useWallet'}
                    {widgetType === 'invoice-payment' && 'useInvoice'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  <Trans>Tu componente recibe estado, acciones y eventos. Sin estilos predefinidos — usa tu propio design system.</Trans>
                </p>
              </div>

              {/* Compliance rules */}
              <div className="rounded-xl border border-border bg-card p-4">
                <HeadlessCompliancePreview
                  rules={config.complianceRules ?? []}
                  onChange={setBuilderComplianceRules}
                />
              </div>

              {/* Webhook endpoint */}
              <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Webhook className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground"><Trans>Webhook endpoint</Trans></p>
                  <Badge variant="outline" className="ml-auto text-xs"><Trans>Opcional</Trans></Badge>
                </div>
                <Input
                  value={config.webhookConfig?.endpoint ?? ''}
                  onChange={e => setBuilderWebhookConfig({ endpoint: e.target.value })}
                  placeholder="https://api.tuapp.com/webhooks/soberana"
                />
              </div>
            </div>
          );
        }

        return (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="font-heading font-semibold text-foreground">
                <Trans>Personaliza el branding</Trans>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                <Trans>Adapta el widget a la identidad visual de tu empresa.</Trans>
              </p>
            </div>
            <BrandingEditor
              theme={config.theme ?? DEFAULT_THEME}
              onChange={setBuilderTheme}
            />
          </div>
        );

      // ── Step 2: Rails + features (same for both modes) ────────
      case 2:
        return (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="font-heading font-semibold text-foreground">
                <Trans>Rieles de pago y features</Trans>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                <Trans>Elige qué métodos de pago y capacidades habilitarás.</Trans>
              </p>
            </div>
            <RailSelector
              railGroups={RAIL_GROUPS}
              enabledRails={config.enabledRails ?? []}
              onChange={setBuilderRails}
            />
            {widgetType && (
              <div className="mt-2">
                <p className="text-sm font-medium text-foreground mb-3">
                  <Trans>Capacidades opcionales</Trans>
                </p>
                <FeatureToggler
                  features={config.features ?? {}}
                  widgetType={widgetType}
                  onChange={setBuilderFeatures}
                />
              </div>
            )}
          </div>
        );

      // ── Step 3: Code snippets ─────────────────────────────────
      case 3: {
        return (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="font-heading font-semibold text-foreground">
                {isHeadless
                  ? <Trans>SDK — snippets de integración</Trans>
                  : <Trans>Código de integración</Trans>
                }
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isHeadless
                  ? <Trans>Copia el hook y renderiza con tu propio design system.</Trans>
                  : <Trans>Copia el snippet y pégalo en tu app. Listo en minutos.</Trans>
                }
              </p>
            </div>
            <CodeSnippetPanel config={savedConfig} />
          </div>
        );
      }

      // ── Step 4: Advanced webhook config (headless only) ───────
      case 4: {
        return (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-heading font-semibold text-foreground">
                <Trans>Configuración avanzada</Trans>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                <Trans>Webhooks, formato de payload y política de reintentos.</Trans>
              </p>
            </div>

            {/* Webhook events */}
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Webhook className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground"><Trans>Eventos suscritos</Trans></p>
              </div>
              <div className="flex flex-wrap gap-2">
                {WEBHOOK_EVENTS.map(({ value, label }) => {
                  const active = (config.webhookConfig?.events ?? []).includes(value);
                  return (
                    <button
                      key={value}
                      onClick={() => {
                        const current = config.webhookConfig?.events ?? [];
                        const next = active
                          ? current.filter(e => e !== value)
                          : [...current, value];
                        setBuilderWebhookConfig({ events: next });
                      }}
                      className={`text-xs font-mono px-2 py-1 rounded-md border transition-colors duration-150 ${
                        active
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payload format */}
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
              <p className="text-sm font-medium text-foreground"><Trans>Formato de payload</Trans></p>
              <div className="flex gap-2">
                {(['json', 'iso20022'] as const).map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setBuilderWebhookConfig({ format: fmt })}
                    className={`text-xs font-mono px-3 py-1.5 rounded-md border transition-colors duration-150 ${
                      (config.webhookConfig?.format ?? 'json') === fmt
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border text-muted-foreground hover:border-foreground/50'
                    }`}
                  >
                    {fmt === 'iso20022' ? 'ISO 20022' : 'JSON'}
                  </button>
                ))}
              </div>
              {config.webhookConfig?.format === 'iso20022' && (
                <p className="text-xs text-muted-foreground">
                  <Trans>El payload incluirá iso20022_ref compatible con mensajes pacs.008 / camt.054.</Trans>
                </p>
              )}
            </div>

            {/* Signing secret */}
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground"><Trans>Secreto de firma (HMAC-SHA256)</Trans></p>
                <Badge variant="outline" className="ml-auto text-xs"><Trans>Opcional</Trans></Badge>
              </div>
              <Input
                type="password"
                value={config.webhookConfig?.signingSecret ?? ''}
                onChange={e => setBuilderWebhookConfig({ signingSecret: e.target.value })}
                placeholder={t`Mínimo 32 caracteres`}
              />
            </div>

            {/* Retry policy */}
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
              <p className="text-sm font-medium text-foreground"><Trans>Política de reintentos</Trans></p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground"><Trans>Máx. reintentos</Trans></label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={config.webhookConfig?.retryPolicy?.maxRetries ?? 3}
                    onChange={e => setBuilderWebhookConfig({
                      retryPolicy: {
                        maxRetries: parseInt(e.target.value, 10) || 0,
                        backoffMs: config.webhookConfig?.retryPolicy?.backoffMs ?? 1000,
                      },
                    })}
                    className="font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground"><Trans>Backoff (ms)</Trans></label>
                  <Input
                    type="number"
                    min={100}
                    step={100}
                    value={config.webhookConfig?.retryPolicy?.backoffMs ?? 1000}
                    onChange={e => setBuilderWebhookConfig({
                      retryPolicy: {
                        maxRetries: config.webhookConfig?.retryPolicy?.maxRetries ?? 3,
                        backoffMs: parseInt(e.target.value, 10) || 1000,
                      },
                    })}
                    className="font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Left panel */}
      <div className="flex flex-1 flex-col overflow-hidden lg:w-3/5 border-r border-border">
        {/* Stepper */}
        <div className="px-6 pt-6 pb-4 border-b border-border/50">
          <Stepper steps={stepperItems} activeIndex={step} />
        </div>

        {/* Step content */}
        <ScrollArea className="flex-1">
          <div className="px-6 py-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${step}-${isHeadless ? 'headless' : 'widget'}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border bg-background">
          {step > 0 ? (
            <Button variant="outline" onClick={backBuilder}>
              <ChevronLeft className="mr-1.5 h-4 w-4" />
              <Trans>Atrás</Trans>
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => { resetBuilder(); navigate('/elements'); }}>
              <Trans>Cancelar</Trans>
            </Button>
          )}

          {step < lastStep ? (
            <Button variant="gradient" onClick={advanceBuilder} disabled={!canAdvance}>
              <Trans>Continuar</Trans>
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button variant="gradient" onClick={handleSave}>
              <Check className="mr-1.5 h-4 w-4" />
              <Trans>Guardar widget</Trans>
            </Button>
          )}
        </div>
      </div>

      {/* Right panel — Desktop */}
      <div className="hidden lg:flex lg:w-2/5 bg-muted/20 items-start justify-center overflow-auto py-8 px-6">
        <div className="w-full flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            <Trans>Vista previa en tiempo real</Trans>
          </div>
          <LivePreview config={savedConfig} />
        </div>
      </div>

      {/* Mobile preview FAB */}
      <div className="lg:hidden fixed bottom-20 right-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.2, ease: 'easeOut' }}
            >
              <Button variant="gradient" size="icon" className="h-12 w-12 rounded-full shadow-md">
                <Eye className="h-5 w-5" />
              </Button>
            </motion.div>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] p-0">
            <SheetHeader className="px-6 py-4 border-b border-border">
              <SheetTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <Trans>Vista previa</Trans>
              </SheetTitle>
            </SheetHeader>
            <div className="overflow-auto h-[calc(85vh-4rem)] px-6 py-4 flex justify-center">
              <LivePreview config={savedConfig} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

// ── Delivery mode toggle button ────────────────────────────────────────────────

function DeliveryModeButton({
  active,
  icon,
  label,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-start gap-0.5 rounded-md px-3 py-2.5 transition-colors duration-150 text-left ${
        active
          ? 'bg-background shadow-sm border border-border'
          : 'hover:bg-background/50'
      }`}
    >
      <div className={`flex items-center gap-1.5 text-xs font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
        {icon}
        {label}
      </div>
      <p className="text-xs text-muted-foreground leading-tight">{description}</p>
    </button>
  );
}
