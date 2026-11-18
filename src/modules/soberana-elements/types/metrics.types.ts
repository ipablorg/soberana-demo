export type MetricsPeriod = '7d' | '30d' | '90d';

export interface WidgetMetrics {
  widgetId: string;
  period: MetricsPeriod;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  currency: string;
  conversionRate: number;
  avgOrderValue: number;
  trendImpressions: number;
  trendRevenue: number;
}

export interface PeriodDataPoint {
  date: string;
  clicks: number;
  conversions: number;
  revenue: number;
}
