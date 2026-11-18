import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ActiveProduct = 'local-payments' | 'loopay-x' | 'wallet' | null;

interface ActiveProductStore {
  activeProduct: ActiveProduct;
  setActiveProduct: (product: ActiveProduct) => void;
}

export const useActiveProductStore = create<ActiveProductStore>()(
  persist(
    (set) => ({
      activeProduct: null,
      setActiveProduct: (product) => set({ activeProduct: product }),
    }),
    {
      name: 'loopay-active-product',
    }
  )
);
