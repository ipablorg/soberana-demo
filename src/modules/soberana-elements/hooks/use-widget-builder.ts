import { useElementsStore } from '../stores/use-elements-store';
import { WIDGET_CATALOG } from '../config/widget-catalog';
import { DEFAULT_THEME } from '../config/branding-defaults';
import type { WidgetType, BuilderStep, SDKDeliveryMode, ComplianceRule, WebhookConfig } from '../types';

export function useWidgetBuilder() {
  const builder = useElementsStore(s => s.builder);
  const setBuilderType = useElementsStore(s => s.setBuilderType);
  const setBuilderName = useElementsStore(s => s.setBuilderName);
  const setBuilderTheme = useElementsStore(s => s.setBuilderTheme);
  const setBuilderRails = useElementsStore(s => s.setBuilderRails);
  const setBuilderFeatures = useElementsStore(s => s.setBuilderFeatures);
  const setBuilderDeliveryMode = useElementsStore(s => s.setBuilderDeliveryMode);
  const setBuilderComplianceRules = useElementsStore(s => s.setBuilderComplianceRules);
  const setBuilderWebhookConfig = useElementsStore(s => s.setBuilderWebhookConfig);
  const setBuilderStep = useElementsStore(s => s.setBuilderStep);
  const advanceBuilder = useElementsStore(s => s.advanceBuilder);
  const backBuilder = useElementsStore(s => s.backBuilder);
  const resetBuilder = useElementsStore(s => s.resetBuilder);
  const saveBuilderWidget = useElementsStore(s => s.saveBuilderWidget);

  const isHeadless = builder.config.deliveryMode === 'headless';

  const canAdvance = (): boolean => {
    const { step, config } = builder;
    if (step === 0) return Boolean(config.type);
    if (step === 1) {
      if (isHeadless) return true;
      return Boolean(config.theme?.companyName?.trim());
    }
    if (step === 2) return (config.enabledRails?.length ?? 0) > 0;
    return true;
  };

  const selectType = (type: WidgetType) => {
    setBuilderType(type);
    const catalog = WIDGET_CATALOG.find(w => w.type === type);
    if (catalog) {
      setBuilderFeatures(catalog.defaultFeatures);
    }
    if (!builder.config.theme) {
      setBuilderTheme({ ...DEFAULT_THEME });
    }
  };

  const selectDeliveryMode = (mode: SDKDeliveryMode) => {
    setBuilderDeliveryMode(mode);
  };

  const goToStep = (step: BuilderStep) => {
    setBuilderStep(step);
  };

  return {
    builder,
    step: builder.step,
    config: builder.config,
    isDirty: builder.isDirty,
    isHeadless,
    canAdvance: canAdvance(),
    selectType,
    selectDeliveryMode,
    setBuilderName,
    setBuilderTheme,
    setBuilderRails,
    setBuilderFeatures,
    setBuilderComplianceRules: (rules: ComplianceRule[]) => setBuilderComplianceRules(rules),
    setBuilderWebhookConfig: (cfg: Partial<WebhookConfig>) => setBuilderWebhookConfig(cfg),
    advanceBuilder,
    backBuilder,
    goToStep,
    resetBuilder,
    saveBuilderWidget,
  };
}
