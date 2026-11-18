/**
 * "Registrar recaudo manual" form — `adminLoopay_createRecaudo`.
 *
 * Records a deposit that arrived outside the platform (thin provider payload).
 * The backend classifies these by `source` (bank_transfer | cash |
 * provider_manual | other), not by payment rail, so that is what this form
 * collects alongside the optional provider reference.
 */

import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import type { AdminRecaudoSource } from '@/graphql/types/admin-loopay';
import type { AdminCustomerSearchItem } from '@/graphql/queries/admin-loopay';
import { CoinIcon } from '@/shared/components/common/coin-icon';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';

import { OptionSelect } from '../../../components/option-select';
import { CustomerPicker } from '../../ops-review/components/customer-picker';
import { useProviderOptions } from '../../platform-config/hooks/use-catalog-options';
import { WalletPicker } from '../../ops-review/components/wallet-picker';
import {
  useCustomerWallets,
  type CustomerWallet,
} from '../../ops-review/hooks/use-customer-wallets';
import {
  isValidOpsAmount,
  isValidOpsCurrency,
} from '../../ops-review/lib/ops-formatting';
import { useCreateRecaudo } from '../hooks/use-recaudos-queue';
import {
  buildRecaudoCurrencyOptions,
  hasCurrencyMismatch,
  resolveDefaultCurrency,
} from '../lib/recaudo-currency';

const EMPTY_FORM = {
  customerId: '',
  walletId: '',
  amount: '',
  currency: '',
  reference: '',
  source: 'bank_transfer' as AdminRecaudoSource,
  providerCode: '',
  providerEventId: '',
  note: '',
};

