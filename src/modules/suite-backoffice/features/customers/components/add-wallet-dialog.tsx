/**
 * "Agregar billetera" dialog of the Customer 360 panel.
 *
 * Provisions a custodial wallet through `adminLoopay_createWallet` (admin, operations, OPS_VA, OPS_COMMERCIAL).
 * The custody provider defaults to "Automático" (the backend resolves it from
 * the client's rail mapping / default provider, today's behavior and the
 * only option when no wallet-capable provider is configured). Picking a
 * specific active WALLET-type provider sends its id and switches the chain
 * selector to that provider's own configured chains, with the resulting
 * currency shown inline; a provider with no usable wallet config disables
 * submit with an explanatory warning.
 *
 * In "Automático" mode the chain is optional (the provider default applies
 * when omitted) and the currency is NOT chosen here: the backend takes it
 * from the resolved provider's wallet config. The chain selector then
 * combines the chains the backend reported as supported (after a
 * rejection), the customer's existing wallet chains and a few labelled
 * suggestions; the backend remains the source of truth.
 *
 * Failures stay inline (the dialog remains open so the chain/provider can be
 * adjusted) and are always shown as friendly text, never the raw backend
 * message.
 */

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import { AlertCircle, Loader2 } from '@/shared/components/animated-icons';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

import { useCreateCustomerWallet, useWalletCapableProviders } from '../hooks/use-customers';
import {
  AUTO_PROVIDER_CHOICE,
  CUSTOM_CHAIN_CHOICE,
  DEFAULT_CHAIN_CHOICE,
  MAX_ALIAS_LENGTH,
  MAX_CHAIN_LENGTH,
  buildChainOptions,
  buildCreateWalletInput,
  classifyCreateWalletError,
  providerDisplayLabel,
  resolveChain,
  resolveProviderCurrency,
  resolveProviderWalletConfig,
  selectWalletCapableProviders,
  type CreateWalletFailure,
} from '../lib/add-wallet';

export interface AddWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  customerId: string;
  /** Display name shown in the description. */
  customerLabel: string;
  /** Chains of the wallets the customer already has. */
  existingChains: readonly (string | null | undefined)[];
}

