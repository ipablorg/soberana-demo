const STORAGE_KEY = 'loopay-active-fiat-currencies';

const DEFAULTS = ['cop', 'usd'];

export function getActiveFiatCurrencies(): string[] {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function activateFiatCurrency(currency: string): string[] {
  const current = getActiveFiatCurrencies();
  const lower = currency.toLowerCase();
  if (!current.includes(lower)) {
    const updated = [...current, lower];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }
  return current;
}

export function isFiatActive(currency: string): boolean {
  return getActiveFiatCurrencies().includes(currency.toLowerCase());
}