export function CreateRecaudoForm() {
  const { t } = useLingui();
  const providerOptions = useProviderOptions();
  const [form, setForm] = useState(EMPTY_FORM);
  const [showErrors, setShowErrors] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<AdminCustomerSearchItem | null>(null);

  const createRecaudo = useCreateRecaudo(() => {
    setForm(EMPTY_FORM);
    setShowErrors(false);
    setSelectedCustomer(null);
  });

  // Same query key as `WalletPicker`, so this shares its request (no refetch).
  const { wallets } = useCustomerWallets(selectedCustomer?.id ?? null);
  const selectedWallet = wallets.find((wallet) => wallet.id === form.walletId);
  const currencyOptions = buildRecaudoCurrencyOptions(
    wallets.map((wallet) => wallet.currency),
    form.currency,
  );

  const amountValid = isValidOpsAmount(form.amount);
  const currencyValid = isValidOpsCurrency(form.currency);
  const walletCurrency = resolveDefaultCurrency(selectedWallet);
  const currencyMismatch = hasCurrencyMismatch(walletCurrency, form.currency);
  const identifiersValid =
    form.customerId.trim().length > 0 && form.walletId.trim().length > 0;
  const canSubmit =
    amountValid && currencyValid && identifiersValid && !currencyMismatch;

  const update = (field: keyof typeof EMPTY_FORM, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  // A wallet (and the currency seeded from it) belongs to one customer, so
  // switching or clearing the customer drops both.
  const handleSelectCustomer = (customer: AdminCustomerSearchItem) => {
    setSelectedCustomer(customer);
    setForm((current) =>
      current.customerId === customer.id
        ? current
        : { ...current, customerId: customer.id, walletId: '', currency: '' },
    );
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setForm((current) => ({
      ...current,
      customerId: '',
      walletId: '',
      currency: '',
    }));
  };

  // The currency defaults to the wallet's; the user can still change it.
  const handleWalletChange = (walletId: string, wallet?: CustomerWallet) => {
    const chosen = wallet ?? wallets.find((item) => item.id === walletId);

    setForm((current) => ({
      ...current,
      walletId,
      currency: chosen ? resolveDefaultCurrency(chosen) : current.currency,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!canSubmit) {
      setShowErrors(true);
      return;
    }

    if (createRecaudo.isPending) return;

    createRecaudo.mutate({
      input: {
        customerId: form.customerId.trim(),
        walletId: form.walletId.trim(),
        amount: form.amount.trim(),
        currency: form.currency.trim().toUpperCase(),
        source: form.source,
        ...(form.reference.trim() && { reference: form.reference.trim() }),
        ...(form.providerCode.trim() && {
          providerCode: form.providerCode.trim(),
        }),
        ...(form.providerEventId.trim() && {
          providerEventId: form.providerEventId.trim(),
        }),
        ...(form.note.trim() && { note: form.note.trim() }),
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border bg-card p-6"
    >
      <div>
        <h2 className="text-lg font-semibold">
          <Trans>Registrar recaudo manual</Trans>
        </h2>
        <p className="text-sm text-muted-foreground">
          <Trans>
            Para depósitos recibidos fuera de la plataforma. Acreditan la
            billetera al aprobarse.
          </Trans>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CustomerPicker
          id="recaudo-customer-id"
          selected={selectedCustomer}
          onSelect={handleSelectCustomer}
          onClear={handleClearCustomer}
          label={t`Cliente (depositante)`}
        />

        <WalletPicker
          id="recaudo-wallet-id"
          customerId={selectedCustomer?.id ?? null}
          value={form.walletId}
          onChange={handleWalletChange}
        />

        <div className="space-y-2">
          <Label htmlFor="recaudo-amount">
            <Trans>Monto</Trans>
          </Label>
          <Input
            id="recaudo-amount"
            value={form.amount}
            onChange={(event) => update('amount', event.target.value)}
            placeholder="1000.00"
          />
          {showErrors && !amountValid ? (
            <p className="text-xs text-destructive">
              <Trans>Ingrese un monto positivo con hasta 8 decimales.</Trans>
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="recaudo-currency">
            <Trans>Moneda</Trans>
          </Label>
          <Select
            value={form.currency}
            onValueChange={(value) => update('currency', value)}
          >
            <SelectTrigger
              id="recaudo-currency"
              aria-invalid={currencyMismatch || undefined}
              aria-describedby={
                currencyMismatch ? 'recaudo-currency-mismatch' : undefined
              }
            >
              <SelectValue placeholder={t`Seleccione una moneda`} />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map((code) => (
                <SelectItem key={code} value={code}>
                  <span className="flex items-center gap-2">
                    <CoinIcon code={code} />
                    {code}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currencyMismatch ? (
            <p
              id="recaudo-currency-mismatch"
              role="alert"
              className="text-xs text-destructive"
            >
              {t`La moneda no coincide con la de la billetera (${walletCurrency}).`}
            </p>
          ) : null}
          {showErrors && !currencyValid ? (
            <p className="text-xs text-destructive">
              <Trans>Seleccione una moneda válida.</Trans>
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="recaudo-source">
            <Trans>Origen</Trans>
          </Label>
          <Select
            value={form.source}
            onValueChange={(value) => update('source', value)}
          >
            <SelectTrigger id="recaudo-source">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank_transfer">{t`Transferencia bancaria`}</SelectItem>
              <SelectItem value="cash">{t`Efectivo`}</SelectItem>
              <SelectItem value="provider_manual">{t`Manual del proveedor`}</SelectItem>
              <SelectItem value="other">{t`Otro`}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recaudo-reference">
            <Trans>Referencia externa</Trans>
          </Label>
          <Input
            id="recaudo-reference"
            value={form.reference}
            onChange={(event) => update('reference', event.target.value)}
            placeholder={t`Referencia del extracto bancario`}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recaudo-provider-code">
            <Trans>Código de proveedor</Trans>
          </Label>
          <OptionSelect
            id="recaudo-provider-code"
            value={form.providerCode}
            onChange={(value) => update('providerCode', value)}
            options={providerOptions}
            placeholder={t`Sin proveedor`}
            emptyLabel={t`Sin proveedor`}
          />
          <p className="text-xs text-muted-foreground">
            <Trans>
              Opcional. Solo si el depósito llegó por un proveedor concreto.
            </Trans>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recaudo-provider-event-id">
            <Trans>ID del evento del proveedor</Trans>
          </Label>
          <Input
            id="recaudo-provider-event-id"
            value={form.providerEventId}
            onChange={(event) => update('providerEventId', event.target.value)}
            placeholder={t`Opcional`}
          />
          <p className="text-xs text-muted-foreground">
            <Trans>
              Opcional. Identificador del evento en la consola del proveedor, para
              conciliar; déjelo vacío si no lo tiene.
            </Trans>
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="recaudo-note">
          <Trans>Nota</Trans>
        </Label>
        <Textarea
          id="recaudo-note"
          value={form.note}
          onChange={(event) => update('note', event.target.value)}
          rows={2}
          className="resize-none"
        />
      </div>

      {showErrors && !identifiersValid ? (
        <p className="text-xs text-destructive">
          <Trans>Indique el cliente y la billetera destino.</Trans>
        </p>
      ) : null}

      <Button type="submit" disabled={createRecaudo.isPending}>
        {createRecaudo.isPending ? (
          <Trans>Registrando...</Trans>
        ) : (
          <Trans>Registrar recaudo</Trans>
        )}
      </Button>
    </form>
  );
}
