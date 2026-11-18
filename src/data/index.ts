/**
 * Loopay Payments Data - Index
 * 
 * Este módulo exporta todos los datos de configuración de pagos de Loopay
 * para uso en la aplicación Antigravity.
 */

// ============================================================================
// DATOS INTERNACIONALES (Nium + Bridge)
// ============================================================================

// Playbook de Pay-out por país (Nium) - 213 países, 429 métodos
export { default as playbookPayout } from './playbook-payout.json';

// Playbook de Pay-in por país - Métodos de recepción de pagos
export { default as playbookPayin } from './playbook-payin.json';

// Documentación de Bridge API para Virtual Accounts y Transfers
export { default as bridgeApiDocs } from './bridge-api-documentation.json';

// Playbook unificado de pagos Loopay (Onramp/Offramp/Payout)
export { default as loopayPaymentsPlaybook } from './loopay-payments-playbook.json';

// API de Transacciones Loopay (On-Ramp, Off-Ramp, Transfer)
export { default as loopayTransactionsApi } from './loopay-transactions-api.json';

// ============================================================================
// DATOS COLOMBIA (Productos Locales)
// ============================================================================

// Productos Loopay Colombia (Estándar, Estándar Pro, Óptimo Pro, Recaudo, CrossBorder)
export { default as loopayProductosColombia } from './loopay-productos-colombia.json';

// ============================================================================
// ARQUITECTURA SOBERANA (Yield + Spend)
// ============================================================================

// Loopay Soberana - Sistema Operativo de Tesorería Autónoma
export { default as loopaySoberanaArchitecture } from './loopay-soberana-architecture.json';

// Types
export interface PayoutCountry {
  región: string;
  secciones: PayoutSection[];
}

export interface PayoutSection {
  método_pago: string;
  monedas_pago: string;
  red_participante?: string;
  fuente_fx?: string;
  canales?: string;
  tipos_pago?: string;
  corte_entrega?: string;
  datos_obligatorios?: string[];
  documentos_soporte?: string;
  narrativa_beneficiario?: string;
  prueba_pago?: string;
  notas?: string;
  límites?: {
    B2B?: { min: string; max: string };
    B2P?: { min: string; max: string };
    P2P?: { min: string; max: string };
    P2B?: { min: string; max: string };
  };
}

export interface TransactionType {
  ON_RAMP: 'ON_RAMP';
  OFF_RAMP: 'OFF_RAMP';
  TRANSFER: 'TRANSFER';
}

export interface TransactionStatus {
  AWAITING_FUNDS: 'AWAITING_FUNDS';
  TRANSFERRING_FIAT: 'TRANSFERRING_FIAT';
  TRADING: 'TRADING';
  TRANSFERRING_STABLECOIN: 'TRANSFERRING_STABLECOIN';
  PROCESSING: 'PROCESSING';
  SUCCESS: 'SUCCESS';
  FAILED: 'FAILED';
  REFUNDING: 'REFUNDING';
  REFUNDED: 'REFUNDED';
}

export interface SupportedCurrency {
  fiat: 'USD' | 'EUR' | 'MXN' | 'BRL';
  crypto: 'USDC' | 'USDT' | 'EURC';
}

export interface SupportedBlockchain {
  ethereum: 'ethereum';
  polygon: 'polygon';
  base: 'base';
  arbitrum: 'arbitrum';
  solana: 'solana';
  optimism: 'optimism';
}

export interface PaymentRail {
  ACH: 'ACH';
  WIRE: 'WIRE';
  SEPA: 'SEPA';
  SEPA_INSTANT: 'SEPA_INSTANT';
  SPEI: 'SPEI';
  PIX: 'PIX';
}

// Helper functions
export const getCountryPayout = (countryName: string): PayoutCountry | undefined => {
  const playbook = require('./playbook-payout.json');
  return playbook.playbook[countryName];
};

export const getPayoutMethodsForCountry = (countryName: string): string[] => {
  const country = getCountryPayout(countryName);
  if (!country) return [];
  return country.secciones.map(s => s.método_pago).filter(Boolean);
};

export const getSupportedCountries = (): string[] => {
  const playbook = require('./playbook-payout.json');
  return Object.keys(playbook.playbook);
};

export const getCountriesByRegion = (region: string): string[] => {
  const playbook = require('./playbook-payout.json');
  return Object.entries(playbook.playbook)
    .filter(([_, data]: [string, any]) => data.región === region)
    .map(([country]) => country);
};

export const SUPPORTED_REGIONS = [
  'África',
  'Asia',
  'Europa',
  'Norteamérica',
  'Sudamérica',
  'Oceanía'
] as const;

export const TRANSACTION_TYPES = {
  ON_RAMP: 'ON_RAMP',
  OFF_RAMP: 'OFF_RAMP',
  TRANSFER: 'TRANSFER'
} as const;

export const FIAT_CURRENCIES = ['USD', 'EUR', 'MXN', 'BRL'] as const;
export const CRYPTO_CURRENCIES = ['USDC', 'USDT', 'EURC'] as const;
export const BLOCKCHAINS = ['ethereum', 'polygon', 'base', 'arbitrum', 'solana', 'optimism'] as const;
export const PAYMENT_RAILS = ['ACH', 'WIRE', 'SEPA', 'SEPA_INSTANT', 'SPEI', 'PIX'] as const;
