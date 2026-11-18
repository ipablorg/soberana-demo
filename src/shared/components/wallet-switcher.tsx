import { cn } from '@/shared/lib/utils';
import {
  getWalletChainLabel,
  getWalletCurrencyLabel,
} from '@/shared/lib/receive-wallet';

interface WalletOption {
  id: string;
  currency: string;
  chain: string;
}

interface WalletSwitcherProps {
  wallets: WalletOption[];
  mainWalletId?: string | null;
  selectedWalletId: string | null;
  onSelect: (walletId: string) => void;
  className?: string;
}

export function WalletSwitcher({
  wallets,
  mainWalletId,
  selectedWalletId,
  onSelect,
  className,
}: WalletSwitcherProps) {
  if (wallets.length <= 1) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {wallets.map((wallet) => (
        <button
          key={wallet.id}
          type="button"
          onClick={() => onSelect(wallet.id)}
          className={cn(
            'inline-flex min-h-10 items-center gap-2 rounded-full border px-3 py-2',
            'bg-background/40 text-left transition-colors duration-150 hover:bg-muted/50',
            selectedWalletId === wallet.id
              ? 'border-primary/60 bg-primary/10'
              : 'border-border',
          )}
        >
          <span
            className={cn(
              'h-2 w-2 rounded-full shrink-0',
              wallet.id === mainWalletId ? 'bg-primary' : 'bg-muted-foreground/30',
            )}
            aria-hidden
          />
          <span className="text-sm font-medium text-foreground">
            {(getWalletCurrencyLabel(wallet.currency) ?? wallet.currency)}
            <span className="text-muted-foreground"> / {getWalletChainLabel(wallet.chain) ?? wallet.chain}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
