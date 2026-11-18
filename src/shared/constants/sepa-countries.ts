/**
 * SEPA zone country codes and display labels.
 *
 * Single source of truth for all countries that can be routed through the
 * SEPA rail. The list follows the standard SEPA zone membership used by the
 * backend rail metadata.
 */

import { msg } from '@lingui/macro';

export const SEPA_COUNTRY_CODES = [
  'AND',
  'AUT',
  'BEL',
  'BGR',
  'HRV',
  'CYP',
  'CZE',
  'DNK',
  'EST',
  'FIN',
  'FRA',
  'DEU',
  'GRC',
  'HUN',
  'ISL',
  'IRL',
  'ITA',
  'LVA',
  'LIE',
  'LTU',
  'LUX',
  'MLT',
  'MCO',
  'NLD',
  'NOR',
  'POL',
  'PRT',
  'ROU',
  'SMR',
  'SVK',
  'SVN',
  'ESP',
  'SWE',
  'CHE',
  'GBR',
  'VAT',
  'ALB',
  'MDA',
  'MNE',
  'MKD',
  'SRB',
] as const;

export type SepaCountryCode = (typeof SEPA_COUNTRY_CODES)[number];

export function isSepaCountry(code: string): code is SepaCountryCode {
  return SEPA_COUNTRY_CODES.includes(code as SepaCountryCode);
}

export const SEPA_COUNTRY_LABELS: Record<SepaCountryCode, ReturnType<typeof msg>> = {
  AND: msg`Andorra`,
  AUT: msg`Austria`,
  BEL: msg`Belgium`,
  BGR: msg`Bulgaria`,
  HRV: msg`Croatia`,
  CYP: msg`Cyprus`,
  CZE: msg`Czechia`,
  DNK: msg`Denmark`,
  EST: msg`Estonia`,
  FIN: msg`Finland`,
  FRA: msg`France`,
  DEU: msg`Germany`,
  GRC: msg`Greece`,
  HUN: msg`Hungary`,
  ISL: msg`Iceland`,
  IRL: msg`Ireland`,
  ITA: msg`Italy`,
  LVA: msg`Latvia`,
  LIE: msg`Liechtenstein`,
  LTU: msg`Lithuania`,
  LUX: msg`Luxembourg`,
  MLT: msg`Malta`,
  MCO: msg`Monaco`,
  NLD: msg`Netherlands`,
  NOR: msg`Norway`,
  POL: msg`Poland`,
  PRT: msg`Portugal`,
  ROU: msg`Romania`,
  SMR: msg`San Marino`,
  SVK: msg`Slovakia`,
  SVN: msg`Slovenia`,
  ESP: msg`Spain`,
  SWE: msg`Sweden`,
  CHE: msg`Switzerland`,
  GBR: msg`United Kingdom`,
  VAT: msg`Vatican City`,
  ALB: msg`Albania`,
  MDA: msg`Moldova`,
  MNE: msg`Montenegro`,
  MKD: msg`North Macedonia`,
  SRB: msg`Serbia`,
};
