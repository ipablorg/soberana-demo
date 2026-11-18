import type { SDKDeliveryMode, ComplianceRule, WebhookConfig } from './sdk.types';

export type WidgetType =
  | 'payment-button'
  | 'kyc-module'
  | 'wallet-dashboard'
  | 'invoice-payment';

export type TargetSegment =
  | 'gig-economy'
  | 'saas-b2b'
  | 'marketplace'
  | 'generic';

export type BorderRadiusPreset = 'sm' | 'md' | 'lg' | 'full';

export type FontPreset = 'system' | 'inter' | 'geist';

export interface WidgetTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: BorderRadiusPreset;
  fontFamily: FontPreset;
  logoUrl?: string;
  companyName: string;
  darkMode: boolean;
}

export interface WidgetFeatures {
  zentinelTooltips: boolean;
  complianceChat: boolean;
  retentionCalc: boolean;
  accountingWebhook: boolean;
  kycBiometric: boolean;
  bankValidation: boolean;
  oneClickOffRamp: boolean;
  oneClickOnRamp: boolean;
  deepLinkPayload: boolean;
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  name: string;
  description?: string;
  theme: WidgetTheme;
  enabledRails: string[];
  features: Partial<WidgetFeatures>;
  targetSegment: TargetSegment;
  allowedOrigins: string[];
  webhookUrl?: string;
  deepLinkSecret?: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
  deliveryMode?: SDKDeliveryMode;
  complianceRules?: ComplianceRule[];
  webhookConfig?: WebhookConfig;
}

export interface WidgetCatalogEntry {
  type: WidgetType;
  labelKey: string;
  descriptionKey: string;
  segments: TargetSegment[];
  defaultFeatures: Partial<WidgetFeatures>;
  iconName: string;
}
