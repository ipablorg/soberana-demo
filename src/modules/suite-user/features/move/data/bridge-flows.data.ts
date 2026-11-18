/**
 * Bridge Transnational Flows Configuration
 * 
 * Configuración de los flujos complejos multi-regionales
 */

import type { BridgeFlowsConfig } from '../types/bridge-flows.types';

export const BRIDGE_FLOWS_CONFIG: BridgeFlowsConfig = {
  provider: "bridge_xyz",
  environment: "sandbox",
  base_currency: "USDC",
  supported_rails: ["sepa", "spei", "pix", "ach", "wire"],
  documentation_reference: "https://apidocs.bridge.xyz/",
  required_endpoints: [
    { method: "POST", path: "/transfers", purpose: "Initiate movement" },
    { method: "POST", path: "/customers", purpose: "KYC/KYB placeholder" },
    { method: "POST", path: "/external_accounts", purpose: "Link bank accounts" },
    { method: "GET", path: "/quotes", purpose: "FX estimation" }
  ],
  use_cases: [
    {
      id: "CASE_1_EU_ANDES",
      description: "Flujo Transatlántico: Europa hacia Región Andina",
      flow_direction: "Inbound (EUR) -> Settlement (USDC) -> Outbound (USD/Crypto)",
      legs: [
        {
          step: 1,
          region: "Spain",
          currency: "EUR",
          rail: "sepa_credit",
          action: "deposit",
          notes: "Recepción de fondos en Virtual IBAN (EUR)",
          estimatedTime: "Tiempo real (segundos)"
        },
        {
          step: 2,
          region: "Ecuador",
          currency: "USD",
          rail: "wire_international",
          action: "payout",
          notes: "Salida vía SWIFT a cuenta bancaria local (Economía dolarizada)",
          estimatedTime: "Tiempo real (< 1 minuto)"
        },
        {
          step: 3,
          region: "Colombia",
          currency: "USDC",
          rail: "crypto_transfer",
          action: "payout",
          notes: "Dispersión directa en stablecoin (on-chain) para conversión local posterior",
          estimatedTime: "Tiempo real (< 30 segundos)"
        }
      ]
    },
    {
      id: "CASE_2_PAN_AMERICAS",
      description: "Corredor Panamericano: Recaudo Latam y Settlement USA",
      flow_direction: "Inbound (MXN/BRL) -> Settlement (USDC) -> Outbound (USD)",
      legs: [
        {
          step: 1,
          region: "Mexico",
          currency: "MXN",
          rail: "spei",
          action: "deposit",
          notes: "Recepción vía CLABE (Virtual Account)",
          estimatedTime: "Tiempo real (< 10 segundos)"
        },
        {
          step: 2,
          region: "Brazil",
          currency: "BRL",
          rail: "pix",
          action: "deposit",
          notes: "Recepción vía código PIX dinámico",
          estimatedTime: "Tiempo real (< 5 segundos)"
        },
        {
          step: 3,
          region: "USA",
          currency: "USD",
          rail: "ach_next_day",
          action: "payout",
          notes: "Settlement final en cuenta bancaria americana",
          estimatedTime: "Tiempo real (< 1 minuto)"
        }
      ]
    }
  ]
};

/**
 * Iconos y colores por región
 */
export const REGION_CONFIG = {
  Spain: { flag: '🇪🇸', color: 'text-muted-foreground', bgColor: 'bg-muted/50' },
  Ecuador: { flag: '🇪🇨', color: 'text-muted-foreground', bgColor: 'bg-muted/50' },
  Colombia: { flag: '🇨🇴', color: 'text-muted-foreground', bgColor: 'bg-muted/50' },
  Mexico: { flag: '🇲🇽', color: 'text-muted-foreground', bgColor: 'bg-muted/50' },
  Brazil: { flag: '🇧🇷', color: 'text-muted-foreground', bgColor: 'bg-muted/50' },
  USA: { flag: '🇺🇸', color: 'text-muted-foreground', bgColor: 'bg-muted/50' },
  Europe: { flag: '🇪🇺', color: 'text-muted-foreground', bgColor: 'bg-muted/50' },
} as const;

/**
 * Iconos y colores por acción
 */
export const ACTION_CONFIG = {
  deposit: { 
    label: 'Recibir', 
    icon: '↓',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50'
  },
  payout: { 
    label: 'Enviar', 
    icon: '↑',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50'
  },
  convert: { 
    label: 'Convertir', 
    icon: '⟳',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50'
  },
} as const;

/**
 * Iconos por rail de pago
 */
export const RAIL_ICONS = {
  sepa: '🏦',
  sepa_credit: '🏦',
  spei: '💳',
  pix: '⚡',
  ach: '🏛️',
  ach_next_day: '🏛️',
  wire: '💼',
  wire_international: '🌐',
  crypto_transfer: '₿',
} as const;

