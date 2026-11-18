import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';

export const brandingConfigSchema = z.object({
  logo: z.string().optional(),
  appName: z.string().min(2).max(50),
  colors: z.object({
    primary: z.string(),
    accent: z.string(),
    surface: z.string(),
  }),
});

export type BrandingConfig = z.infer<typeof brandingConfigSchema>;

const DEFAULT_CONFIG: BrandingConfig = {
  logo: undefined,
  appName: 'Loopay',
  colors: {
    primary: '210 80% 50%',
    accent: '190 70% 45%',
    surface: '220 28% 10%',
  },
};

interface BrandingState {
  config: BrandingConfig;
  updateBranding: (updates: Partial<BrandingConfig>) => void;
  resetBranding: () => void;
}

export const useBrandingStore = create<BrandingState>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,

      updateBranding: (updates) =>
        set((state) => ({
          config: {
            ...state.config,
            ...updates,
            colors: {
              ...state.config.colors,
              ...(updates.colors || {}),
            },
          },
        })),

      resetBranding: () => set({ config: DEFAULT_CONFIG }),
    }),
    { name: 'loopay_branding_config' }
  )
);
