/**
 * Types for Loopay Business Plan financial data — Due diligence.
 * Covers Income Statement, Balance Sheet, Cash Flow, and chart series.
 */

export interface FinancialPeriod {
  key: string;
  label: string;
  isAnnual: boolean;
}

export interface FinancialRow {
  metric: string;
  isHighlight?: boolean;
  isSeparator?: boolean;
  indent?: boolean;
  values: Record<string, number | null>;
}

export interface IncomeStatementData {
  periods: FinancialPeriod[];
  rows: FinancialRow[];
}

export interface BalanceSheetData {
  periods: FinancialPeriod[];
  rows: FinancialRow[];
}

export interface CashFlowData {
  periods: FinancialPeriod[];
  rows: FinancialRow[];
}

export interface ChartTimeSeries {
  period: string;
  value: number;
}

export interface RevenueBreakdownPoint {
  period: string;
  crossBorder: number;
  payIn: number;
  payOut: number;
  assetManagement: number;
  baas: number;
  total: number;
}

export interface FlujosKpiSummary {
  revenueAnnual2030: number;
  ebitdaAnnual2030: number;
  ebitdaMargin2030: number;
  netIncomeAnnual2030: number;
  totalAssetsQ42030: number;
  txVolumeQ42030: number;
  grossMarginQ42030: number;
  revenueGrowthYoY: number;
}
