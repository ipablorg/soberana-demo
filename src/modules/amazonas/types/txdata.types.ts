/**
 * Types for Loopay LLC (Americas) transaction data — Due diligence.
 * Values must match txdata.csv exactly (no modification).
 */

export interface TxRow {
  customerName: string;
  region: string;
  segment: string;
  businessType: string;
  csm: string;
  sdr: string;
  tenantId: string;
  date: string;
  asset: string;
  txDirection: string;
  operation: string;
  measureNames: string;
  measureValues: string;
  mes: string;
}

export interface TxSummary {
  totalOutboundVolume: number;
  totalOutboundFormatted: string;
  transactionCount: number;
  uniqueAssetsCount: number;
  dateMin: string;
  dateMax: string;
  operationCounts: Record<string, number>;
}

export interface VolumeByMonth {
  mes: string;
  totalVolume: number;
  label: string;
}

export interface VolumeByAsset {
  asset: string;
  totalVolume: number;
  formatted: string;
}
