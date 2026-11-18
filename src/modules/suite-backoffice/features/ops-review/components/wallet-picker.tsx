/**
 * Wallet picker cascading from a selected customer.
 *
 * Queries `adminLoopay_listWalletsByCustomer` once a customer is chosen so
 * ops never pastes wallet UUIDs by hand. Without a customer it stays
 * disabled — a wallet cannot be resolved without its owner.
 */

import { Trans, useLingui } from '@lingui/react/macro';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

import {
  useCustomerWallets,
  type CustomerWallet,
} from '../hooks/use-customer-wallets';

interface WalletPickerProps {
  id: string;
  customerId: string | null;
  value: string;
  /**
   * Receives the chosen wallet id and, as a second argument, the wallet itself
   * (so a form can read its currency). Consumers that only need the id can
   * keep passing a one-argument handler.
   */
  onChange: (walletId: string, wallet?: CustomerWallet) => void;
}

function walletLabel(wallet: CustomerWallet): string {
  const chain = wallet.chain ? ` · ${wallet.chain}` : '';
  const address = wallet.address
    ? ` — ${wallet.address.slice(0, 8)}…${wallet.address.slice(-4)}`
    : '';
  return `${wallet.currency}${chain}${address} (${wallet.status})`;
}

export function WalletPicker({
  id,
  customerId,
  value,
  onChange,
}: WalletPickerProps) {
  const { t } = useLingui();

  const { wallets, isLoading } = useCustomerWallets(customerId);

  const handleValueChange = (walletId: string) =>
    onChange(
      walletId,
      wallets.find((wallet) => wallet.id === walletId),
    );

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        <Trans>Billetera</Trans>
      </Label>
      {/* Always a string: `undefined` makes Radix switch to uncontrolled and warn. */}
      <Select
        value={value}
        onValueChange={handleValueChange}
        disabled={customerId === null || isLoading}
      >
        <SelectTrigger id={id}>
          <SelectValue
            placeholder={
              customerId === null
                ? t`Seleccione un cliente primero`
                : t`Seleccione una billetera`
            }
          />
        </SelectTrigger>
        <SelectContent>
          {wallets.map((wallet) => (
            <SelectItem key={wallet.id} value={wallet.id}>
              {walletLabel(wallet)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {customerId !== null && !isLoading && wallets.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          <Trans>El cliente no tiene billeteras.</Trans>
        </p>
      ) : null}
    </div>
  );
}
