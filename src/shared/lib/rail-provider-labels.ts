/**
 * Display names for the raw rail and provider codes the backend returns
 * (`us_ach`, `ach_wire`, `kirafin`, ...). Proper nouns, so not translated.
 * Unknown codes are shown as they come so no information is lost.
 */

const RAIL_NAMES: Readonly<Record<string, string>> = {
  ach: 'ACH',
  us_ach: 'ACH',
  wire: 'Wire',
  us_wire: 'Wire',
  ach_wire: 'ACH / Wire',
  sepa: 'SEPA',
  iban: 'SEPA (IBAN)',
  spei: 'SPEI',
  pix: 'PIX',
  br_ted: 'TED',
  faster_payments: 'Faster Payments',
  co_ach: 'ACH Colombia',
  co_breb: 'Bre-B',
  swift: 'SWIFT',
};

const PROVIDER_NAMES: Readonly<Record<string, string>> = {
  mesta: 'Mesta',
  kirafin: 'KiraFin',
  bridge: 'Bridge',
  loopayx: 'LoopayX',
  aiprise: 'AiPrise',
  jube: 'Jube',
  lumx: 'Lumx',
  fireblocks: 'Fireblocks',
  openfort: 'Openfort',
  spherepay: 'SpherePay',
};

function lookup(map: Readonly<Record<string, string>>, code: string | null | undefined): string {
  const raw = (code ?? '').trim();
  return map[raw.toLowerCase()] ?? raw;
}

/** `us_ach` → "ACH", `ach_wire` → "ACH / Wire"; unknown codes stay raw. */
export function railCodeLabel(code: string | null | undefined): string {
  return lookup(RAIL_NAMES, code);
}

/** `kirafin` → "KiraFin", `mesta` → "Mesta"; unknown codes stay raw. */
export function providerDisplayName(code: string | null | undefined): string {
  return lookup(PROVIDER_NAMES, code);
}
