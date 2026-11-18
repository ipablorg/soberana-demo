import { useMemo } from 'react';
import { getRuntimeStablecoinLabel } from '@/shared/lib/runtime-stablecoin';
import {
  getWalletPairLabel,
  getWalletCurrencyLabel,
  resolveWalletSelection,
} from '@/shared/lib/receive-wallet';
import { useWallets } from '@/shared/hooks/use-wallets';
import { useActiveWallet } from '@/shared/hooks/use-active-wallet';

export function useReceiveWallet() {
  const walletsQuery = useWallets();
  const activeWalletQuery = useActiveWallet();

  const walletSelection = useMemo(
    () => resolveWalletSelection(walletsQuery.wallets, walletsQuery.defaultWallet),
    [walletsQuery.wallets, walletsQuery.defaultWallet],
  );
  const receiveWallet = activeWalletQuery.activeWallet ?? walletSelection.mainWallet;
  const mainWallet = walletSelection.mainWallet;
  const secondaryWallet = walletSelection.secondaryWallets[0];
  const secondaryWalletCount = walletSelection.secondaryWallets.length;
  const hasVisibleWallets = walletsQuery.wallets.length > 0;
  const hasResolvedMainWallet = !!receiveWallet;

  return {
    ...activeWalletQuery,
    receiveWallet,
    mainWallet,
    hasVisibleWallets,
    hasResolvedMainWallet,
    secondaryWallets: walletSelection.secondaryWallets,
    secondaryWallet,
    secondaryWalletCount,
    receiveWalletId: receiveWallet?.id,
    receiveWalletCurrency: getWalletCurrencyLabel(receiveWallet?.currency),
    receiveWalletStablecoinLabel: getRuntimeStablecoinLabel(receiveWallet?.currency),
    receiveWalletPairLabel: getWalletPairLabel(receiveWallet),
    secondaryWalletPairLabel: getWalletPairLabel(secondaryWallet),
  };
}
