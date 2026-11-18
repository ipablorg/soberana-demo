/**
 * GlobalConnectors Mock Data
 * 
 * NOTA: Este archivo contiene datos mock para desarrollo.
 * Una vez que el backend implemente el query globalconnectors_supportedCorridors,
 * estos datos serán reemplazados por datos reales.
 * 
 * Backend debe implementar:
 * query GetSupportedCorridors {
 *   globalconnectors_supportedCorridors {
 *     id
 *     description
 *     sourceCountry
 *     sourceCurrency
 *     sourceRail
 *     destinationCountry
 *     destinationCurrency
 *     destinationRail
 *     settlementCurrency
 *     isBidirectional
 *     flowType
 *   }
 * }
 */

import type { Corridor } from '@/shared/types/globalconnectors.types';

export const MOCK_CORRIDORS: Corridor[] = [
  {
    id: 'EUR_TO_USD',
    description: 'Europa a USA',
    sourceCountry: 'Europe',
    sourceCurrency: 'EUR',
    sourceRail: 'SEPA',
    destinationCountry: 'USA',
    destinationCurrency: 'USD',
    destinationRail: 'ACH',
    settlementCurrency: 'USDC',
    isBidirectional: true,
    flowType: 'fiat_to_fiat',
  },
  {
    id: 'USD_TO_EUR',
    description: 'USA a Europa',
    sourceCountry: 'USA',
    sourceCurrency: 'USD',
    sourceRail: 'ACH',
    destinationCountry: 'Europe',
    destinationCurrency: 'EUR',
    destinationRail: 'SEPA',
    settlementCurrency: 'USDC',
    isBidirectional: true,
    flowType: 'fiat_to_fiat',
  },
  {
    id: 'MXN_TO_USD',
    description: 'México a USA',
    sourceCountry: 'Mexico',
    sourceCurrency: 'MXN',
    sourceRail: 'SPEI',
    destinationCountry: 'USA',
    destinationCurrency: 'USD',
    destinationRail: 'ACH',
    settlementCurrency: 'USDC',
    isBidirectional: true,
    flowType: 'fiat_to_fiat',
  },
  {
    id: 'USD_TO_MXN',
    description: 'USA a México',
    sourceCountry: 'USA',
    sourceCurrency: 'USD',
    sourceRail: 'ACH',
    destinationCountry: 'Mexico',
    destinationCurrency: 'MXN',
    destinationRail: 'SPEI',
    settlementCurrency: 'USDC',
    isBidirectional: true,
    flowType: 'fiat_to_fiat',
  },
  {
    id: 'BRL_TO_USD',
    description: 'Brasil a USA',
    sourceCountry: 'Brazil',
    sourceCurrency: 'BRL',
    sourceRail: 'PIX',
    destinationCountry: 'USA',
    destinationCurrency: 'USD',
    destinationRail: 'ACH',
    settlementCurrency: 'USDC',
    isBidirectional: true,
    flowType: 'fiat_to_fiat',
  },
  {
    id: 'USD_TO_BRL',
    description: 'USA a Brasil',
    sourceCountry: 'USA',
    sourceCurrency: 'USD',
    sourceRail: 'ACH',
    destinationCountry: 'Brazil',
    destinationCurrency: 'BRL',
    destinationRail: 'PIX',
    settlementCurrency: 'USDC',
    isBidirectional: true,
    flowType: 'fiat_to_fiat',
  },
];

/**
 * Flag to control whether to use mock data
 * Set to false once backend implements the real endpoint
 * 
 * ✅ Backend implementado el 23 de diciembre de 2025
 */
export const USE_MOCK_CORRIDORS = false;

