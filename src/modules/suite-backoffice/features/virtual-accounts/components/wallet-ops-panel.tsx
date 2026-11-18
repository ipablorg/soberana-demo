/**
 * "Operaciones de billetera" panel.
 *
 * Groups the three wallet-side manual operations that belong next to virtual
 * accounts: provisioning a custody wallet, recording a vault created by hand in
 * the provider console, and sweeping a processing withdrawal into the ops vault.
 *
 * `adminLoopay_moveToOpsVault` is keyed by the withdrawal's `transactionId`,
 * not by a wallet, which is why that field asks for a transaction.
 */

import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import type { AdminCustomerSearchItem } from '@/graphql/queries/admin-loopay';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import { CustomerPicker } from '../../ops-review/components/customer-picker';
import { useClientOptions } from '../../ops-review/hooks/use-client-options';
import {
  useCreateWallet,
  useLinkProviderCustomer,
  useLinkWalletAddress,
  useMoveToOpsVault,
} from '../hooks/use-virtual-accounts';

export function WalletOpsPanel() {
  const { t } = useLingui();
  const { options: clientOptions } = useClientOptions();

  const [createWalletForm, setCreateWalletForm] = useState({
    clientId: '',
    customerId: '',
    chain: '',
    alias: '',
  });
  const [createWalletCustomer, setCreateWalletCustomer] =
    useState<AdminCustomerSearchItem | null>(null);
  const [linkAddressForm, setLinkAddressForm] = useState({
    customerId: '',
    vaultId: '',
    address: '',
    chain: '',
    currency: '',
  });
  const [linkAddressCustomer, setLinkAddressCustomer] =
    useState<AdminCustomerSearchItem | null>(null);
  const [opsVaultForm, setOpsVaultForm] = useState({
    transactionId: '',
    note: '',
  });
  const [providerCustomerForm, setProviderCustomerForm] = useState({
    customerId: '',
    providerCode: '',
    externalCustomerId: '',
  });
  const [providerCustomer, setProviderCustomer] =
    useState<AdminCustomerSearchItem | null>(null);

  const createWallet = useCreateWallet(() => {
    setCreateWalletForm({ clientId: '', customerId: '', chain: '', alias: '' });
    setCreateWalletCustomer(null);
  });
  const linkWalletAddress = useLinkWalletAddress(() => {
    setLinkAddressForm({
      customerId: '',
      vaultId: '',
      address: '',
      chain: '',
      currency: '',
    });
    setLinkAddressCustomer(null);
  });
  const moveToOpsVault = useMoveToOpsVault(() =>
    setOpsVaultForm({ transactionId: '', note: '' }),
  );
  const linkProviderCustomer = useLinkProviderCustomer(() => {
    setProviderCustomerForm({
      customerId: '',
      providerCode: '',
      externalCustomerId: '',
    });
    setProviderCustomer(null);
  });

  const canCreateWallet =
    createWalletForm.clientId.trim().length > 0 &&
    createWalletForm.customerId.trim().length > 0;
  const canLinkAddress =
    linkAddressForm.customerId.trim().length > 0 &&
    linkAddressForm.vaultId.trim().length > 0 &&
    linkAddressForm.address.trim().length > 0 &&
    linkAddressForm.chain.trim().length > 0;
  const canMoveToOpsVault = opsVaultForm.transactionId.trim().length > 0;
  const canLinkProviderCustomer =
    providerCustomerForm.customerId.trim().length > 0 &&
    providerCustomerForm.providerCode.trim().length > 0 &&
    providerCustomerForm.externalCustomerId.trim().length > 0;

  return (
    <section className="space-y-4 rounded-lg border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">
          <Trans>Operaciones de billetera</Trans>
        </h2>
        <p className="text-sm text-muted-foreground">
          <Trans>
            Aprovisionamiento y custodia manual asociados a las cuentas
            virtuales.
          </Trans>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">
            <Trans>Crear billetera</Trans>
          </h3>
          <div className="space-y-2">
            <Label htmlFor="wallet-client-id">
              <Trans>ID de cliente (tenant)</Trans>
            </Label>
            <Input
              id="wallet-client-id"
              value={createWalletForm.clientId}
              onChange={(event) =>
                setCreateWalletForm((current) => ({
                  ...current,
                  clientId: event.target.value,
                }))
              }
              list="wallet-client-options"
              placeholder={t`UUID del tenant — copielo desde Clients`}
            />
            <datalist id="wallet-client-options">
              {clientOptions.map((option) => (
                <option
                  key={option.client_id}
                  value={option.client_id}
                >{`${option.client_name}${option.is_active ? '' : ' (inactivo)'}`}</option>
              ))}
            </datalist>
          </div>
          <CustomerPicker
            id="wallet-customer-id"
            selected={createWalletCustomer}
            onSelect={(c) => {
              setCreateWalletCustomer(c);
              setCreateWalletForm((cur) => ({ ...cur, customerId: c.id }));
            }}
            onClear={() => {
              setCreateWalletCustomer(null);
              setCreateWalletForm((cur) => ({ ...cur, customerId: '' }));
            }}
            label={t`Cliente final`}
          />
          <div className="space-y-2">
            <Label htmlFor="wallet-chain">
              <Trans>Cadena</Trans>
            </Label>
            <Input
              id="wallet-chain"
              value={createWalletForm.chain}
              onChange={(event) =>
                setCreateWalletForm((current) => ({
                  ...current,
                  chain: event.target.value,
                }))
              }
              placeholder="base"
            />
          </div>
          <Button
            disabled={createWallet.isPending || !canCreateWallet}
            onClick={() =>
              createWallet.mutate({
                input: {
                  clientId: createWalletForm.clientId.trim(),
                  customerId: createWalletForm.customerId.trim(),
                  ...(createWalletForm.chain.trim() && {
                    chain: createWalletForm.chain.trim(),
                  }),
                  ...(createWalletForm.alias.trim() && {
                    alias: createWalletForm.alias.trim(),
                  }),
                },
              })
            }
          >
            <Trans>Crear billetera</Trans>
          </Button>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">
            <Trans>Vincular dirección de billetera</Trans>
          </h3>
          <CustomerPicker
            id="link-address-customer-id"
            selected={linkAddressCustomer}
            onSelect={(c) => {
              setLinkAddressCustomer(c);
              setLinkAddressForm((cur) => ({ ...cur, customerId: c.id }));
            }}
            onClear={() => {
              setLinkAddressCustomer(null);
              setLinkAddressForm((cur) => ({ ...cur, customerId: '' }));
            }}
          />
          <div className="space-y-2">
            <Label htmlFor="link-address-vault-id">
              <Trans>ID de bóveda del proveedor</Trans>
            </Label>
            <Input
              id="link-address-vault-id"
              value={linkAddressForm.vaultId}
              onChange={(event) =>
                setLinkAddressForm((current) => ({
                  ...current,
                  vaultId: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link-address-address">
              <Trans>Dirección de depósito</Trans>
            </Label>
            <Input
              id="link-address-address"
              value={linkAddressForm.address}
              onChange={(event) =>
                setLinkAddressForm((current) => ({
                  ...current,
                  address: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link-address-chain">
              <Trans>Cadena</Trans>
            </Label>
            <Input
              id="link-address-chain"
              value={linkAddressForm.chain}
              onChange={(event) =>
                setLinkAddressForm((current) => ({
                  ...current,
                  chain: event.target.value,
                }))
              }
              placeholder="tron"
            />
          </div>
          <Button
            disabled={linkWalletAddress.isPending || !canLinkAddress}
            onClick={() =>
              linkWalletAddress.mutate({
                customerId: linkAddressForm.customerId.trim(),
                input: {
                  vaultId: linkAddressForm.vaultId.trim(),
                  address: linkAddressForm.address.trim(),
                  chain: linkAddressForm.chain.trim(),
                  ...(linkAddressForm.currency.trim() && {
                    currency: linkAddressForm.currency.trim().toUpperCase(),
                  }),
                },
              })
            }
          >
            <Trans>Vincular dirección</Trans>
          </Button>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">
            <Trans>Mover a bóveda de operaciones</Trans>
          </h3>
          <div className="space-y-2">
            <Label htmlFor="ops-vault-transaction-id">
              <Trans>ID de la transacción de retiro</Trans>
            </Label>
            <Input
              id="ops-vault-transaction-id"
              value={opsVaultForm.transactionId}
              onChange={(event) =>
                setOpsVaultForm((current) => ({
                  ...current,
                  transactionId: event.target.value,
                }))
              }
              placeholder={t`Retiro en procesamiento`}
            />
            <p className="text-xs text-muted-foreground">
              <Trans>
                Copie el ID desde el explorador de Transacciones (columna
                referencia → detalle).
              </Trans>
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ops-vault-note">
              <Trans>Nota</Trans>
            </Label>
            <Input
              id="ops-vault-note"
              value={opsVaultForm.note}
              onChange={(event) =>
                setOpsVaultForm((current) => ({
                  ...current,
                  note: event.target.value,
                }))
              }
            />
          </div>
          <Button
            disabled={moveToOpsVault.isPending || !canMoveToOpsVault}
            onClick={() =>
              moveToOpsVault.mutate({
                transactionId: opsVaultForm.transactionId.trim(),
                input: {
                  ...(opsVaultForm.note.trim() && {
                    note: opsVaultForm.note.trim(),
                  }),
                },
              })
            }
          >
            <Trans>Mover fondos</Trans>
          </Button>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">
            <Trans>Vincular cliente del proveedor</Trans>
          </h3>
          <CustomerPicker
            id="provider-customer-customer-id"
            selected={providerCustomer}
            onSelect={(c) => {
              setProviderCustomer(c);
              setProviderCustomerForm((cur) => ({ ...cur, customerId: c.id }));
            }}
            onClear={() => {
              setProviderCustomer(null);
              setProviderCustomerForm((cur) => ({ ...cur, customerId: '' }));
            }}
          />
          <div className="space-y-2">
            <Label htmlFor="provider-customer-code">
              <Trans>Código de proveedor</Trans>
            </Label>
            <Input
              id="provider-customer-code"
              value={providerCustomerForm.providerCode}
              onChange={(event) =>
                setProviderCustomerForm((current) => ({
                  ...current,
                  providerCode: event.target.value,
                }))
              }
              placeholder="kirafin"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="provider-customer-external-id">
              <Trans>ID del cliente en el proveedor</Trans>
            </Label>
            <Input
              id="provider-customer-external-id"
              value={providerCustomerForm.externalCustomerId}
              onChange={(event) =>
                setProviderCustomerForm((current) => ({
                  ...current,
                  externalCustomerId: event.target.value,
                }))
              }
            />
          </div>
          <Button
            disabled={
              linkProviderCustomer.isPending || !canLinkProviderCustomer
            }
            onClick={() =>
              linkProviderCustomer.mutate({
                customerId: providerCustomerForm.customerId.trim(),
                input: {
                  providerCode: providerCustomerForm.providerCode.trim(),
                  externalCustomerId:
                    providerCustomerForm.externalCustomerId.trim(),
                },
              })
            }
          >
            <Trans>Vincular cliente</Trans>
          </Button>
        </div>
      </div>
    </section>
  );
}
