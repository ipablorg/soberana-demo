// Navigation types
export * from './navigation';

export type Currency = 'USD' | 'EUR' | 'MXN' | 'BRL' | 'ARS' | 'COP' | 'CNY' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF';
export type Network = 'ETH' | 'BASE' | 'SOL';
export type Stable = 'USDC' | 'USDT';
export type Asset = Currency | Stable;

export interface Organization {
  id: string;
  name: string;
}

export interface LegalEntity {
  id: string;
  orgId: string;
  name: string;
  country: string;
}

export interface Account {
  id: string;
  entityId: string;
  name: string;
  type: 'bank' | 'wallet';
  currency?: Currency;
  network?: Network;
  asset?: Asset;
  balance: number;
  ibanVirtual?: string;
}

export interface Subaccount extends Account {
  parentId: string;
}

export interface Counterparty {
  id: string;
  type: 'client' | 'merchant' | 'beneficiary' | 'wallet';
  name: string;
  accountRef?: string;
  network?: Network;
  address?: string;
  email?: string;
  country?: string;
}

export interface Quote {
  id: string;
  kind: 'fx' | 'onoff';
  fromAsset: string;
  toAsset: string;
  amount: number;
  rate: number;
  fee: number;
  etaMins: number;
  expiresAt: string;
  createdAt: string;
  source?: 'wholesale_mock' | 'bank_mock';
}

export type OrderStatus = 'pending' | 'requires_approval' | 'processing' | 'settled' | 'failed' | 'refunded';
export type OrderKind = 'payin' | 'payout' | 'conversion' | 'transfer' | 'investment' | 'pos_sale';

export interface Order {
  id: string;
  kind: OrderKind;
  status: OrderStatus;
  amount: number;
  currency?: Currency | Stable;
  fromAccount?: string;
  toAccount?: string;
  quoteId?: string;
  counterpartyId?: string;
  requiresApproval?: boolean;
  approvedBy?: string[];
  requiredApprovals?: number;
  createdAt: string;
  settledAt?: string;
  metadata?: Record<string, unknown>;
}

export type TransactionStatus = 'initiated' | 'authorized' | 'settled' | 'reconciled' | 'failed';

export interface Transaction {
  id: string;
  orderId: string;
  asset: string;
  amount: number;
  status: TransactionStatus;
  ts: string;
}

export interface Case {
  id: string;
  reason: 'sanctions' | 'pep' | 'velocity' | 'onchain_flag';
  status: 'open' | 'review' | 'closed';
  relatedOrderId?: string;
  assignedTo?: string;
  createdAt: string;
}

export interface Card {
  id: string;
  accountId: string;
  last4: string;
  status: 'active' | 'blocked';
  limits: { daily: number };
  tokenized: boolean;
}

export interface ApiKey {
  id: string;
  name: string;
  lastUsed?: string;
  createdAt: string;
}

export interface Webhook {
  id: string;
  url: string;
  status: 'active' | 'disabled';
  secret: string;
}

export type UserRole = 'admin' | 'finance' | 'ops' | 'compliance' | 'developer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface PaymentLink {
  id: string;
  amount: number;
  currency: Currency;
  status: 'pending' | 'paid' | 'expired';
  method: 'link' | 'qr' | 'checkout';
  description?: string;
  expiresAt: string;
  createdAt: string;
  merchantRef?: string;
  url?: string;
}
