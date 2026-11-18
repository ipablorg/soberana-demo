/**
 * Bridge Transnational Flows Types
 * 
 * Tipos para los flujos complejos multi-regionales de Bridge API
 */

export type BridgeRail = 'sepa' | 'sepa_credit' | 'spei' | 'pix' | 'ach' | 'ach_next_day' | 'wire' | 'wire_international' | 'crypto_transfer';

export type BridgeAction = 'deposit' | 'payout' | 'convert';

export type BridgeCurrency = 'USD' | 'EUR' | 'MXN' | 'BRL' | 'COP' | 'USDC' | 'USDT';

export type BridgeRegion = 
  | 'Spain' 
  | 'Ecuador' 
  | 'Colombia' 
  | 'Mexico' 
  | 'Brazil' 
  | 'USA'
  | 'Europe';

/**
 * Paso individual en un flujo transnacional
 */
export interface BridgeFlowLeg {
  step: number;
  region: BridgeRegion;
  currency: BridgeCurrency;
  rail: BridgeRail;
  action: BridgeAction;
  notes: string;
  amount?: number; // Se llena dinámicamente
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  transactionId?: string;
  estimatedTime?: string;
  fee?: number;
}

/**
 * Flujo completo transnacional
 */
export interface BridgeTransnationalFlow {
  id: string;
  description: string;
  flow_direction: string;
  legs: BridgeFlowLeg[];
  
  // Metadata
  totalAmount?: number;
  totalFees?: number;
  estimatedDuration?: string;
  status?: 'draft' | 'active' | 'completed' | 'failed';
}

/**
 * Configuración completa de Bridge
 */
export interface BridgeFlowsConfig {
  provider: 'bridge_xyz';
  environment: 'sandbox' | 'production';
  base_currency: BridgeCurrency;
  supported_rails: BridgeRail[];
  documentation_reference: string;
  use_cases: BridgeTransnationalFlow[];
  required_endpoints: BridgeEndpoint[];
}

/**
 * Endpoint de Bridge API
 */
export interface BridgeEndpoint {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  purpose: string;
}

/**
 * Request para iniciar una transferencia
 */
export interface BridgeTransferRequest {
  source: {
    currency: BridgeCurrency;
    amount: number;
    external_account_id?: string;
  };
  destination: {
    currency: BridgeCurrency;
    external_account_id?: string;
    address?: string; // Para crypto
  };
  customer_id: string;
  idempotency_key: string;
}

/**
 * Response de un transfer
 */
export interface BridgeTransferResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  source: {
    currency: BridgeCurrency;
    amount: number;
  };
  destination: {
    currency: BridgeCurrency;
    amount: number;
  };
  fees: {
    amount: number;
    currency: BridgeCurrency;
  };
  created_at: string;
  updated_at: string;
  estimated_completion: string;
}

/**
 * Quote/Cotización FX
 */
export interface BridgeQuote {
  id: string;
  source_currency: BridgeCurrency;
  destination_currency: BridgeCurrency;
  source_amount: number;
  destination_amount: number;
  exchange_rate: number;
  fee_amount: number;
  fee_currency: BridgeCurrency;
  expires_at: string;
}

/**
 * Estado de ejecución de un flujo
 */
export interface FlowExecutionState {
  flowId: string;
  currentStep: number;
  legs: BridgeFlowLeg[];
  totalAmount: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

