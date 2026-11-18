import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { VolumeRange } from '../types';
import { COUNTRY_CAPABILITIES } from '../data/country-capabilities.data';
import { VOLUME_PRICING_TABLES } from '../data/volume-pricing.data';

export type LocalService = 'collection' | 'disbursement';

interface ClientIntakeState {
  contactName: string;
  companyName: string;
  clientCountry: string | null;
  localServices: LocalService[];
  needsInternational: boolean;
  originCountry: string | null;
  destinationCountry: string | null;
  productType: string | null;
  corridor: string | null;
  volumeRange: VolumeRange | null;
  applicableRate: string | null;
  completed: boolean;
}

interface ClientIntakeActions {
  setContact: (name: string, company: string) => void;
  setClientCountry: (country: string) => void;
  setNeeds: (local: LocalService[], international: boolean) => void;
  setDestination: (country: string) => void;
  setProductType: (type: string) => void;
  setVolumeRange: (range: VolumeRange) => void;
  complete: () => void;
  reset: () => void;
}

export type ClientIntakeStore = ClientIntakeState & ClientIntakeActions;

function deriveCorridor(origin: string | null, destination: string | null): string | null {
  if (!origin || !destination) return null;
  const country = COUNTRY_CAPABILITIES.find((c) => c.country === origin);
  if (!country) return null;
  const match = country.corridors.find(
    (c) => c.destination === destination && c.operationProcess !== 'SIN CANAL',
  );
  return match?.corridor ?? null;
}

function deriveRate(
  origin: string | null,
  destination: string | null,
  range: VolumeRange | null,
): string | null {
  if (!origin || !destination || !range) return null;
  const table = VOLUME_PRICING_TABLES.find((t) => t.origin === origin);
  if (!table) return null;
  const corridor = table.corridors.find((c) => c.destination === destination);
  return corridor?.rates[range] ?? null;
}

const initialState: ClientIntakeState = {
  contactName: '',
  companyName: '',
  clientCountry: null,
  localServices: [],
  needsInternational: false,
  originCountry: null,
  destinationCountry: null,
  productType: null,
  corridor: null,
  volumeRange: null,
  applicableRate: null,
  completed: false,
};

export const useClientIntakeStore = create<ClientIntakeStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setContact: (name, company) => set({ contactName: name, companyName: company }),

      setClientCountry: (country) =>
        set({
          clientCountry: country,
          originCountry: country,
          localServices: [],
          needsInternational: false,
          destinationCountry: null,
          productType: null,
          corridor: null,
          volumeRange: null,
          applicableRate: null,
        }),

      setNeeds: (local, international) =>
        set({
          localServices: local,
          needsInternational: international,
          destinationCountry: null,
          productType: null,
          corridor: null,
          volumeRange: null,
          applicableRate: null,
        }),

      setDestination: (country) => {
        const { originCountry } = get();
        const corridor = deriveCorridor(originCountry, country);
        set({
          destinationCountry: country,
          productType: null,
          corridor,
          volumeRange: null,
          applicableRate: null,
        });
      },

      setProductType: (type) => set({ productType: type }),

      setVolumeRange: (range) => {
        const { originCountry, destinationCountry } = get();
        const rate = deriveRate(originCountry, destinationCountry, range);
        set({ volumeRange: range, applicableRate: rate });
      },

      complete: () => set({ completed: true }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'loopay-client-intake',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
