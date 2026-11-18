import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  WidgetConfig,
  WidgetTheme,
  WidgetFeatures,
  WidgetType,
  WidgetMetrics,
  PeriodDataPoint,
  StudioProject,
  BuilderState,
  BuilderConfig,
  BuilderStep,
  MetricsPeriod,
  SDKDeliveryMode,
  ComplianceRule,
  WebhookConfig,
} from '../types';
import { DEFAULT_THEME } from '../config/branding-defaults';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_WIDGETS: WidgetConfig[] = [
  {
    id: 'wgt_abc123',
    type: 'payment-button',
    name: 'Checkout Freelancers',
    description: 'Cobros one-click para freelancers con off-ramp USDC',
    theme: {
      ...DEFAULT_THEME,
      primaryColor: '#3b82f6',
      companyName: 'FreelancePro',
    },
    enabledRails: ['USDC_BASE', 'USDT_POLYGON'],
    features: { zentinelTooltips: true, oneClickOffRamp: true, bankValidation: true },
    targetSegment: 'gig-economy',
    allowedOrigins: ['https://freelancepro.com'],
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-04-15T00:00:00Z',
    status: 'published',
  },
  {
    id: 'wgt_def456',
    type: 'kyc-module',
    name: 'KYC Marketplaces',
    description: 'Onboarding biométrico para proveedores del marketplace',
    theme: {
      ...DEFAULT_THEME,
      primaryColor: '#10b981',
      companyName: 'MiMarketplace',
    },
    enabledRails: ['FIAT_ACH', 'FIAT_PSE'],
    features: { kycBiometric: true, complianceChat: true, bankValidation: true },
    targetSegment: 'marketplace',
    allowedOrigins: ['https://mimarketplace.co'],
    createdAt: '2026-04-05T00:00:00Z',
    updatedAt: '2026-04-20T00:00:00Z',
    status: 'draft',
  },
  {
    id: 'wgt_ghi789',
    type: 'invoice-payment',
    name: 'Pago Facturas Ecuador',
    description: 'Pago de facturas B2B con retención SRI automática',
    theme: {
      ...DEFAULT_THEME,
      primaryColor: '#f59e0b',
      companyName: 'ContadorEC',
    },
    enabledRails: ['USDC_BASE', 'FIAT_ACH'],
    features: {
      retentionCalc: true,
      accountingWebhook: true,
      deepLinkPayload: true,
      zentinelTooltips: true,
    },
    targetSegment: 'saas-b2b',
    allowedOrigins: ['https://contadorec.com'],
    createdAt: '2026-04-10T00:00:00Z',
    updatedAt: '2026-04-28T00:00:00Z',
    status: 'published',
  },
];

