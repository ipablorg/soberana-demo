/**
 * Country display for the review queues. Rows written before Phase 8 carry an
 * ISO alpha-3 code ("DEU"), newer rows an alpha-2 one ("MX").
 * `Intl.DisplayNames` only understands alpha-2 and throws on anything else, so
 * alpha-3 is converted first and the raw code is the fallback.
 */

const ISO3_TO_ISO2: Record<string, string> = {
  ARG: 'AR', BOL: 'BO', BRA: 'BR', CHL: 'CL', COL: 'CO', CRI: 'CR', CUB: 'CU', DOM: 'DO',
  ECU: 'EC', SLV: 'SV', GTM: 'GT', HND: 'HN', MEX: 'MX', NIC: 'NI', PAN: 'PA', PRY: 'PY',
  PER: 'PE', PRI: 'PR', URY: 'UY', VEN: 'VE', USA: 'US', CAN: 'CA', JAM: 'JM', HTI: 'HT',
  TTO: 'TT', BHS: 'BS', BRB: 'BB', BLZ: 'BZ', GUY: 'GY', SUR: 'SR',
  AND: 'AD', AUT: 'AT', BEL: 'BE', BGR: 'BG', HRV: 'HR', CYP: 'CY', CZE: 'CZ', DNK: 'DK',
  EST: 'EE', FIN: 'FI', FRA: 'FR', DEU: 'DE', GRC: 'GR', HUN: 'HU', ISL: 'IS', IRL: 'IE',
  ITA: 'IT', LVA: 'LV', LIE: 'LI', LTU: 'LT', LUX: 'LU', MLT: 'MT', MCO: 'MC', NLD: 'NL',
  NOR: 'NO', POL: 'PL', PRT: 'PT', ROU: 'RO', SMR: 'SM', SVK: 'SK', SVN: 'SI', ESP: 'ES',
  SWE: 'SE', CHE: 'CH', VAT: 'VA', ALB: 'AL', MDA: 'MD', MNE: 'ME', MKD: 'MK', SRB: 'RS',
  GBR: 'GB', UKR: 'UA', BLR: 'BY', RUS: 'RU', TUR: 'TR', BIH: 'BA',
  ARE: 'AE', SAU: 'SA', ISR: 'IL', QAT: 'QA', EGY: 'EG', MAR: 'MA', ZAF: 'ZA', NGA: 'NG',
  KEN: 'KE', GHA: 'GH', IND: 'IN', CHN: 'CN', JPN: 'JP', KOR: 'KR', SGP: 'SG', HKG: 'HK',
  THA: 'TH', VNM: 'VN', IDN: 'ID', MYS: 'MY', PHL: 'PH', PAK: 'PK', BGD: 'BD', AUS: 'AU',
  NZL: 'NZ',
};

/** ISO alpha-2 for an alpha-2 or alpha-3 code; undefined when it is neither. */
export function toIso2(code: string): string | undefined {
  const key = code.trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(key)) return key;
  return ISO3_TO_ISO2[key];
}

/** Spanish country name for an alpha-2 or alpha-3 code; the raw code when unknown. */
export function countryName(code: string | null | undefined, locale = 'es'): string {
  if (!code) return '';
  const iso2 = toIso2(code);
  if (!iso2) return code;
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(iso2) ?? code;
  } catch {
    return code;
  }
}
