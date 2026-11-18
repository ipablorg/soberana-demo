export interface ReceiveWalletCandidate {
  id: string;
  currency?: string | null;
  chain?: string | null;
  created_at?: string | null;
}

export interface DefaultWalletSelection {
  currency: string;
  chain: string;
}

export interface WalletSelection<T extends ReceiveWalletCandidate> {
  mainWallet: T | undefined;
  secondaryWallets: T[];
}

export function getWalletCurrencyLabel(currency: string | null | undefined): string | null {
  const normalized = currency?.trim().toUpperCase();
  return normalized && normalized.length > 0 ? normalized : null;
}

export function getWalletChainLabel(chain: string | null | undefined): string | null {
  const normalized = chain?.trim().toUpperCase();
  return normalized && normalized.length > 0 ? normalized : null;
}

export function getWalletPairLabel(
  wallet:
    | Pick<ReceiveWalletCandidate, 'currency' | 'chain'>
    | null
    | undefined,
): string | null {
  const currency = getWalletCurrencyLabel(wallet?.currency);
  const chain = getWalletChainLabel(wallet?.chain);

  if (currency && chain) {
    return `${currency} / ${chain}`;
  }

  return currency ?? chain;
}

function normalizeWalletValue(value: string | null | undefined): string | null {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  return normalized.toUpperCase();
}
export function resolveReceiveWallet<T extends ReceiveWalletCandidate>(
  wallets: readonly T[],
  defaultWallet?: DefaultWalletSelection | null,
): T | undefined {
  if (wallets.length === 0) {
    return undefined;
  }

  const normalizedDefaultCurrency = normalizeWalletValue(defaultWallet?.currency);
  const normalizedDefaultChain = normalizeWalletValue(defaultWallet?.chain);

  if (normalizedDefaultCurrency && normalizedDefaultChain) {
    const exactMatch = wallets.find(
      (wallet) =>
        normalizeWalletValue(wallet.currency) === normalizedDefaultCurrency &&
        normalizeWalletValue(wallet.chain) === normalizedDefaultChain,
    );

    if (exactMatch) {
      return exactMatch;
    }
  }

  return undefined;
}

export function resolveWalletSelection<T extends ReceiveWalletCandidate>(
  wallets: readonly T[],
  defaultWallet?: DefaultWalletSelection | null,
): WalletSelection<T> {
  const mainWallet = resolveReceiveWallet(wallets, defaultWallet);

  if (!mainWallet) {
    return {
      mainWallet: undefined,
      secondaryWallets: [...wallets],
    };
  }

  return {
    mainWallet,
    secondaryWallets: wallets.filter((wallet) => wallet.id !== mainWallet.id),
  };
}
