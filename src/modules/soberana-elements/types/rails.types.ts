export type RailNetwork =
  | 'USDC_BASE'
  | 'USDT_POLYGON'
  | 'USDC_POLYGON'
  | 'FIAT_ACH'
  | 'FIAT_SPEI'
  | 'FIAT_PIX'
  | 'FIAT_PSE'
  | 'FIAT_CCI'
  | 'FIAT_BRE_B';

export type RailCategory = 'crypto' | 'fiat';

export type RailDirection = 'onramp' | 'offramp' | 'both';

export interface PaymentRail {
  id: string;
  network: RailNetwork;
  category: RailCategory;
  direction: RailDirection;
  label: string;
  description: string;
  currency: string;
  chain?: string;
  estimatedTime: string;
  fee: string;
  countries: string[];
  enabled: boolean;
  recommended?: boolean;
  /** Block explorer base URL of the chain (crypto rails only). */
  explorerUrl?: string;
}

export interface RailGroup {
  category: RailCategory;
  label: string;
  rails: PaymentRail[];
}
