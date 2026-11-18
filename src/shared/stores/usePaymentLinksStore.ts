import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PaymentLinkData {
  id: string;
  amount?: string;
  currency: string;
  description?: string;
  logo?: string | null;
  color: string;
  createdAt: string;
  status: 'active' | 'paid' | 'expired';
  destination?: {
    type: 'fiat-box' | 'stablecoin' | 'ucoin';
    currency: string;
  };
}

interface PaymentLinksState {
  links: Record<string, PaymentLinkData>;
  addLink: (link: PaymentLinkData) => void;
  getLink: (id: string) => PaymentLinkData | undefined;
  markAsPaid: (id: string) => void;
}

export const usePaymentLinksStore = create<PaymentLinksState>()(
  persist(
    (set, get) => ({
      links: {},

      addLink: (link) =>
        set((state) => ({
          links: { ...state.links, [link.id]: link },
        })),

      getLink: (id) => get().links[id],

      markAsPaid: (id) =>
        set((state) => {
          const link = state.links[id];
          if (!link) return state;
          return {
            links: {
              ...state.links,
              [id]: { ...link, status: 'paid' },
            },
          };
        }),
    }),
    { name: 'loopay-payment-links' }
  )
);
