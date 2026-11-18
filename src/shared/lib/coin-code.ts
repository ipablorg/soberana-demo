/**
 * Coins that have a dedicated logo. Anything else (fiat, other assets) renders
 * a neutral icon, so callers must treat `null` as "no logo", not as an error.
 */

export const QUICK_PICK_COINS = ['USDC', 'USDT', 'BTC'] as const;

export type CoinCode = (typeof QUICK_PICK_COINS)[number];

export function resolveCoinCode(
  input: string | null | undefined,
): CoinCode | null {
  const normalized = input?.trim().toUpperCase() ?? '';

  return QUICK_PICK_COINS.find((coin) => coin === normalized) ?? null;
}
