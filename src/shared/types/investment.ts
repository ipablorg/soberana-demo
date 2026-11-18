export interface InvestmentProduct {
  id: string;
  name: string;
  kind: 'stable_yield' | 'money_market' | 'treasury_token' | 'term_deposit';
  risk: 'low' | 'medium' | 'high';
  apr: number;
  lockDays?: number;
  currency: string;
  provider: 'loopay_core' | 'partner';
  description?: string;
  minInvestment?: number;
}

export interface InvestmentPosition {
  id: string;
  productId: string;
  accountId: string;
  principal: number;
  accrued: number;
  openedAt: string;
  maturesAt?: string;
  status: 'active' | 'maturing' | 'closed';
}