const MOCK_METRICS: Record<string, Record<MetricsPeriod, WidgetMetrics>> = {
  wgt_abc123: {
    '7d': {
      widgetId: 'wgt_abc123',
      period: '7d',
      impressions: 2900,
      clicks: 490,
      conversions: 30,
      revenue: 2150,
      currency: 'USD',
      conversionRate: 0.061,
      avgOrderValue: 71.67,
      trendImpressions: 5.2,
      trendRevenue: 3.1,
    },
    '30d': {
      widgetId: 'wgt_abc123',
      period: '30d',
      impressions: 12400,
      clicks: 2100,
      conversions: 128,
      revenue: 9200,
      currency: 'USD',
      conversionRate: 0.061,
      avgOrderValue: 71.88,
      trendImpressions: 12.4,
      trendRevenue: 8.1,
    },
    '90d': {
      widgetId: 'wgt_abc123',
      period: '90d',
      impressions: 37200,
      clicks: 6300,
      conversions: 384,
      revenue: 27600,
      currency: 'USD',
      conversionRate: 0.061,
      avgOrderValue: 71.88,
      trendImpressions: 18.7,
      trendRevenue: 14.3,
    },
  },
  wgt_def456: {
    '7d': {
      widgetId: 'wgt_def456',
      period: '7d',
      impressions: 1200,
      clicks: 207,
      conversions: 9,
      revenue: 0,
      currency: 'USD',
      conversionRate: 0.043,
      avgOrderValue: 0,
      trendImpressions: -1.1,
      trendRevenue: 0,
    },
    '30d': {
      widgetId: 'wgt_def456',
      period: '30d',
      impressions: 5200,
      clicks: 890,
      conversions: 37,
      revenue: 0,
      currency: 'USD',
      conversionRate: 0.042,
      avgOrderValue: 0,
      trendImpressions: -2.1,
      trendRevenue: 0,
    },
    '90d': {
      widgetId: 'wgt_def456',
      period: '90d',
      impressions: 15600,
      clicks: 2670,
      conversions: 111,
      revenue: 0,
      currency: 'USD',
      conversionRate: 0.042,
      avgOrderValue: 0,
      trendImpressions: -0.8,
      trendRevenue: 0,
    },
  },
  wgt_ghi789: {
    '7d': {
      widgetId: 'wgt_ghi789',
      period: '7d',
      impressions: 2100,
      clicks: 432,
      conversions: 22,
      revenue: 767,
      currency: 'USD',
      conversionRate: 0.051,
      avgOrderValue: 34.86,
      trendImpressions: 10.2,
      trendRevenue: 7.4,
    },
    '30d': {
      widgetId: 'wgt_ghi789',
      period: '30d',
      impressions: 8900,
      clicks: 1831,
      conversions: 94,
      revenue: 3250,
      currency: 'USD',
      conversionRate: 0.051,
      avgOrderValue: 34.57,
      trendImpressions: 23.5,
      trendRevenue: 15.2,
    },
    '90d': {
      widgetId: 'wgt_ghi789',
      period: '90d',
      impressions: 26700,
      clicks: 5493,
      conversions: 282,
      revenue: 9750,
      currency: 'USD',
      conversionRate: 0.051,
      avgOrderValue: 34.57,
      trendImpressions: 31.0,
      trendRevenue: 22.8,
    },
  },
};

