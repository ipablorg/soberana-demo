/**
 * Liquidation Routes API Service
 * 
 * Service to interact with Bridge API liquidation addresses through Loopay backend
 */

import type {
  CreateLiquidationRouteRequest,
  LiquidationRoute,
  ExternalAccount,
} from '../types/liquidation-routes.types';
import { useAuthStore } from '@/shared/stores/auth-store';

const BRIDGE_API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

function getAuthHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  const companyId = (useAuthStore.getState().user as any)?.companyId;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (companyId) headers['x-company-id'] = companyId;
  return headers;
}

/**
 * Get external accounts for a customer
 * 
 * @param customerId - Bridge customer ID
 * @returns List of external accounts
 */
export async function getExternalAccounts(customerId: string): Promise<ExternalAccount[]> {
  try {
    const response = await fetch(`${BRIDGE_API_BASE}/api/bridge/customers/${customerId}/external-accounts`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch external accounts: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('[Liquidation API] Error fetching external accounts:', error);
    throw error;
  }
}

/**
 * Get liquidation routes for a customer
 * 
 * @param customerId - Bridge customer ID
 * @returns List of liquidation routes
 */
export async function getLiquidationRoutes(customerId: string): Promise<LiquidationRoute[]> {
  try {
    const response = await fetch(`${BRIDGE_API_BASE}/api/bridge/customers/${customerId}/liquidation-addresses`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch liquidation routes: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('[Liquidation API] Error fetching liquidation routes:', error);
    throw error;
  }
}

/**
 * Create a new liquidation route
 * 
 * @param customerId - Bridge customer ID
 * @param request - Liquidation route creation request
 * @returns Created liquidation route
 */
export async function createLiquidationRoute(
  customerId: string,
  request: CreateLiquidationRouteRequest
): Promise<LiquidationRoute> {
  try {
    const response = await fetch(`${BRIDGE_API_BASE}/api/bridge/customers/${customerId}/liquidation-addresses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'Failed to create liquidation route');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Liquidation API] Error creating liquidation route:', error);
    throw error;
  }
}

/**
 * Delete a liquidation route
 * 
 * @param customerId - Bridge customer ID
 * @param routeId - Liquidation route ID
 */
export async function deleteLiquidationRoute(
  customerId: string,
  routeId: string
): Promise<void> {
  try {
    const response = await fetch(`${BRIDGE_API_BASE}/api/bridge/customers/${customerId}/liquidation-addresses/${routeId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete liquidation route: ${response.statusText}`);
    }
  } catch (error) {
    console.error('[Liquidation API] Error deleting liquidation route:', error);
    throw error;
  }
}

