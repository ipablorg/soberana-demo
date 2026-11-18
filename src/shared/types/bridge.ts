/**
 * Bridge Product Types
 * 
 * Types for bridge products (on-ramp/off-ramp operations)
 * Legacy provider-shaped types kept for the remaining consumers.
 */

export interface BridgeProduct {
  id: string;
  name: string; // "X pres", "3X", "X Rate", "Pre X"
  type: 'instant' | 'freeze' | 'close' | 'prefund';
  time: number; // Minutes to freeze/close rate (0 = instant)
  description: string;
  img: string; // Icon URL from Firebase Storage
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface CurrencyPair {
  from: string; // 'USDT'
  to: string; // 'COP', 'USD', 'MXN', 'BRL', etc.
  rate: number; // Current rate
  marketRate: number; // Market rate for comparison
  lastUpdated: Date;
  updateInterval: number; // Update interval in milliseconds
  settlementType?: 'SD' | 'ND'; // Same Day or Next Day
}

export interface RateRequest {
  id: string;
  productId: string;
  productName: string;
  productType: 'instant' | 'freeze' | 'close' | 'prefund';
  productTime: number;
  clientId: string;
  phone: string;
  currencyPair: string; // "USDT-COP", "USDT-USD", etc.
  initialAmount: number; // USDT amount
  finalRate: number; // Locked rate
  totalFiat: number; // Amount in fiat currency
  requestState: 'initial' | 'completed' | 'cancelled' | 'expired';
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  expiresAt?: Date;
  walletAddress?: string;
  fromAccountId?: string; // For tracking source account
  toAccountId?: string; // For tracking destination account
}

export interface RateCalculation {
  usdtAmount: number;
  fiatAmount: number;
  rate: number;
  fee: number;
  feePercentage: number;
  estimatedTime: string;
  settlementType: 'SD' | 'ND';
}

export interface RateRequestPayload {
  productId: string;
  productName: string;
  productType: string;
  productTime: number;
  clientId: string;
  phone: string;
  currencyPair: string;
  initialAmount: number;
  finalRate: number;
  totalFiat: number;
  walletAddress?: string;
  fromAccountId?: string;
  toAccountId?: string;
}

export interface RateRequestHistory {
  requests: RateRequest[];
  hasMore: boolean;
  total: number;
  currentPage: number;
}

// Helper type for product selection
export type ProductType = BridgeProduct['type'];

// Helper type for request states
export type RequestState = RateRequest['requestState'];

