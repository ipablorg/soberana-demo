/**
 * Bridge API
 * 
 * API functions for bridge operations
 * Currently using mock data - will be replaced with real API calls
 */

import {
  BridgeProduct,
  CurrencyPair,
  RateRequest,
  RateRequestPayload,
  RateRequestHistory,
} from '../types/bridge';
import {
  mockBridgeProducts,
  mockCurrencyPairs,
  mockRateRequests,
} from './bridge-products-mock';

/**
 * Fetch available bridge products
 * 
 * TODO: Replace with API call to: GET /api/v1/bridge/products
 * 
 * Expected response:
 * {
 *   products: BridgeProduct[]
 * }
 */
export async function fetchBridgeProducts(): Promise<BridgeProduct[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/bridge/products`);
  // const data = await response.json();
  // return data.products;
  
  return mockBridgeProducts;
}

/**
 * Fetch available currency pairs
 * 
 * TODO: Replace with API call to: GET /api/v1/bridge/currency-pairs
 * 
 * Expected response:
 * {
 *   pairs: CurrencyPair[]
 * }
 */
export async function fetchCurrencyPairs(): Promise<CurrencyPair[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/bridge/currency-pairs`);
  // const data = await response.json();
  // return data.pairs;
  
  return mockCurrencyPairs;
}

/**
 * Submit a rate request (freeze/close rate)
 * 
 * TODO: Replace with API call to: POST /api/v1/bridge/rate-requests
 * 
 * Request body:
 * {
 *   productId: string;
 *   currencyPair: string;
 *   initialAmount: number;
 *   ... (see RateRequestPayload type)
 * }
 * 
 * Expected response:
 * {
 *   request: RateRequest
 * }
 */
export async function submitRateRequest(
  payload: RateRequestPayload
): Promise<RateRequest> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/bridge/rate-requests`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // });
  // const data = await response.json();
  // return data.request;
  
  // Mock response
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = payload.productTime > 0
    ? new Date(Date.now() + payload.productTime * 60 * 1000)
    : undefined;
  
  return {
    id: `req-${Date.now()}`,
    productId: payload.productId,
    productName: payload.productName,
    productType: payload.productType as 'instant' | 'freeze' | 'close' | 'prefund',
    productTime: payload.productTime,
    clientId: payload.clientId,
    phone: payload.phone,
    currencyPair: payload.currencyPair,
    initialAmount: payload.initialAmount,
    finalRate: payload.finalRate,
    totalFiat: payload.totalFiat,
    walletAddress: payload.walletAddress,
    fromAccountId: payload.fromAccountId,
    toAccountId: payload.toAccountId,
    requestState: 'initial',
    createdAt: {
      _seconds: now,
      _nanoseconds: 0,
    },
    expiresAt,
  };
}

/**
 * Fetch rate request history
 * 
 * TODO: Replace with API call to: GET /api/v1/bridge/rate-requests/history
 * 
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 10)
 * - productId?: string (optional filter)
 * - status?: string (optional filter: 'active', 'completed', 'cancelled', 'expired')
 * 
 * Expected response:
 * {
 *   requests: RateRequest[];
 *   pagination: {
 *     page: number;
 *     limit: number;
 *     total: number;
 *     hasMore: boolean;
 *   }
 * }
 */
export async function fetchRateRequestHistory(
  page: number = 1,
  limit: number = 10
): Promise<RateRequestHistory> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // TODO: Replace with actual API call
  // const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  // const response = await fetch(`${API_BASE_URL}/bridge/rate-requests/history?${params}`);
  // const data = await response.json();
  // return {
  //   requests: data.requests,
  //   hasMore: data.pagination.hasMore,
  //   total: data.pagination.total,
  //   currentPage: data.pagination.page,
  // };
  
  // Mock pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedRequests = mockRateRequests.slice(startIndex, endIndex);
  
  return {
    requests: paginatedRequests,
    hasMore: endIndex < mockRateRequests.length,
    total: mockRateRequests.length,
    currentPage: page,
  };
}

/**
 * Check for active rate request for a specific product
 * 
 * TODO: Replace with API call to: GET /api/v1/bridge/rate-requests/active
 * 
 * Query params:
 * - productId: string
 * 
 * Expected response:
 * {
 *   request: RateRequest | null
 * }
 */
export async function fetchActiveRequest(
  productId: string
): Promise<RateRequest | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with actual API call
  // const params = new URLSearchParams({ productId });
  // const response = await fetch(`${API_BASE_URL}/bridge/rate-requests/active?${params}`);
  // const data = await response.json();
  // return data.request;
  
  // Mock: Find active request for this product
  const activeRequest = mockRateRequests.find(
    req => req.productId === productId && req.requestState === 'initial'
  );
  
  return activeRequest || null;
}

/**
 * Cancel a rate request (unfreeze/cancel)
 * 
 * TODO: Replace with API call to: DELETE /api/v1/bridge/rate-requests/:requestId
 * 
 * Expected response:
 * {
 *   success: boolean;
 *   request: RateRequest (updated with state 'cancelled')
 * }
 */
export async function cancelRateRequest(requestId: string): Promise<void> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/bridge/rate-requests/${requestId}`, {
  //   method: 'DELETE',
  // });
  // const data = await response.json();
  // if (!data.success) {
  //   throw new Error('Failed to cancel rate request');
  // }
  
  // Mock: No action needed, handled by store
  return;
}

/**
 * Update rate for a currency pair (real-time updates)
 * 
 * TODO: Replace with WebSocket connection or polling to: GET /api/v1/bridge/rates
 * 
 * Query params:
 * - pairs: string (comma-separated, e.g., 'USDT-COP,USDT-USD')
 * 
 * Expected response:
 * {
 *   rates: {
 *     'USDT-COP': { rate: number, marketRate: number, lastUpdated: string },
 *     'USDT-USD': { rate: number, marketRate: number, lastUpdated: string },
 *   }
 * }
 * 
 * WebSocket alternative:
 * ws://api-url/bridge/rates (subscribe to real-time rate updates)
 */
export async function fetchCurrentRates(): Promise<Record<string, { rate: number; marketRate: number }>> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // TODO: Replace with actual API call or WebSocket subscription
  // For WebSocket:
  // const ws = new WebSocket(`${WS_BASE_URL}/bridge/rates`);
  // ws.onmessage = (event) => {
  //   const data = JSON.parse(event.data);
  //   // Update rates in store
  // };
  
  // Mock: Return current rates from mock data
  const rates: Record<string, { rate: number; marketRate: number }> = {};
  mockCurrencyPairs.forEach(pair => {
    const key = `${pair.from}-${pair.to}`;
    rates[key] = {
      rate: pair.rate,
      marketRate: pair.marketRate,
    };
  });
  
  return rates;
}

/**
 * Complete a rate request (mark as completed)
 * 
 * TODO: Replace with API call to: PATCH /api/v1/bridge/rate-requests/:requestId/complete
 * 
 * Request body:
 * {
 *   transactionHash?: string; // For on-chain transactions
 * }
 * 
 * Expected response:
 * {
 *   success: boolean;
 *   request: RateRequest (updated with state 'completed')
 * }
 */
export async function completeRateRequest(
  requestId: string,
  transactionHash?: string
): Promise<RateRequest> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/bridge/rate-requests/${requestId}/complete`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ transactionHash }),
  // });
  // const data = await response.json();
  // return data.request;
  
  // Mock: Find and update request
  const request = mockRateRequests.find(req => req.id === requestId);
  if (!request) {
    throw new Error('Request not found');
  }
  
  return {
    ...request,
    requestState: 'completed',
  };
}

