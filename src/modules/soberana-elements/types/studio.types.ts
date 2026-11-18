import type { WidgetConfig, WidgetType, WidgetTheme, WidgetFeatures } from './widget.types';
import type { SDKDeliveryMode, ComplianceRule, WebhookConfig } from './sdk.types';

export interface StudioProject {
  id: string;
  partnerId: string;
  name: string;
  description?: string;
  widgets: WidgetConfig[];
  status: 'draft' | 'published' | 'archived';
  publishedVersion?: string;
  createdAt: string;
  updatedAt: string;
}

// 4 = Avanzado (headless SDK only — webhook & compliance deep config)
export type BuilderStep = 0 | 1 | 2 | 3 | 4;

export interface BuilderConfig {
  type?: WidgetType;
  name?: string;
  theme?: WidgetTheme;
  enabledRails?: string[];
  features?: Partial<WidgetFeatures>;
  deliveryMode?: SDKDeliveryMode;
  complianceRules?: ComplianceRule[];
  webhookConfig?: Partial<WebhookConfig>;
}

export interface BuilderState {
  step: BuilderStep;
  config: BuilderConfig;
  isDirty: boolean;
}

export interface StepMeta {
  index: BuilderStep;
  titleKey: string;
  helperKey: string;
}
