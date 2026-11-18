import type { ChileCostItem } from '../types';

export const CHILE_MIN_OPERATION = 50_000;
export const CHILE_MIN_RATE = '0.80%';

export const CHILE_COST_ITEMS: ChileCostItem[] = [
  { concept: 'Fireblocks', percentage: '0.10%', amountUsd: 50 },
  { concept: 'Fireblocks Fijo', percentage: null, amountUsd: 49.18 },
  { concept: 'Vita USDT/CHL', percentage: '0.10%', amountUsd: 50 },
  { concept: 'Vita Chile', percentage: '0.50%', amountUsd: 250 },
];

export const CHILE_TOTAL_COST = 399.18;