// Deterministic chart data — no Math.random()
const MOCK_CHART_DATA: Record<string, Record<MetricsPeriod, PeriodDataPoint[]>> = {
  wgt_abc123: {
    '7d': [
      { date: '2026-04-22', clicks: 65, conversions: 4, revenue: 285 },
      { date: '2026-04-23', clicks: 82, conversions: 5, revenue: 360 },
      { date: '2026-04-24', clicks: 71, conversions: 4, revenue: 290 },
      { date: '2026-04-25', clicks: 108, conversions: 7, revenue: 490 },
      { date: '2026-04-26', clicks: 94, conversions: 6, revenue: 415 },
      { date: '2026-04-27', clicks: 60, conversions: 3, revenue: 215 },
      { date: '2026-04-28', clicks: 120, conversions: 8, revenue: 530 },
    ],
    '30d': [
      { date: '2026-03-29', clicks: 60, conversions: 3, revenue: 210 },
      { date: '2026-04-01', clicks: 75, conversions: 4, revenue: 280 },
      { date: '2026-04-05', clicks: 88, conversions: 5, revenue: 350 },
      { date: '2026-04-08', clicks: 102, conversions: 6, revenue: 420 },
      { date: '2026-04-12', clicks: 95, conversions: 6, revenue: 405 },
      { date: '2026-04-16', clicks: 110, conversions: 7, revenue: 480 },
      { date: '2026-04-20', clicks: 120, conversions: 8, revenue: 530 },
    ],
    '90d': [
      { date: '2026-01-29', clicks: 45, conversions: 2, revenue: 145 },
      { date: '2026-02-12', clicks: 62, conversions: 4, revenue: 275 },
      { date: '2026-02-26', clicks: 78, conversions: 5, revenue: 345 },
      { date: '2026-03-12', clicks: 91, conversions: 6, revenue: 395 },
      { date: '2026-03-26', clicks: 105, conversions: 7, revenue: 450 },
      { date: '2026-04-09', clicks: 115, conversions: 7, revenue: 500 },
      { date: '2026-04-28', clicks: 120, conversions: 8, revenue: 530 },
    ],
  },
  wgt_def456: {
    '7d': [
      { date: '2026-04-22', clicks: 22, conversions: 1, revenue: 0 },
      { date: '2026-04-23', clicks: 35, conversions: 2, revenue: 0 },
      { date: '2026-04-24', clicks: 28, conversions: 1, revenue: 0 },
      { date: '2026-04-25', clicks: 41, conversions: 2, revenue: 0 },
      { date: '2026-04-26', clicks: 30, conversions: 1, revenue: 0 },
      { date: '2026-04-27', clicks: 20, conversions: 1, revenue: 0 },
      { date: '2026-04-28', clicks: 38, conversions: 2, revenue: 0 },
    ],
    '30d': [
      { date: '2026-03-29', clicks: 20, conversions: 1, revenue: 0 },
      { date: '2026-04-01', clicks: 28, conversions: 1, revenue: 0 },
      { date: '2026-04-05', clicks: 35, conversions: 2, revenue: 0 },
      { date: '2026-04-08', clicks: 40, conversions: 2, revenue: 0 },
      { date: '2026-04-12', clicks: 32, conversions: 1, revenue: 0 },
      { date: '2026-04-16', clicks: 36, conversions: 2, revenue: 0 },
      { date: '2026-04-20', clicks: 38, conversions: 2, revenue: 0 },
    ],
    '90d': [
      { date: '2026-01-29', clicks: 15, conversions: 0, revenue: 0 },
      { date: '2026-02-12', clicks: 22, conversions: 1, revenue: 0 },
      { date: '2026-02-26', clicks: 28, conversions: 1, revenue: 0 },
      { date: '2026-03-12', clicks: 32, conversions: 2, revenue: 0 },
      { date: '2026-03-26', clicks: 36, conversions: 2, revenue: 0 },
      { date: '2026-04-09', clicks: 37, conversions: 2, revenue: 0 },
      { date: '2026-04-28', clicks: 38, conversions: 2, revenue: 0 },
    ],
  },
  wgt_ghi789: {
    '7d': [
      { date: '2026-04-22', clicks: 52, conversions: 3, revenue: 104 },
      { date: '2026-04-23', clicks: 68, conversions: 4, revenue: 138 },
      { date: '2026-04-24', clicks: 55, conversions: 3, revenue: 104 },
      { date: '2026-04-25', clicks: 80, conversions: 5, revenue: 173 },
      { date: '2026-04-26', clicks: 72, conversions: 4, revenue: 138 },
      { date: '2026-04-27', clicks: 48, conversions: 2, revenue: 69 },
      { date: '2026-04-28', clicks: 88, conversions: 5, revenue: 173 },
    ],
    '30d': [
      { date: '2026-03-29', clicks: 50, conversions: 3, revenue: 104 },
      { date: '2026-04-01', clicks: 60, conversions: 3, revenue: 104 },
      { date: '2026-04-05', clicks: 72, conversions: 4, revenue: 138 },
      { date: '2026-04-08', clicks: 85, conversions: 4, revenue: 138 },
      { date: '2026-04-12', clicks: 78, conversions: 4, revenue: 138 },
      { date: '2026-04-16', clicks: 90, conversions: 5, revenue: 173 },
      { date: '2026-04-20', clicks: 88, conversions: 5, revenue: 173 },
    ],
    '90d': [
      { date: '2026-01-29', clicks: 40, conversions: 2, revenue: 69 },
      { date: '2026-02-12', clicks: 52, conversions: 3, revenue: 104 },
      { date: '2026-02-26', clicks: 65, conversions: 3, revenue: 104 },
      { date: '2026-03-12', clicks: 75, conversions: 4, revenue: 138 },
      { date: '2026-03-26', clicks: 82, conversions: 4, revenue: 138 },
      { date: '2026-04-09', clicks: 88, conversions: 5, revenue: 173 },
      { date: '2026-04-28', clicks: 88, conversions: 5, revenue: 173 },
    ],
  },
};

