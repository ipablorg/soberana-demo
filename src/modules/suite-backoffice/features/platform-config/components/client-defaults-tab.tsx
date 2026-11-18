/**
 * Client wallet defaults (`client.config.defaults.walletProviderId /
 * walletDefaultChain / walletDefaultCurrency`), read with
 * `adminLoopay_getClient` and saved with `adminLoopay_updateClient`. The save
 * sends the existing config with only those three keys replaced.
 */

import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import type { AdminClient } from '@/graphql/types/admin-loopay';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

import { OptionSelect } from '../../../components/option-select';
import { SUGGESTED_CHAINS } from '../../customers/lib/add-wallet';
import { WALLET_CURRENCY_OPTIONS, withCurrentValue } from '../lib/catalog-options';
import { useClientConfig, useUpdateClientConfig } from '../hooks/use-client-config';
import { useProviders } from '../hooks/use-platform-catalog';
import { isSelectableProvider } from '../lib/catalog-options';
import {
  areWalletDefaultsComplete,
  mergeWalletDefaults,
  readWalletDefaults,
  type ClientWalletDefaults,
} from '../lib/client-config';
import { ClientPicker } from './client-picker';

interface WalletDefaultsFormProps {
  client: AdminClient;
}

function WalletDefaultsForm({ client }: WalletDefaultsFormProps) {
  const { t } = useLingui();
  const [defaults, setDefaults] = useState<ClientWalletDefaults>(() =>
    readWalletDefaults(client.config)
  );
  const [showErrors, setShowErrors] = useState(false);

  // #411: dead and inactive providers are never offered; the current one stays
  // visible (marked unavailable) so the form never shows a blank selection.
  const allProviders = useProviders().data?.adminLoopay_listProviders ?? [];
  const currentProvider = allProviders.find(
    (provider) => provider.id === defaults.walletProviderId
  );
  const providerOptions = withCurrentValue(
    allProviders
      .filter(isSelectableProvider)
      .map((provider) => ({ value: provider.id, label: `${provider.name} (${provider.code})` })),
    defaults.walletProviderId
  ).map((option) =>
    currentProvider && option.value === currentProvider.id && !isSelectableProvider(currentProvider)
      ? { ...option, label: t`${currentProvider.name} (${currentProvider.code}) — no disponible` }
      : option
  );
  const updateClient = useUpdateClientConfig(() => setShowErrors(false));
  const complete = areWalletDefaultsComplete(defaults);

  const update = (field: keyof ClientWalletDefaults, value: string) =>
    setDefaults((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!complete) {
      setShowErrors(true);
      return;
    }
    if (updateClient.isPending) return;

    updateClient.mutate({
      id: client.id,
      input: { config: mergeWalletDefaults(client.config, defaults) },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold">
        <Trans>Defaults de billetera de {client.name}</Trans>
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="client-default-provider">
            <Trans>Proveedor de billetera</Trans>
          </Label>
          <Select
            value={defaults.walletProviderId}
            onValueChange={(value) => update('walletProviderId', value)}
          >
            <SelectTrigger id="client-default-provider">
              <SelectValue placeholder={t`Seleccione un proveedor`} />
            </SelectTrigger>
            <SelectContent>
              {providerOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="client-default-chain">
            <Trans>Cadena por defecto</Trans>
          </Label>
          <OptionSelect
            id="client-default-chain"
            value={defaults.walletDefaultChain}
            onChange={(value) => update('walletDefaultChain', value)}
            options={withCurrentValue(
              SUGGESTED_CHAINS.map((chain) => ({ value: chain, label: chain })),
              defaults.walletDefaultChain
            )}
            placeholder={t`Seleccione una cadena`}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="client-default-currency">
            <Trans>Moneda por defecto</Trans>
          </Label>
          <OptionSelect
            id="client-default-currency"
            value={defaults.walletDefaultCurrency}
            onChange={(value) => update('walletDefaultCurrency', value)}
            options={withCurrentValue(WALLET_CURRENCY_OPTIONS, defaults.walletDefaultCurrency)}
            placeholder={t`Seleccione una moneda`}
          />
        </div>
      </div>

      {showErrors && !complete ? (
        <p className="text-xs text-destructive">
          <Trans>Proveedor, cadena y moneda son obligatorios.</Trans>
        </p>
      ) : null}

      <p className="text-sm text-muted-foreground">
        <Trans>Se conservan todas las demás claves de la configuración del cliente.</Trans>
      </p>

      <Button type="submit" disabled={updateClient.isPending}>
        <Trans>Guardar defaults</Trans>
      </Button>
    </form>
  );
}

export function ClientDefaultsTab() {
  const [clientId, setClientId] = useState<string | undefined>();
  const { data, isLoading } = useClientConfig(clientId);
  const client = clientId ? data?.adminLoopay_getClient : undefined;

  return (
    <div className="space-y-6">
      <ClientPicker id="client-defaults-client" value={clientId} onChange={setClientId} />

      {!clientId ? (
        <p className="text-sm text-muted-foreground">
          <Trans>Seleccione un cliente para editar sus defaults de billetera.</Trans>
        </p>
      ) : isLoading || !client || client.id !== clientId ? (
        <p className="text-sm text-muted-foreground">
          <Trans>Cargando configuración del cliente...</Trans>
        </p>
      ) : (
        <WalletDefaultsForm key={`${client.id}-${client.updated_at}`} client={client} />
      )}
    </div>
  );
}
