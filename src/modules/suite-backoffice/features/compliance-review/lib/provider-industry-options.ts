/**
 * Business industry options of the "Completar datos" dialog. The backend takes
 * a KiraFin industry slug or a NAICS code; the select offers the common sectors
 * as NAICS subsector codes (3 digits) with Spanish labels.
 */

import { msg } from '@lingui/core/macro';
import type { MessageDescriptor } from '@lingui/core';

import type { SelectOption } from '../../platform-config/lib/catalog-options';

type Translate = (descriptor: MessageDescriptor) => string;

const INDUSTRIES: readonly { naics: string; label: MessageDescriptor }[] = [
  { naics: '541', label: msg`Servicios profesionales, científicos y técnicos` },
  { naics: '518', label: msg`Tecnología: procesamiento de datos y hosting` },
  { naics: '511', label: msg`Software y publicaciones` },
  { naics: '522', label: msg`Servicios financieros y crédito` },
  { naics: '523', label: msg`Inversiones y valores` },
  { naics: '524', label: msg`Seguros` },
  { naics: '454', label: msg`Comercio electrónico y ventas a distancia` },
  { naics: '452', label: msg`Comercio minorista` },
  { naics: '423', label: msg`Comercio mayorista` },
  { naics: '339', label: msg`Manufactura` },
  { naics: '236', label: msg`Construcción` },
  { naics: '531', label: msg`Inmobiliario` },
  { naics: '484', label: msg`Transporte de carga` },
  { naics: '488', label: msg`Logística y apoyo al transporte` },
  { naics: '611', label: msg`Educación` },
  { naics: '621', label: msg`Salud` },
  { naics: '711', label: msg`Entretenimiento y espectáculos` },
  { naics: '721', label: msg`Alojamiento` },
  { naics: '722', label: msg`Restaurantes y bares` },
  { naics: '561', label: msg`Servicios administrativos y de apoyo` },
  { naics: '111', label: msg`Agricultura` },
];

/** KYB industry values (client wizard) as the NAICS subsector the select offers. */
const KYB_INDUSTRY_TO_NAICS: Readonly<Record<string, string>> = {
  technology: '518',
  finance: '522',
  healthcare: '621',
  retail: '452',
  manufacturing: '339',
  consulting: '541',
  real_estate: '531',
  education: '611',
  entertainment: '711',
  transportation: '484',
};

export function businessIndustryOptions(t: Translate): SelectOption[] {
  return INDUSTRIES.map((industry) => ({
    value: industry.naics,
    label: `${t(industry.label)} (NAICS ${industry.naics})`,
  }));
}

/** Prefill from a KYB industry value; a NAICS code or KiraFin slug is kept as is. */
export function businessIndustryFromKyb(raw: string): string {
  const value = raw.trim();
  if (!value || value === 'other') return '';
  return KYB_INDUSTRY_TO_NAICS[value] ?? value;
}
