/**
 * Country names of the KYC catalog in the user's language. The catalog keeps
 * English names; `Intl.DisplayNames` (alpha-2 only) renders them localized,
 * with the catalog name as the fallback when the runtime cannot.
 */

import { i18n } from '@lingui/core';

import type { KycCountryCatalogEntry } from './static-catalog';

/** Alpha-2 of the catalog entries that only carry their alpha-3 code. */
const ISO3_TO_ISO2: Readonly<Record<string, string>> = {
  ARG: 'AR',
  BOL: 'BO',
  BRA: 'BR',
  CAN: 'CA',
  CHL: 'CL',
  COL: 'CO',
  CRI: 'CR',
  DOM: 'DO',
  ECU: 'EC',
  SLV: 'SV',
  FRA: 'FR',
  DEU: 'DE',
  GTM: 'GT',
  HND: 'HN',
  IND: 'IN',
  ITA: 'IT',
  JPN: 'JP',
  MEX: 'MX',
  NIC: 'NI',
  NGA: 'NG',
  PAN: 'PA',
  PRY: 'PY',
  PER: 'PE',
  PHL: 'PH',
  PRT: 'PT',
  ESP: 'ES',
  GBR: 'GB',
  USA: 'US',
  URY: 'UY',
  VEN: 'VE',
};

export function kycCountryDisplayName(
  country: Pick<KycCountryCatalogEntry, 'iso3' | 'name'> & { iso2?: string },
  locale: string = i18n.locale || 'es'
): string {
  const iso2 = country.iso2 ?? ISO3_TO_ISO2[country.iso3];
  if (!iso2) return country.name;
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(iso2) ?? country.name;
  } catch {
    return country.name;
  }
}
