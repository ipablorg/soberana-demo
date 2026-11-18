import { useAuthStore } from '@/shared/stores/auth-store';
import { useWallets } from '@/shared/hooks/use-wallets';

export interface ElementsWidgetContext {
  walletId: string | null;
  customerId: string | null;
  isAuthenticated: boolean;
  /** true when auth + wallet + customerId are all available */
  isReady: boolean;
  isLoading: boolean;
}

/**
 * Provides the platform auth + wallet context to Elements widgets rendered
 * inside the Studio (preview sandbox). In production embeds the context
 * would be injected by the partner's SDK initialization.
 */
export function useElementsWidgetContext(): ElementsWidgetContext {
  const user = useAuthStore(s => s.user);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const { wallets, isLoading } = useWallets();

  const primaryWallet = wallets[0] ?? null;
  const walletId = primaryWallet?.id ?? null;
  const customerId = user?.customer_profile_id ?? null;

  return {
    walletId,
    customerId,
    isAuthenticated,
    isReady: isAuthenticated && !!walletId && !!customerId,
    isLoading,
  };
}
