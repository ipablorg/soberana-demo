import { create } from 'zustand';
import { SuiteConfig, ProductKey, ProductStatus } from '@/shared/types/suite';

interface FeatureFlags {
  agenticCheckout: boolean;
  policyCenter: boolean;
  treasury: boolean;
  connectors: boolean;
  analytics: boolean;
  runHistory: boolean;
  multiCurrencyAccounts: boolean;
  aiWorkflowBuilder: boolean;
  routeOptimizer: boolean;
  complianceScreening: boolean;
}

interface SuiteStore {
  config: SuiteConfig;
  featureFlags: FeatureFlags;
  toggleProduct: (product: ProductKey, status: ProductStatus) => void;
  toggleIntegration: (integrationId: string) => void;
  isProductEnabled: (product: ProductKey) => boolean;
  isIntegrationEnabled: (integrationId: string) => boolean;
  isFeatureEnabled: (feature: keyof FeatureFlags) => boolean;
  toggleFeature: (feature: keyof FeatureFlags) => void;
  getEnabledRoutesByCountry: (asset: string, country: string) => string[];
}

const defaultConfig: SuiteConfig = {
  products: {
    move: 'active',
    change: 'active',
    account: 'active',
    marketplace: 'active',
    pos: 'active',
  },
  enabledIntegrations: [
    'bre-b',
    'pix',
    'spei',
    'ach',
    'sepa',
    'openfort',
    'bridge-xyz',
    'tether-wdk',
    'brex-stablecoin',
  ],
};

// Load from localStorage if available
const loadConfig = (): SuiteConfig => {
  try {
    const stored = localStorage.getItem('loopay-suite-config');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.config || defaultConfig;
    }
  } catch (e) {
    console.warn('Failed to load suite config from localStorage', e);
  }
  return defaultConfig;
};

export const useSuiteStore = create<SuiteStore>((set, get) => {
  const initialConfig = loadConfig();

  const defaultFeatureFlags: FeatureFlags = {
    agenticCheckout: true,
    policyCenter: true,
    treasury: true,
    connectors: true,
    analytics: true,
    runHistory: true,
    multiCurrencyAccounts: true,
    aiWorkflowBuilder: true,
    routeOptimizer: true,
    complianceScreening: true,
  };

  // Save to localStorage whenever config changes
  const saveConfig = (config: SuiteConfig) => {
    try {
      localStorage.setItem('loopay-suite-config', JSON.stringify({ state: { config } }));
    } catch (e) {
      console.warn('Failed to save suite config to localStorage', e);
    }
  };

  const saveFeatureFlags = (flags: FeatureFlags) => {
    try {
      localStorage.setItem('loopay-feature-flags', JSON.stringify(flags));
    } catch (e) {
      console.warn('Failed to save feature flags to localStorage', e);
    }
  };

  const loadFeatureFlags = (): FeatureFlags => {
    try {
      const stored = localStorage.getItem('loopay-feature-flags');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load feature flags from localStorage', e);
    }
    return defaultFeatureFlags;
  };

  return {
    config: initialConfig,
    featureFlags: loadFeatureFlags(),

    toggleProduct: (product: ProductKey, status: ProductStatus) => {
      set((state) => {
        const newConfig = {
          ...state.config,
          products: {
            ...state.config.products,
            [product]: status,
          },
        };
        saveConfig(newConfig);
        return { config: newConfig };
      });
    },

    toggleIntegration: (integrationId: string) => {
      set((state) => {
        const enabled = state.config.enabledIntegrations.includes(integrationId);
        const newConfig = {
          ...state.config,
          enabledIntegrations: enabled
            ? state.config.enabledIntegrations.filter((id) => id !== integrationId)
            : [...state.config.enabledIntegrations, integrationId],
        };
        saveConfig(newConfig);
        return { config: newConfig };
      });
    },

    isProductEnabled: (product: ProductKey) => {
      return get().config.products[product] === 'active';
    },

    isIntegrationEnabled: (integrationId: string) => {
      return get().config.enabledIntegrations.includes(integrationId);
    },

    isFeatureEnabled: (feature: keyof FeatureFlags) => {
      return get().featureFlags[feature];
    },

    toggleFeature: (feature: keyof FeatureFlags) => {
      set((state) => {
        const newFlags = {
          ...state.featureFlags,
          [feature]: !state.featureFlags[feature],
        };
        saveFeatureFlags(newFlags);
        return { featureFlags: newFlags };
      });
    },

    getEnabledRoutesByCountry: (_asset: string, country: string) => {
      const enabled = get().config.enabledIntegrations;
      // Mock logic - return enabled connectors that support the country
      return enabled.filter((id) => {
        if (country === 'BR' && (id === 'pix' || id === 'bre-b')) return true;
        if (country === 'MX' && id === 'spei') return true;
        if (country === 'US' && id === 'ach') return true;
        if (['DE', 'FR', 'ES'].includes(country) && id === 'sepa') return true;
        return false;
      });
    },
  };
});
