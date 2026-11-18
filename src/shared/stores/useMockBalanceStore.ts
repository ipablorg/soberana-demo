import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MockBalanceState {
  balanceUsdc: number;
  addPayment: (amountUsdc: number) => void;
  reset: () => void;
}

export const useMockBalanceStore = create<MockBalanceState>()(
  persist(
    (set) => ({
      balanceUsdc: 0,

      addPayment: (amountUsdc) =>
        set((state) => ({
          balanceUsdc: Math.round((state.balanceUsdc + amountUsdc) * 10000) / 10000,
        })),

      reset: () => set({ balanceUsdc: 0 }),
    }),
    { name: 'loopay-mock-balance' }
  )
);
