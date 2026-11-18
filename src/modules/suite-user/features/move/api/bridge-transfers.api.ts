/**
 * Bridge Transfers API Service
 * 
 * Servicio para interactuar con Bridge API a través del backend de Loopay
 * NO llama directamente a Bridge API (CORS + Security)
 * 
 * NOTA: Backend resolvers pendientes de implementación - usando MOCKS temporalmente
 * Ver: BRIDGE_NEXT_STEPS.md
 */

import type { 
  BridgeTransferRequest, 
  BridgeTransferResponse,
  BridgeQuote,
  BridgeCurrency 
} from '../types/bridge-flows.types';

/**
 * Crear un transfer usando GraphQL (con fallback a mock)
 * Llama al backend de Loopay, que se encarga de Bridge API
 * 
 * NOTA: Por ahora usa MOCK mientras el backend implementa los resolvers
 */
export async function createBridgeTransfer(
  request: BridgeTransferRequest
): Promise<BridgeTransferResponse> {
  // TODO: Implementar GraphQL cuando el backend tenga los resolvers
  // Ver: BRIDGE_NEXT_STEPS.md
  console.warn('⚠️ Backend resolvers pendientes. Usando MOCK data.');
  
  return createMockTransfer(request);
}

/**
 * Obtener cotización FX usando GraphQL (con fallback a mock)
 * 
 * NOTA: Por ahora usa MOCK mientras el backend implementa los resolvers
 */
export async function getBridgeQuote(
  sourceCurrency: string,
  destinationCurrency: string,
  sourceAmount: number
): Promise<BridgeQuote> {
  // TODO: Implementar GraphQL cuando el backend tenga los resolvers
  return createMockQuote(sourceCurrency, destinationCurrency, sourceAmount);
}

/**
 * Obtener estado de un transfer
 * TODO: Implementar query GraphQL en el backend
 */
export async function getBridgeTransferStatus(
  transferId: string
): Promise<BridgeTransferResponse> {
  // Por ahora, mock hasta que el backend tenga el query
  console.warn('[Bridge API] getBridgeTransferStatus not implemented yet');
  return {
    id: transferId,
    status: 'completed',
    source: { currency: 'EUR', amount: 0 },
    destination: { currency: 'USD', amount: 0 },
    fees: { amount: 0, currency: 'EUR' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    estimated_completion: new Date().toISOString(),
  } as BridgeTransferResponse;
}

/**
 * Verificar KYC del customer
 * Usa el query existente de clients
 */
export async function getBridgeCustomer(customerId: string) {
  // TODO: Usar query GraphQL del backend cuando esté disponible
  console.warn('[Bridge API] getBridgeCustomer via GraphQL not implemented yet');
  return { id: customerId, kyc_status: 'approved' };
}

/**
 * Listar external accounts del customer
 * Usa el query existente de bank accounts
 */
export async function getBridgeExternalAccounts(_customerId: string) {
  console.warn('[Bridge API] getBridgeExternalAccounts via GraphQL not implemented yet');
  return { data: [] };
}

/**
 * Crear external account
 * Usa el mutation existente de bank accounts
 */
export async function createBridgeExternalAccount(
  _customerId: string,
  _accountData: any
) {
  console.warn('[Bridge API] createBridgeExternalAccount via GraphQL not implemented yet');
  return { id: 'account_mock' };
}

/**
 * Generar idempotency key único
 */
export function generateIdempotencyKey(): string {
  return `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * MOCK: Crear transferencia simulada
 */
function createMockTransfer(request: BridgeTransferRequest): Promise<BridgeTransferResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const exchangeRates: Record<string, Record<string, number>> = {
        'EUR': { 'USD': 1.12, 'MXN': 19.5, 'BRL': 5.5, 'USDC': 1.11 },
        'USD': { 'EUR': 0.89, 'MXN': 17.2, 'BRL': 4.9, 'USDC': 1.0 },
        'MXN': { 'USD': 0.058, 'EUR': 0.051, 'BRL': 0.28 },
        'BRL': { 'USD': 0.20, 'EUR': 0.18, 'MXN': 3.54 },
        'USDC': { 'USD': 1.0, 'EUR': 0.90 },
      };

      const rate = exchangeRates[request.source.currency]?.[request.destination.currency] || 1.0;
      const destinationAmount = request.source.amount * rate;
      const fee = request.source.amount * 0.005; // 0.5% fee

      resolve({
        id: `transfer_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'completed',
        source: {
          currency: request.source.currency,
          amount: request.source.amount,
        },
        destination: {
          currency: request.destination.currency,
          amount: destinationAmount,
        },
        fees: {
          amount: fee,
          currency: request.source.currency,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        estimated_completion: new Date(Date.now() + 1000).toISOString(),
      } as BridgeTransferResponse);
    }, 1500); // Simular latencia de red
  });
}

/**
 * MOCK: Crear cotización simulada
 */
function createMockQuote(
  sourceCurrency: string,
  destinationCurrency: string,
  sourceAmount: number
): BridgeQuote {
  const exchangeRates: Record<string, Record<string, number>> = {
    'EUR': { 'USD': 1.12, 'MXN': 19.5, 'BRL': 5.5, 'USDC': 1.11 },
    'USD': { 'EUR': 0.89, 'MXN': 17.2, 'BRL': 4.9, 'USDC': 1.0 },
    'MXN': { 'USD': 0.058, 'EUR': 0.051, 'BRL': 0.28 },
    'BRL': { 'USD': 0.20, 'EUR': 0.18, 'MXN': 3.54 },
    'USDC': { 'USD': 1.0, 'EUR': 0.90 },
  };

  const rate = exchangeRates[sourceCurrency]?.[destinationCurrency] || 1.0;
  const destinationAmount = sourceAmount * rate;
  const fee = sourceAmount * 0.005; // 0.5% fee

  return {
    id: `quote_mock_${Date.now()}`,
    source_currency: sourceCurrency as BridgeCurrency,
    destination_currency: destinationCurrency as BridgeCurrency,
    source_amount: sourceAmount,
    destination_amount: destinationAmount,
    exchange_rate: rate,
    fee_amount: fee,
    fee_currency: sourceCurrency as BridgeCurrency,
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutos
  };
}

