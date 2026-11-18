/**
 * Single source of truth for which fiat currencies have a bank
 * transfer guide and which rail badge accompanies the "Cómo
 * transferir desde tu banco" CTA.
 *
 * Adding a currency here MUST be paired with a matching entry in
 * `src/data/bank-instructions.ts` (`useTransferGuides`). Callers
 * should never inline a currency list — go through
 * `hasBankTransferGuide` / `getRailLabel` instead.
 *
 * Rail names (SPEI, PIX, SEPA, ACH, Wire) are proper-noun protocol
 * brands, not translatable copy. Keep them as plain strings.
 */

export const BANK_TRANSFER_RAIL_LABELS = {
  USD: 'ACH · Wire',
  MXN: 'SPEI',
  COP: 'ACH Colombia',
  EUR: 'SEPA',
  BRL: 'PIX',
} as const;

export type BankTransferCurrency = keyof typeof BANK_TRANSFER_RAIL_LABELS;

export function hasBankTransferGuide(currency: string): boolean {
  return currency.toUpperCase() in BANK_TRANSFER_RAIL_LABELS;
}

export function getRailLabel(currency: string): string | null {
  const upper = currency.toUpperCase() as BankTransferCurrency;
  return BANK_TRANSFER_RAIL_LABELS[upper] ?? null;
}
