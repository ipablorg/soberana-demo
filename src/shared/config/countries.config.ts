export interface Country {
  id: number;
  name: string;
  isoCode: string;
  currency: {
    cc: string;
  };
}

export type CountryCode = string;

/**
 * Get country by code
 */
export function getCountryByCode(_code: string): Country | undefined {
  // return COUNTRIES.find((country) => country.code === code);
  return {
    id: 1,
    name: 'Colombia',
    isoCode: 'co',
    currency: {
      cc: 'COP',
    },
  };
}

/**
 * Get country ID by code
 * Returns the backend country ID for GraphQL queries
 */
export function getCountryId(code: string): number {
  const country = getCountryByCode(code);
  if (!country || country.id === 0) {
    throw new Error(`Country ID not found for code: ${code}. Please update countries.config.ts`);
  }
  return country.id;
}
