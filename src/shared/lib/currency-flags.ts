/**
 * Currency Flags Utility
 *
 * Mapping of currency codes to flag emojis, human-readable names,
 * and payment rail → country flag resolution.
 */

export const currencyFlags: Record<string, string> = {
  COP: '🇨🇴',
  USD: '🇺🇸',
  MXN: '🇲🇽',
  BRL: '🇧🇷',
  GBP: '🇬🇧',
  GBR: '🇬🇧',
  EUR: '🇪🇺',
  ECU: '🇪🇨',
  ARS: '🇦🇷',
  PEN: '🇵🇪',
  PER: '🇵🇪',
  CLP: '🇨🇱',
  USDC: '🇺🇸',
  USDT: '🇺🇸',
};

export function getCurrencyFlag(currency: string): string {
  return currencyFlags[currency] || '🌐';
}

export const currencyNames: Record<string, string> = {
  COP: 'Peso Colombiano',
  USD: 'Dólar Estadounidense',
  MXN: 'Peso Mexicano',
  BRL: 'Real Brasileño',
  GBP: 'Libra Esterlina',
  GBR: 'Libra Esterlina',
  EUR: 'Euro',
  ECU: 'Dólar Estadounidense',
  ARS: 'Peso Argentino',
  PEN: 'Sol Peruano',
  PER: 'Sol Peruano',
  CLP: 'Peso Chileno',
  USDC: 'Dólar Digital',
  USDT: 'Dólar Digital',
};

export const railToCountryFlag: Record<string, string> = {
  ach: '🇺🇸',
  wire: '🇺🇸',
  ach_wire: '🇺🇸',
  us_ach: '🇺🇸',
  us_wire: '🇺🇸',
  spei: '🇲🇽',
  pix: '🇧🇷',
  co_ach: '🇨🇴',
  co_breb: '🇨🇴',
  ec_bank_transfer: '🇪🇨',
  ec_point_of_sale: '🇪🇨',
  pe_bank_transfer: '🇵🇪',
  faster_payments: '🇬🇧',
  iban: '🇪🇺',
  sepa: '🇪🇺',
};

export function getCurrencyName(currency: string): string {
  return currencyNames[currency] || currency;
}

export function getRailFlag(rail: string): string {
  return railToCountryFlag[rail.toLowerCase()] || '🌐';
}
