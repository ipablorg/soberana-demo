// ─── Product Catalog ───────────────────────────────────────────────
export type ProductType = 'Tesorería digital' | 'Off Ramp' | 'On Ramp' | 'COMEX';

export interface Product {
  name: string;
  days: string;
  schedule: string;
  deliveryTime: string;
  notes: string;
  billing: string;
  productType: ProductType;
  hasPlatform: boolean;
  minPrice: string;
  extra?: string;
}

// ─── SLA / ANS ─────────────────────────────────────────────────────
export interface ServiceLevelAgreement {
  name: string;
  schedule: string;
  deliveryTime: string;
  notes: string;
}

// ─── Pricing Master (Corridor Table) ──────────────────────────────
export type PricingCurrency = 'USDT' | 'COP' | 'USD' | 'SOLES' | 'EUR';

export interface PricingCorridor {
  corridor: string;
  currency: PricingCurrency;
  minCost: string | null;
  dispersion: string | null;
  basePrice: string | null;
  startingTariff: string | null;
  deliveryTime: string | null;
  observations: string | null;
  type?: string;
}

// ─── Country Capabilities (Consolidado Comercial) ─────────────────
export interface CountryCorridor {
  corridor: string;
  destination: string;
  rate: string | null;
  product: string | null;
  sla: string | null;
  collectionMethods: string | null;
  disbursementMethods: string | null;
  updateDate: string | null;
  notes: string | null;
  operationProcess: string;
  frontend: string;
}

export interface CountryCapability {
  id: number;
  country: string;
  status: 'active' | 'limited' | 'no-channel';
  corridors: CountryCorridor[];
}

export interface PaymentMethodRow {
  country: string;
  creditDebitCard: boolean;
  paymentLink: boolean;
  bankTransfer: boolean;
  qr: boolean;
  wallet: boolean;
}

export interface DisbursementMethodRow {
  country: string;
  bankTransfer: string;
  wallet: boolean;
}

// ─── Volume Pricing ───────────────────────────────────────────────
export type VolumeRange =
  | '0-2.5MM'
  | '2.5-5MM'
  | '5-10MM'
  | '10-20MM'
  | '20-40MM'
  | '40MM+';

export const VOLUME_RANGES: VolumeRange[] = [
  '0-2.5MM',
  '2.5-5MM',
  '5-10MM',
  '10-20MM',
  '20-40MM',
  '40MM+',
];

export const VOLUME_RANGE_LABELS: Record<VolumeRange, string> = {
  '0-2.5MM': '0 – USD 2.5MM',
  '2.5-5MM': 'USD 2.5 – 5MM',
  '5-10MM': 'USD 5 – 10MM',
  '10-20MM': 'USD 10 – 20MM',
  '20-40MM': 'USD 20 – 40MM',
  '40MM+': '+ USD 40MM',
};

export interface VolumePricingCorridor {
  corridor: string;
  destination: string;
  rates: Partial<Record<VolumeRange, string>>;
}

export interface VolumePricingTable {
  origin: string;
  label: string;
  corridors: VolumePricingCorridor[];
}

// ─── Calculator Types ─────────────────────────────────────────────
export interface CalculatorCorridor {
  value: string;
  label: string;
  category: 'COMEX' | 'OFF_RAMP' | 'ON_RAMP';
}

export interface CalculatorResult {
  initialValue: number;
  commissionRate: number;
  netAmount: number;
  conversionRate: number;
  convertedValue: number;
}

// ─── Referral ─────────────────────────────────────────────────────
export interface ReferralVolumeRange {
  volume: number;
  volumeFormatted: string;
  rate: number;
  commission: number;
  earnedUsd: number;
  earnedCop: number;
}

export interface ReferralProductRate {
  fullRate: number;
  referrerCommission: number;
}

export interface ReferralCompany {
  name: string;
  volume: string;
  rate: string;
  commission: string;
  earnedUsd: string;
  earnedCop: string;
}

// ─── Client Custom Rates ──────────────────────────────────────────
export interface ClientRate {
  name: string;
  rate: string;
}

// ─── Chile Liquidator ─────────────────────────────────────────────
export interface ChileCostItem {
  concept: string;
  percentage: string | null;
  amountUsd: number;
}

// ─── Case Example ─────────────────────────────────────────────────
export interface CaseExampleData {
  referenceTrm: number;
  spread: number;
  calculations: {
    label: string;
    value: string;
  }[];
}

// ─── Navigation ───────────────────────────────────────────────────
export interface SalesNavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  description: string;
}
