/**
 * Liquidation Routes Types
 * 
 * Types for Bridge API liquidation addresses (payment routes)
 */

export interface LiquidationSource {
  payment_rail: string; // e.g. "base", "ethereum"
  currency: string; // e.g. "usdc"
}

export interface LiquidationDestination {
  payment_rail: string; // e.g. "ach", "wire"
  currency: string; // e.g. "usd"
  external_account_id?: string; // ID of the external account
  address: string; // Wallet address for crypto destination
}

export interface CreateLiquidationRouteRequest {
  source: LiquidationSource;
  destination: LiquidationDestination;
}

export interface LiquidationRoute {
  id: string;
  customerId: string;
  source: LiquidationSource;
  destination: LiquidationDestination;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt?: string;
}

export interface ExternalAccount {
  id: string;
  customerId: string;
  currency: string;
  country: string;
  account_type?: 'checking' | 'savings';
  // Bank account fields
  account_owner_name?: string;
  bank_name?: string;
  account_number?: string;
  routing_number?: string;
  // Metadata
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
}

export interface VaultWallet {
  address: string;
  id: string; // Currency ID (e.g. "USDC")
  qr: string;
  source_payment_rail: string; // e.g. "ethereum", "base"
}

