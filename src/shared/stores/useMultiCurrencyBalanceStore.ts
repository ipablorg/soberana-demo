// DEPRECATED: This store uses mock balance data. Use useWalletBalance hook for real data.
// Kept for backward compatibility with loopay-links module.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MultiCurrencyBalanceState {
  balances: Record<string, number>;
  getBalance: (currency: string) => number;
  addBalance: (currency: string, amount: number) => void;
  setBalance: (currency: string, amount: number) => void;
  reset: () => void;
}

const DEFAULT_BALANCES: Record<string, number> = {
  usdt: 0,
  usdc: 0,
  ucoin: 0,
  cop: 0,
  brl: 0,
  mxn: 0,
  pen: 0,
  usd: 0,
};

export const useMultiCurrencyBalanceStore = create<MultiCurrencyBalanceState>()(
  persist(
    (set, get) => ({
      balances: { ...DEFAULT_BALANCES },

      getBalance: (currency: string) =>
        get().balances[currency.toLowerCase()] ?? 0,

      addBalance: (currency: string, amount: number) =>
        set((state) => ({
          balances: {
            ...state.balances,
            [currency.toLowerCase()]:
              Math.round(((state.balances[currency.toLowerCase()] ?? 0) + amount) * 10000) / 10000,
          },
        })),

      setBalance: (currency: string, amount: number) =>
        set((state) => ({
          balances: {
            ...state.balances,
            [currency.toLowerCase()]: Math.round(amount * 10000) / 10000,
          },
        })),

      reset: () => set({ balances: { ...DEFAULT_BALANCES } }),
    }),
    { name: 'loopay-multi-currency-balance' }
  )
);