export function AddWalletDialog({
  open,
  onOpenChange,
  clientId,
  customerId,
  customerLabel,
  existingChains,
}: AddWalletDialogProps) {
  // Radix unmounts the content when closed, so the form (and the mutation
  // state) starts fresh on every open. `busyRef` lets the outer dialog refuse
  // to close (Esc, overlay, X) while a request is in flight.
  const busyRef = useRef(false);

  const handleOpenChange = (next: boolean) => {
    if (!next && busyRef.current) return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <AddWalletForm
          clientId={clientId}
          customerId={customerId}
          customerLabel={customerLabel}
          existingChains={existingChains}
          busyRef={busyRef}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

interface AddWalletFormProps extends Omit<AddWalletDialogProps, 'open' | 'onOpenChange'> {
  busyRef: { current: boolean };
  onClose: () => void;
}

function AddWalletForm({
  clientId,
  customerId,
  customerLabel,
  existingChains,
  busyRef,
  onClose,
}: AddWalletFormProps) {
  const { t } = useLingui();

  const [chainChoice, setChainChoice] = useState(DEFAULT_CHAIN_CHOICE);
  const [customChain, setCustomChain] = useState('');
  const [alias, setAlias] = useState('');
  const [reportedChains, setReportedChains] = useState<string[]>([]);
  const [providerChoice, setProviderChoice] = useState(AUTO_PROVIDER_CHOICE);
  // Synchronous guard: `isPending` only flips after the next render, so a
  // double click / Enter in the same tick could otherwise submit twice.
  const inFlight = useRef(false);

  const { mutate, isPending, error } = useCreateCustomerWallet(onClose);
  const { data: providersData } = useWalletCapableProviders();

  useEffect(() => {
    busyRef.current = isPending;
    return () => {
      busyRef.current = false;
    };
  }, [busyRef, isPending]);

  const walletProviders = selectWalletCapableProviders(
    providersData?.adminLoopay_listProviders ?? [],
  );
  const selectedProvider =
    providerChoice === AUTO_PROVIDER_CHOICE
      ? null
      : walletProviders.find((candidate) => candidate.id === providerChoice) ??
        null;
  const selectedProviderWalletConfig = selectedProvider
    ? resolveProviderWalletConfig(selectedProvider)
    : null;
  const providerConfigUnusable =
    selectedProvider !== null && selectedProviderWalletConfig === null;

  const chain = resolveChain(chainChoice, customChain);
  const isCustom = chainChoice === CUSTOM_CHAIN_CHOICE;
  const canSubmit = !isCustom || chain.length > 0;

  const options = buildChainOptions({
    reportedChains,
    existingChains,
    providerChains: selectedProvider
      ? selectedProviderWalletConfig?.chains ?? []
      : undefined,
  });
  const hasSuggestions = options.some((option) => option.source === 'suggested');
  const resultingCurrency = selectedProviderWalletConfig
    ? resolveProviderCurrency(selectedProviderWalletConfig, chain)
    : null;
  const failure = error ? classifyCreateWalletError(error) : null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending || inFlight.current || !canSubmit || providerConfigUnusable) {
      return;
    }

    inFlight.current = true;
    mutate(
      {
        input: buildCreateWalletInput({
          clientId,
          customerId,
          chain,
          alias,
          providerId: providerChoice,
        }),
      },
      {
        onError: (failed) => {
          const { availableChains } = classifyCreateWalletError(failed);
          if (availableChains.length > 0) setReportedChains(availableChains);
        },
        onSettled: () => {
          inFlight.current = false;
        },
      },
    );
  };

  const failureMessage = (current: CreateWalletFailure): string => {
    switch (current.kind) {
      case 'kyc_not_approved':
        return t`El cliente necesita KYC aprobado para crear una billetera.`;
      case 'chain_not_supported': {
        const rejected = current.chain;
        const available = current.availableChains.join(', ');
        if (rejected && available) {
          return t`La cadena "${rejected}" no está disponible para este cliente. Cadenas disponibles: ${available}.`;
        }
        if (rejected) {
          return t`La cadena "${rejected}" no está disponible para este cliente.`;
        }
        return t`La cadena elegida no está disponible para este cliente.`;
      }
      case 'provider_not_configured':
        return t`No hay un proveedor configurado para crear billeteras en esta cadena. Revisa la configuración del cliente.`;
      case 'customer_client_mismatch':
        return t`El cliente no pertenece a la organización seleccionada. Recarga la página e inténtalo de nuevo.`;
      case 'customer_not_found':
        return t`No se encontró al cliente. Recarga la lista e inténtalo de nuevo.`;
      case 'permission_denied':
        return t`No tienes permisos para crear billeteras. Se requiere el rol de administrador de Loopay.`;
      case 'network':
        return t`No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.`;
      case 'unknown':
        return t`No se pudo crear la billetera. Inténtalo de nuevo o contacta a soporte.`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          <Trans>Agregar billetera</Trans>
        </DialogTitle>
        <DialogDescription>
          <Trans>
            Se creará una billetera para {customerLabel} a través del proveedor
            de custodia.
          </Trans>
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2" data-testid="add-wallet-provider-field">
        <Label htmlFor="add-wallet-provider">
          <Trans>Proveedor de custodia</Trans>
        </Label>
        <Select
          value={providerChoice}
          onValueChange={setProviderChoice}
          disabled={isPending}
        >
          <SelectTrigger id="add-wallet-provider">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={AUTO_PROVIDER_CHOICE}>
              {t`Automático (según la configuración del cliente)`}
            </SelectItem>
            {walletProviders.map((walletProvider) => (
              <SelectItem key={walletProvider.id} value={walletProvider.id}>
                {providerDisplayLabel(walletProvider)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {providerConfigUnusable ? (
          <Alert>
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              <Trans>
                Este proveedor no tiene configuración de billeteras. Revísala
                en Configuración de plataforma → Proveedores.
              </Trans>
            </AlertDescription>
          </Alert>
        ) : null}
      </div>

      <div className="space-y-2" data-testid="add-wallet-chain-field">
        <Label htmlFor="add-wallet-chain">
          <Trans>Cadena</Trans>
        </Label>
        <Select
          value={chainChoice}
          onValueChange={setChainChoice}
          disabled={isPending}
        >
          <SelectTrigger id="add-wallet-chain">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={DEFAULT_CHAIN_CHOICE}>
              {t`Predeterminada del proveedor`}
            </SelectItem>
            {options.map(({ value: chainOption, source }) => (
              <SelectItem key={chainOption} value={chainOption}>
                {source === 'suggested' ? t`${chainOption} (sugerida)` : chainOption}
              </SelectItem>
            ))}
            <SelectItem value={CUSTOM_CHAIN_CHOICE}>
              {t`Otra cadena…`}
            </SelectItem>
          </SelectContent>
        </Select>
        {resultingCurrency ? (
          <p className="text-xs text-muted-foreground">
            <Trans>
              Se creará una billetera <strong>{resultingCurrency}</strong>.
            </Trans>
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            <Trans>
              La moneda la define la configuración del proveedor para la cadena
              elegida.
            </Trans>
          </p>
        )}
        {hasSuggestions ? (
          <p className="text-xs text-muted-foreground">
            <Trans>
              Las cadenas sugeridas no están confirmadas: el sistema valida la
              cadena con la configuración del proveedor.
            </Trans>
          </p>
        ) : null}
      </div>

      {isCustom ? (
        <div className="space-y-2">
          <Label htmlFor="add-wallet-custom-chain">
            <Trans>Nombre de la cadena</Trans>
          </Label>
          <Input
            id="add-wallet-custom-chain"
            value={customChain}
            onChange={(event) => setCustomChain(event.target.value)}
            maxLength={MAX_CHAIN_LENGTH}
            disabled={isPending}
            autoComplete="off"
            autoFocus
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="add-wallet-alias">
          <Trans>Alias (opcional)</Trans>
        </Label>
        <Input
          id="add-wallet-alias"
          value={alias}
          onChange={(event) => setAlias(event.target.value)}
          maxLength={MAX_ALIAS_LENGTH}
          disabled={isPending}
          autoComplete="off"
        />
      </div>

      {failure ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>{failureMessage(failure)}</AlertDescription>
        </Alert>
      ) : null}

      <DialogFooter className="gap-2 sm:gap-0">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={onClose}
        >
          <Trans>Cancelar</Trans>
        </Button>
        <Button
          type="submit"
          disabled={isPending || !canSubmit || providerConfigUnusable}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <Trans>Creando billetera…</Trans>
            </>
          ) : (
            <Trans>Crear billetera</Trans>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