const MOCK_PROJECT: StudioProject = {
  id: 'proj_demo',
  partnerId: 'partner_demo',
  name: 'Mi Proyecto Elements',
  widgets: MOCK_WIDGETS,
  status: 'draft',
  createdAt: '2026-04-01T00:00:00Z',
  updatedAt: '2026-04-29T00:00:00Z',
};

const INITIAL_BUILDER: BuilderState = {
  step: 0,
  config: {},
  isDirty: false,
};

// ─── Store Interface ──────────────────────────────────────────────────────────

interface ElementsState {
  project: StudioProject;
  widgets: WidgetConfig[];
  metrics: Record<string, Record<MetricsPeriod, WidgetMetrics>>;
  chartData: Record<string, Record<MetricsPeriod, PeriodDataPoint[]>>;
  builder: BuilderState;

  getMetrics: (widgetId: string, period: MetricsPeriod) => WidgetMetrics | undefined;
  getChartData: (widgetId: string, period: MetricsPeriod) => PeriodDataPoint[];

  addWidget: (w: Omit<WidgetConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWidget: (id: string, updates: Partial<WidgetConfig>) => void;
  deleteWidget: (id: string) => void;

  setBuilderType: (type: WidgetType) => void;
  setBuilderName: (name: string) => void;
  setBuilderTheme: (theme: Partial<WidgetTheme>) => void;
  setBuilderRails: (ids: string[]) => void;
  setBuilderFeatures: (features: Partial<WidgetFeatures>) => void;
  setBuilderDeliveryMode: (mode: SDKDeliveryMode) => void;
  setBuilderComplianceRules: (rules: ComplianceRule[]) => void;
  setBuilderWebhookConfig: (config: Partial<WebhookConfig>) => void;
  setBuilderStep: (step: BuilderStep) => void;
  advanceBuilder: () => void;
  backBuilder: () => void;
  resetBuilder: () => void;
  saveBuilderWidget: () => string | null;
  patchBuilder: (config: Partial<BuilderConfig>) => void;
}

// Load demo seed only when explicitly enabled (dev/demo envs)
const isDemoData = import.meta.env.VITE_ELEMENTS_ENABLE_DEMO_DATA === 'true';

// ─── Store ────────────────────────────────────────────────────────────────────

export const useElementsStore = create<ElementsState>()(
  persist(
    (set, get) => ({
      project: isDemoData ? MOCK_PROJECT : { ...MOCK_PROJECT, widgets: [] },
      widgets: isDemoData ? MOCK_WIDGETS : [],
      metrics: MOCK_METRICS,
      chartData: MOCK_CHART_DATA,
      builder: INITIAL_BUILDER,

      getMetrics: (widgetId, period) => get().metrics[widgetId]?.[period],
      getChartData: (widgetId, period) => get().chartData[widgetId]?.[period] ?? [],

      addWidget: (w) => {
        const id = `wgt_${Date.now().toString(36)}`;
        const now = new Date().toISOString();
        const widget: WidgetConfig = { ...w, id, createdAt: now, updatedAt: now };
        set((state) => ({ widgets: [widget, ...state.widgets] }));
        return id;
      },

      updateWidget: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, ...updates, updatedAt: now } : w
          ),
        }));
      },

      deleteWidget: (id) => {
        set((state) => ({ widgets: state.widgets.filter((w) => w.id !== id) }));
      },

      setBuilderType: (type) => {
        set((state) => ({
          builder: { ...state.builder, config: { ...state.builder.config, type }, isDirty: true },
        }));
      },

      setBuilderName: (name) => {
        set((state) => ({
          builder: { ...state.builder, config: { ...state.builder.config, name }, isDirty: true },
        }));
      },

      setBuilderTheme: (theme) => {
        set((state) => ({
          builder: {
            ...state.builder,
            config: {
              ...state.builder.config,
              theme: { ...DEFAULT_THEME, ...state.builder.config.theme, ...theme },
            },
            isDirty: true,
          },
        }));
      },

      setBuilderRails: (ids) => {
        set((state) => ({
          builder: {
            ...state.builder,
            config: { ...state.builder.config, enabledRails: ids },
            isDirty: true,
          },
        }));
      },

      setBuilderFeatures: (features) => {
        set((state) => ({
          builder: {
            ...state.builder,
            config: {
              ...state.builder.config,
              features: { ...state.builder.config.features, ...features },
            },
            isDirty: true,
          },
        }));
      },

      setBuilderStep: (step) => {
        set((state) => ({ builder: { ...state.builder, step } }));
      },

      advanceBuilder: () => {
        const { builder } = get();
        const maxStep: BuilderStep = builder.config.deliveryMode === 'headless' ? 4 : 3;
        const next = Math.min(builder.step + 1, maxStep) as BuilderStep;
        set((state) => ({ builder: { ...state.builder, step: next } }));
      },

      backBuilder: () => {
        const { builder } = get();
        const prev = Math.max(builder.step - 1, 0) as BuilderStep;
        set((state) => ({ builder: { ...state.builder, step: prev } }));
      },

      resetBuilder: () => {
        set({ builder: INITIAL_BUILDER });
      },

      saveBuilderWidget: () => {
        const { builder } = get();
        const cfg = builder.config;
        if (!cfg.type) return null;

        const id = `wgt_${Date.now().toString(36)}`;
        const now = new Date().toISOString();
        const widget: WidgetConfig = {
          id,
          type: cfg.type,
          name: cfg.name ?? `Widget ${cfg.type}`,
          theme: cfg.theme ?? DEFAULT_THEME,
          enabledRails: cfg.enabledRails ?? [],
          features: cfg.features ?? {},
          targetSegment: 'generic',
          allowedOrigins: [],
          createdAt: now,
          updatedAt: now,
          status: 'draft',
          deliveryMode: cfg.deliveryMode ?? 'widget',
          ...(cfg.complianceRules && { complianceRules: cfg.complianceRules }),
          ...(cfg.webhookConfig?.endpoint && { webhookConfig: cfg.webhookConfig as WebhookConfig }),
        };
        set((state) => ({
          widgets: [widget, ...state.widgets],
          builder: INITIAL_BUILDER,
        }));
        return id;
      },

      setBuilderDeliveryMode: (mode) => {
        set((state) => ({
          builder: {
            ...state.builder,
            config: { ...state.builder.config, deliveryMode: mode },
            isDirty: true,
          },
        }));
      },

      setBuilderComplianceRules: (rules) => {
        set((state) => ({
          builder: {
            ...state.builder,
            config: { ...state.builder.config, complianceRules: rules },
            isDirty: true,
          },
        }));
      },

      setBuilderWebhookConfig: (webhookConfig) => {
        set((state) => ({
          builder: {
            ...state.builder,
            config: {
              ...state.builder.config,
              webhookConfig: { ...state.builder.config.webhookConfig, ...webhookConfig },
            },
            isDirty: true,
          },
        }));
      },

      patchBuilder: (config) => {
        set((state) => ({
          builder: {
            ...state.builder,
            config: { ...state.builder.config, ...config },
            isDirty: true,
          },
        }));
      },
    }),
    {
      name: 'soberana-elements-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        widgets: state.widgets,
        project: state.project,
      }),
    }
  )
);
