import { useEffect, useMemo, useState } from 'react';
import { useWallets } from '@/shared/hooks/use-wallets';
import { resolveWalletSelection } from '@/shared/lib/receive-wallet';

export function useActiveWallet() {
  const walletsQuery = useWallets();

  const walletSelection = useMemo(
    () => resolveWalletSelection(walletsQuery.wallets, walletsQuery.defaultWallet),
    [walletsQuery.wallets, walletsQuery.defaultWallet],
  );

  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedWalletId && walletsQuery.wallets.some((wallet) => wallet.id === selectedWalletId)) {
      return;
    }

    if (walletSelection.mainWallet?.id) {
      setSelectedWalletId(walletSelection.mainWallet.id);
      return;
    }

    setSelectedWalletId(walletsQuery.wallets[0]?.id ?? null);
  }, [selectedWalletId, walletSelection.mainWallet?.id, walletsQuery.wallets]);

  const activeWallet = walletsQuery.wallets.find((wallet) => wallet.id === selectedWalletId)
    ?? walletSelection.mainWallet
    ?? walletsQuery.wallets[0]
    ?? null;

  const mainWallet = walletSelection.mainWallet ?? null;
  const secondaryWallets = mainWallet
    ? walletsQuery.wallets.filter((wallet) => wallet.id !== mainWallet.id)
    : walletsQuery.wallets;

  return {
    ...walletsQuery,
    activeWallet,
    activeWalletId: activeWallet?.id,
    mainWallet,
    secondaryWallets,
    selectedWalletId,
    setSelectedWalletId,
  };
}
