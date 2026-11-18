import type { ComponentType } from 'react';

export type IconComponent = ComponentType<{ className?: string }>;

export type ClientType = 'banks' | 'fintechs' | 'wallets' | 'money-movers' | 'corporates';

export type ProductCategory = 'payments' | 'banking' | 'crypto' | 'intelligence';

export type CountryStatus = 'live' | 'coming-soon';

export type CardAccent = 'primary' | 'success' | 'warning' | 'accent';

export interface ClientTypeInfo {
  id: ClientType;
  label: string;
  icon: IconComponent;
  tagline: string;
  painPoint: string;
  solution: string;
}

export interface ProductFeature {
  label: string;
}

export interface ClientBenefit {
  clientType: ClientType;
  benefit: string;
}

export interface ProductModule {
  id: string;
  label: string;
  tagline: string;
  description: string;
  features: string[];
  clientBenefits: Partial<Record<ClientType, string>>;
  category: ProductCategory;
  icon: IconComponent;
  badge?: string;
}

export interface ComparisonRow {
  dimension: string;
  before: string;
  after: string;
}

export interface FlowStep {
  step: number;
  title: string;
  description: string;
  duration: string;
  icon: IconComponent;
}

export interface PlatformMetric {
  id: string;
  value: string;
  prefix?: string;
  suffix?: string;
  label: string;
  description: string;
  accent: CardAccent;
  icon: IconComponent;
}

export interface RegionalCountry {
  name: string;
  flag: string;
  status: CountryStatus;
  capabilities: string[];
}

export interface PlatformNavSection {
  id: string;
  label: string;
  anchor: string;
  icon: IconComponent;
}
