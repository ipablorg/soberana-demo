/**
 * Currency rules for the "Registrar recaudo manual" form.
 *
 * The backend rejects a deposit whose currency differs from the wallet's
 * (`Currency X does not match the wallet currency Y`, 400), so the form seeds
 * the currency from the chosen wallet and blocks a mismatch before submit.
 *
 * Kept free of React and of Lingui so the rules stay unit testable.
 */

import { QUICK_PICK_COINS } from '@/shared/lib/coin-code';

function normalizeCurrency(raw: string | null | undefined): string {
  return raw?.trim().toUpperCase() ?? '';
}

/**
 * Options for the currency select: the customer's wallet currencies first (in
 * wallet order), then the common coins, deduped. The current form value is
 * always kept so a selected value is never missing from the list.
 */
export function buildRecaudoCurrencyOptions(
  walletCurrencies: readonly string[],
  current: string,
): string[] {
  const options = new Set<string>();

  for (const raw of [...walletCurrencies, ...QUICK_PICK_COINS, current]) {
    const code = normalizeCurrency(raw);
    if (code.length > 0) options.add(code);
  }

  return Array.from(options);
}

/** Currency the form pre-selects for a wallet (empty when there is none). */
export function resolveDefaultCurrency(
  wallet: { currency: string } | null | undefined,
): string {
  return normalizeCurrency(wallet?.currency);
}

/**
 * True when both sides are filled and differ (case-insensitive). An empty side
 * is not a mismatch: it is a missing value, handled by the required-field checks.
 */
export function hasCurrencyMismatch(
  walletCurrency: string | null | undefined,
  currency: string | null | undefined,
): boolean {
  const wallet = normalizeCurrency(walletCurrency);
  const chosen = normalizeCurrency(currency);

  return wallet.length > 0 && chosen.length > 0 && wallet !== chosen;
}
