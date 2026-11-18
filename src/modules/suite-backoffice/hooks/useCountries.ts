/**
 * Country catalog for the backoffice country selector.
 *
 * The legacy `countries` GraphQL query never existed in the backend (the
 * management module resolvers are not implemented), so fetching it produced a
 * codegen registry miss and the "no pudimos cargar los países" banner on every
 * backoffice page. The selector is served from the operational catalog — the
 * countries the payment rails actually cover — with no backend dependency.
 */

import { useMemo } from 'react';

import type { Country } from '@/shared/config/countries.config';

export { type Country } from '@/shared/config/countries.config';

/** Countries covered by the platform's payment rails (rails catalog). */
const OPERATIONAL_COUNTRIES: readonly Country[] = [
  { id: 1, name: 'Colombia', isoCode: 'co', currency: { cc: 'COP' } },
  { id: 2, name: 'México', isoCode: 'mx', currency: { cc: 'MXN' } },
  { id: 3, name: 'Brasil', isoCode: 'br', currency: { cc: 'BRL' } },
  { id: 4, name: 'Perú', isoCode: 'pe', currency: { cc: 'PEN' } },
  { id: 5, name: 'Ecuador', isoCode: 'ec', currency: { cc: 'USD' } },
  { id: 6, name: 'Estados Unidos', isoCode: 'us', currency: { cc: 'USD' } },
  { id: 7, name: 'Eurozona (SEPA)', isoCode: 'eu', currency: { cc: 'EUR' } },
  { id: 8, name: 'Reino Unido', isoCode: 'gb', currency: { cc: 'GBP' } },
];

export function useCountries() {
  const countries = useMemo(() => [...OPERATIONAL_COUNTRIES], []);

  return {
    countries,
    isLoading: false,
    error: null as unknown as null,
    refetch: () => Promise.resolve(),
    isFetching: false,
  };
}
