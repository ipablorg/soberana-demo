/**
 * Country options for backoffice forms. The backend takes ISO 3166-1 alpha-3
 * (`@Length(3, 3)`), so the select stores alpha-3 and shows the country name.
 * Built from the operational catalog (`useCountries`) plus a few extra markets.
 */

import { useMemo } from 'react';

import type { SelectOption } from '../features/platform-config/lib/catalog-options';
import { useCountries } from '../hooks/useCountries';

const ISO2_TO_ISO3: Readonly<Record<string, string>> = {
  co: 'COL',
  mx: 'MEX',
  br: 'BRA',
  pe: 'PER',
  ec: 'ECU',
  us: 'USA',
  gb: 'GBR',
  es: 'ESP',
  de: 'DEU',
  fr: 'FRA',
  it: 'ITA',
  pt: 'PRT',
  nl: 'NLD',
  pa: 'PAN',
  cl: 'CHL',
  ar: 'ARG',
};

const EXTRA_COUNTRIES: readonly SelectOption[] = [
  { value: 'ESP', label: 'España (ESP)' },
  { value: 'DEU', label: 'Alemania (DEU)' },
  { value: 'FRA', label: 'Francia (FRA)' },
  { value: 'ITA', label: 'Italia (ITA)' },
  { value: 'PRT', label: 'Portugal (PRT)' },
  { value: 'NLD', label: 'Países Bajos (NLD)' },
  { value: 'PAN', label: 'Panamá (PAN)' },
  { value: 'CHL', label: 'Chile (CHL)' },
  { value: 'ARG', label: 'Argentina (ARG)' },
];

export function iso3ForCountry(iso2: string): string | null {
  return ISO2_TO_ISO3[iso2.trim().toLowerCase()] ?? null;
}

function buildOptions(
  countries: readonly { name: string; isoCode: string }[]
): readonly SelectOption[] {
  const operational = countries.flatMap((country) => {
    const iso3 = iso3ForCountry(country.isoCode);

    return iso3 ? [{ value: iso3, label: `${country.name} (${iso3})` }] : [];
  });
  const taken = new Set(operational.map((o) => o.value));

  return [...operational, ...EXTRA_COUNTRIES.filter((o) => !taken.has(o.value))];
}

/** Static options for tests and non-hook callers. */
export const COUNTRY_ISO3_OPTIONS: readonly SelectOption[] = buildOptions([
  { name: 'Colombia', isoCode: 'co' },
  { name: 'México', isoCode: 'mx' },
  { name: 'Brasil', isoCode: 'br' },
  { name: 'Perú', isoCode: 'pe' },
  { name: 'Ecuador', isoCode: 'ec' },
  { name: 'Estados Unidos', isoCode: 'us' },
  { name: 'Reino Unido', isoCode: 'gb' },
]);

export function useCountryIso3Options(): readonly SelectOption[] {
  const { countries } = useCountries();

  return useMemo(() => buildOptions(countries), [countries]);
}
