export type VaultStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED';

export type VaultStrategyType =
  | 'CASH_AND_CARRY'
  | 'LIQUIDITY_PROVISION'
  | 'FUNDING_ARBITRAGE'
  | 'HYBRID';

export interface VaultStrategy {
  type: VaultStrategyType;
  label: string;
  components: string[];
}

export interface Vault {
  slug: string;
  name: string;
  pair: string;
  protocol: string;
  network: string;
  status: VaultStatus;
  strategy: VaultStrategy;
  sharePrice: number;
  totalValueLockedUsd: number;
  totalSharesOutstanding: number;
  depositAsset: string;
  minInvestmentUsd: number;
  managementFeePct: number;
  performanceFeePct: number;
  navUpdatedAt: number;
  estimatedApy: number;
}

export interface VaultPosition {
  vaultSlug: string;
  vaultName: string;
  pair: string;
  sharesBalance: number;
  currentValueUsd: number;
  costBasisUsd: number;
  unrealizedPnlUsd: number;
  unrealizedPnlPct: number;
  sharePrice: number;
  avgEntrySharePrice: number;
}

export interface InvestorPortfolio {
  positions: VaultPosition[];
  totalValueUsd: number;
  totalCostBasisUsd: number;
  totalUnrealizedPnlUsd: number;
  totalUnrealizedPnlPct: number;
}

export type VaultTransactionType = 'INVEST' | 'REDEEM';

export type VaultTransactionStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'CONFIRMED'
  | 'FAILED';

export interface VaultTransaction {
  id: string;
  vaultSlug: string;
  vaultName: string;
  pair: string;
  type: VaultTransactionType;
  amountUsd: number;
  sharesAmount: number;
  sharePriceAtExecution: number;
  status: VaultTransactionStatus;
  createdAt: string;
  confirmedAt?: string;
}

export type RedeemMode = 'shares' | 'amount';
