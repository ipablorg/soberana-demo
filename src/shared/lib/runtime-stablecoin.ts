const RUNTIME_STABLECOINS = new Set(['USDC', 'USDT', 'EURC']);

function normalizeCurrency(currency: string | null | undefined): string | null {
  const normalized = currency?.trim().toUpperCase();
  return normalized && normalized.length > 0 ? normalized : null;
}

export function getRuntimeStablecoinLabel(currency: string | null | undefined): string | null {
  const normalized = normalizeCurrency(currency);

  if (!normalized) {
    return null;
  }

  return RUNTIME_STABLECOINS.has(normalized) ? normalized : null;
}
