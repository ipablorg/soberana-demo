import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ElementsIntegrationState {
  enabled: boolean;
  splashShown: boolean;
  enable: () => void;
  disable: () => void;
  markSplashShown: () => void;
}

export const useElementsIntegrationStore = create<ElementsIntegrationState>()(
  persist(
    (set) => ({
      enabled: false,
      splashShown: false,
      enable: () => set({ enabled: true, splashShown: false }),
      disable: () => set({ enabled: false, splashShown: false }),
      markSplashShown: () => set({ splashShown: true }),
    }),
    { name: 'elements-integration' },
  ),
);
