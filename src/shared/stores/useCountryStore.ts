/**
 * Country Store
 * Manages the selected country context for the backoffice
 *
 * Note: This store does NOT persist between sessions (temporary state)
 * Resets to default 'co' on each session start
 */

import { create } from 'zustand';
import { Country, getCountryId, type CountryCode } from '@/shared/config/countries.config';

interface CountryStore {
  countries: Country[];
  setCountries: (countries: Country[]) => void;
  selectedCountry: CountryCode;
  setCountry: (code: CountryCode) => void;
  getSelectedCountryId: () => number;
}

export const useCountryStore = create<CountryStore>((set, get) => ({
  countries: [],
  setCountries: (countries) => set({ countries }),
  selectedCountry: 'co', // Default: Colombia
  setCountry: (code) => set({ selectedCountry: code }),
  getSelectedCountryId: () => getCountryId(get().selectedCountry),
}));

export type { CountryCode };
