import type { WidgetCatalogEntry } from '../types';

export const WIDGET_CATALOG: WidgetCatalogEntry[] = [
  {
    type: 'payment-button',
    labelKey: 'Botón de Pago',
    descriptionKey: 'One-click off-ramp con justificación de tasa por Zentinel. Ideal para cobros a freelancers y marketplaces.',
    segments: ['gig-economy', 'marketplace', 'generic'],
    defaultFeatures: {
      zentinelTooltips: true,
      oneClickOffRamp: true,
      oneClickOnRamp: false,
      bankValidation: true,
    },
    iconName: 'Wallet',
  },
  {
    type: 'kyc-module',
    labelKey: 'Módulo KYC',
    descriptionKey: 'Onboarding híbrido con biometría y validación documental. Fortress Compliance en tiempo real.',
    segments: ['gig-economy', 'marketplace'],
    defaultFeatures: {
      kycBiometric: true,
      complianceChat: true,
      bankValidation: true,
    },
    iconName: 'UserCheck',
  },
  {
    type: 'wallet-dashboard',
    labelKey: 'Dashboard de Saldo',
    descriptionKey: 'Billetera embebida multi-currency con historial de transacciones, fondeo one-click y retiro one-click.',
    segments: ['saas-b2b', 'marketplace', 'generic'],
    defaultFeatures: {
      zentinelTooltips: true,
      oneClickOffRamp: true,
      oneClickOnRamp: true,
      bankValidation: true,
    },
    iconName: 'PiggyBank',
  },
  {
    type: 'invoice-payment',
    labelKey: 'Invoice-to-Payment',
    descriptionKey: 'Pago de facturas con cálculo automático de retenciones SRI/DIAN y asiento contable al ERP.',
    segments: ['saas-b2b'],
    defaultFeatures: {
      retentionCalc: true,
      accountingWebhook: true,
      deepLinkPayload: true,
      zentinelTooltips: true,
    },
    iconName: 'Receipt',
  },
];

export const VALID_WIDGET_TYPES = WIDGET_CATALOG.map(w => w.type);

export function getCatalogEntry(type: string): WidgetCatalogEntry | undefined {
  return WIDGET_CATALOG.find(w => w.type === type);
}
