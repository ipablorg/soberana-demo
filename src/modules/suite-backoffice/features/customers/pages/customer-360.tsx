/**
 * `/backoffice/customers` — Customer 360.
 *
 * Lists customers via `adminLoopay_listCustomers` (full entity), supports
 * search (name, business legal name or email), KYC / customer-status filters and client filtering. Row
 * click opens a detail dialog with customer info, wallets (fetched via
 * `adminLoopay_listWalletsByCustomer`) and status actions (Suspend / Freeze /
 * Penalize / Activate).
 */

import { ViewAsCustomerButton } from '../components/view-as-customer-button';
import { useMemo, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { ColumnDef } from '@tanstack/react-table';

import type {
  AdminClientKycStatus,
  AdminCustomerManagementEntity,
  AdminLoopayCustomerStatus,
  AdminUpdatableCustomerStatus,
} from '@/graphql/types/admin-loopay';
import { DataTable } from '@/shared/components/common/DataTable';
import { PageHeader } from '@/shared/components/common/PageHeader';
import {
  StatePillChip,
  StatePillChipStatusLabel,
} from '@/shared/components/backoffice/StatePillChip';
import { StateChangeConfirmationModal } from '@/shared/components/backoffice/StateChangeConfirmationModal';
import { ToggleConfirmationDialog } from '@/shared/components/backoffice/toggle-confirmation-dialog';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Loader2, Plus, Wallet } from '@/shared/components/animated-icons';
import { formatFiat } from '@/shared/lib/format-money';
import {
  canAddWallet,
  canRequestVirtualAccount,
  canViewAsCustomer,
} from '@/shared/lib/staff-roles';
import { useAuthStore } from '@/shared/stores/auth-store';

import {
  useCustomerWallets,
  useCustomersManagement,
  useUpdateCustomerStatus,
  useUpdateWallet,
} from '../hooks/use-customers';
import { AddWalletDialog } from '../components/add-wallet-dialog';
import { RequestVirtualAccountDialog } from '../components/request-virtual-account-dialog';
import { CustomerRequirementsLink } from '../../provider-requirements/components/customer-requirements-link';
import { getAddWalletAvailability } from '../lib/add-wallet';
import { canManageCustomerStatus } from '../lib/customer-status-actions';
import { getRequestVirtualAccountAvailability } from '../lib/virtual-account-request';
import { ClientFilterSelect } from '../../ops-review/components/client-filter-select';
import { useClientOptions } from '../../ops-review/hooks/use-client-options';
import { clientNameFor, kycStatusLabel } from '../../ops-review/lib/ops-labels';
import {
  EMPTY_CELL,
  formatCustomerName,
  formatOpsDateTime,
} from '../../ops-review/lib/ops-formatting';

const KYC_STATUSES: AdminClientKycStatus[] = [
  'NOT_INITIATED',
  'INITIATED',
  'PENDING_REVIEW',
  'ADDITIONAL_INFO_REQUIRED',
  'APPROVED',
  'REJECTED',
  'EXPIRED',
];

const CUSTOMER_STATUSES: AdminLoopayCustomerStatus[] = [
  'ACTIVE',
  'SUSPENDED',
  'FROZEN',
  'PENALIZED',
  'OFFBOARDED',
];

const UPDATABLE_STATUSES: AdminUpdatableCustomerStatus[] = [
  'ACTIVE',
  'SUSPENDED',
  'FROZEN',
  'PENALIZED',
];

const ALL_VALUE = 'ALL';

export default function Customer360() {
  const { t } = useLingui();

  const [emailSearch, setEmailSearch] = useState('');
  const [kycStatusFilter, setKycStatusFilter] = useState<AdminClientKycStatus | null>(null);
  const [customerStatusFilter, setCustomerStatusFilter] =
    useState<AdminLoopayCustomerStatus | null>(null);
  const [clientIdFilter, setClientIdFilter] = useState<string | undefined>(undefined);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomerManagementEntity | null>(
    null
  );
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    customer: AdminCustomerManagementEntity;
    nextStatus: AdminUpdatableCustomerStatus;
  } | null>(null);
  const [addWalletOpen, setAddWalletOpen] = useState(false);
  const [requestVaOpen, setRequestVaOpen] = useState(false);
  const staffRoles = useAuthStore((state) => state.user?.staff_roles);
  const { options: clientOptions } = useClientOptions();
  const [pendingWalletChange, setPendingWalletChange] = useState<{
    walletId: string;
    label: string;
    nextStatus: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  } | null>(null);

  const where = useMemo(
    () => ({
      ...(clientIdFilter && { clientId: clientIdFilter }),
      ...(emailSearch.trim() && { search: emailSearch.trim() }),
      ...(kycStatusFilter && { kycStatus: kycStatusFilter }),
      ...(customerStatusFilter && { customerStatus: customerStatusFilter }),
    }),
    [clientIdFilter, emailSearch, kycStatusFilter, customerStatusFilter]
  );

  const { data, isLoading } = useCustomersManagement(where);
  const { data: walletsData, isLoading: walletsLoading } = useCustomerWallets(
    selectedCustomer?.id ?? null
  );

  const updateCustomerStatus = useUpdateCustomerStatus((result) => {
    if (selectedCustomer) {
      setSelectedCustomer({
        ...selectedCustomer,
        customerStatus: result.adminLoopay_updateCustomerStatus.current_status,
      });
    }
    setPendingStatusChange(null);
  });

  const updateWallet = useUpdateWallet(() => setPendingWalletChange(null));

  // `adminLoopay_createWallet` is open to LOOPAY_ADMIN, LOOPAY_OPERATIONS and
  // OPS_VA (#411: commercial reads wallets but never provisions one); the UI
  // just avoids offering an action that would be rejected.
  const canCreateWallet = canAddWallet(staffRoles);
  // #415 + epic 2026-11 S5: viewing the client app as a customer is for
  // LOOPAY_ADMIN and OPS_COMMERCIAL (exact roles).
  const canViewAs = canViewAsCustomer(staffRoles);

  const canManageStatus = canManageCustomerStatus(staffRoles);

  const customers = data?.adminLoopay_listCustomers ?? [];
  const wallets = walletsData?.adminLoopay_listWalletsByCustomer ?? [];
  const addWallet = getAddWalletAvailability({
    isAdmin: canCreateWallet,
    kycStatus: selectedCustomer?.kycStatus ?? 'NOT_INITIATED',
  });

  const requestVa = getRequestVirtualAccountAvailability({
    canRequest: canRequestVirtualAccount(staffRoles),
    kycStatus: selectedCustomer?.kycStatus ?? 'NOT_INITIATED',
  });

  const statusActionLabel = (status: AdminUpdatableCustomerStatus): string => {
    switch (status) {
      case 'ACTIVE':
        return t`Activar`;
      case 'SUSPENDED':
        return t`Suspender`;
      case 'FROZEN':
        return t`Congelar`;
      case 'PENALIZED':
        return t`Penalizar`;
    }
  };

  const statusActionVariant = (
    status: AdminUpdatableCustomerStatus
  ): 'default' | 'outline' | 'destructive' => {
    if (status === 'ACTIVE') return 'default';
    if (status === 'PENALIZED') return 'destructive';
    return 'outline';
  };

  const columns = useMemo<ColumnDef<AdminCustomerManagementEntity>[]>(
    () => [
      {
        accessorKey: 'firstName',
        header: t`Nombre`,
        cell: ({ row }) => (
          <span className="font-medium">
            {formatCustomerName(row.original.firstName, row.original.lastName, row.original.email)}
          </span>
        ),
      },
      {
        accessorKey: 'email',
        header: t`Email`,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.email}</span>
        ),
      },
      {
        accessorKey: 'clientId',
        header: t`Cliente`,
        cell: ({ row }) => (
          <span className="text-sm">{clientNameFor(clientOptions, row.original.clientId)}</span>
        ),
      },
      {
        accessorKey: 'country',
        header: t`País`,
      },
      {
        accessorKey: 'kycStatus',
        header: t`KYC`,
        cell: ({ row }) => (
          <StatePillChip
            status={row.original.kycStatus}
            variant="documentation"
            label={kycStatusLabel(row.original.kycStatus)}
          />
        ),
      },
      {
        accessorKey: 'customerStatus',
        header: t`Estado`,
        cell: ({ row }) => <StatePillChip status={row.original.customerStatus} variant="company" />,
      },
      {
        accessorKey: 'createdAt',
        header: t`Creado`,
        cell: ({ row }) => formatOpsDateTime(row.original.createdAt),
      },
    ],
    [t, clientOptions]
  );

  return (
    <div className="p-6 space-y-8">
      <PageHeader title={t`Customer 360`} subtitle={t`Gestión integral de clientes`} />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          <Trans>Clientes</Trans>
        </h2>
        <DataTable
          columns={columns}
          data={customers}
          isLoading={isLoading}
          onRowClick={(customer) => setSelectedCustomer(customer)}
          minWidth="1200px"
          emptyMessage={t`No hay clientes para estos filtros`}
          toolbar={
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer-search">
                  <Trans>Buscar cliente</Trans>
                </Label>
                <Input
                  id="customer-search"
                  placeholder={t`Nombre, razón social o email`}
                  value={emailSearch}
                  onChange={(event) => setEmailSearch(event.target.value)}
                  className="w-72"
                />
              </div>
              <ClientFilterSelect
                id="customer-client-filter"
                value={clientIdFilter}
                onChange={setClientIdFilter}
              />
              <div className="space-y-2">
                <Label htmlFor="customer-kyc-filter">
                  <Trans>KYC</Trans>
                </Label>
                <Select
                  value={kycStatusFilter ?? ALL_VALUE}
                  onValueChange={(value) =>
                    setKycStatusFilter(value === ALL_VALUE ? null : (value as AdminClientKycStatus))
                  }
                >
                  <SelectTrigger id="customer-kyc-filter" className="w-52">
                    <SelectValue placeholder={t`Todos`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>{t`Todos`}</SelectItem>
                    {KYC_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {kycStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-status-filter">
                  <Trans>Estado</Trans>
                </Label>
                <Select
                  value={customerStatusFilter ?? ALL_VALUE}
                  onValueChange={(value) =>
                    setCustomerStatusFilter(
                      value === ALL_VALUE ? null : (value as AdminLoopayCustomerStatus)
                    )
                  }
                >
                  <SelectTrigger id="customer-status-filter" className="w-52">
                    <SelectValue placeholder={t`Todos`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>{t`Todos`}</SelectItem>
                    {CUSTOMER_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {StatePillChipStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          }
        />
      </section>

      <Dialog
        open={selectedCustomer !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCustomer(null);
            setAddWalletOpen(false);
            setRequestVaOpen(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {formatCustomerName(
                    selectedCustomer.firstName,
                    selectedCustomer.lastName,
                    selectedCustomer.email
                  )}
                </DialogTitle>
                <DialogDescription>{selectedCustomer.email}</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    <Trans>País</Trans>
                  </Label>
                  <p className="text-sm">{selectedCustomer.country}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    <Trans>Tax ID</Trans>
                  </Label>
                  <p className="text-sm font-mono">{selectedCustomer.taxId}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    <Trans>KYC</Trans>
                  </Label>
                  <StatePillChip
                    label={kycStatusLabel(selectedCustomer.kycStatus)}
                    status={selectedCustomer.kycStatus}
                    variant="documentation"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    <Trans>Estado</Trans>
                  </Label>
                  <StatePillChip status={selectedCustomer.customerStatus} variant="company" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    <Trans>Cliente</Trans>
                  </Label>
                  <p className="text-sm">
                    {clientNameFor(clientOptions, selectedCustomer.clientId)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    <Trans>Creado</Trans>
                  </Label>
                  <p className="text-sm">{formatOpsDateTime(selectedCustomer.createdAt)}</p>
                </div>
              </div>

              {requestVa.visible ? (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-border">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold">
                      <Trans>Cuentas virtuales</Trans>
                    </h3>
                    {requestVa.blockedReason === 'kyc_not_approved' ? (
                      <p id="request-va-blocked-reason" className="text-xs text-muted-foreground">
                        <Trans>Requiere KYC aprobado</Trans>
                      </p>
                    ) : null}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7"
                    disabled={!requestVa.enabled}
                    aria-describedby={
                      requestVa.blockedReason ? 'request-va-blocked-reason' : undefined
                    }
                    onClick={() => setRequestVaOpen(true)}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    <Trans>Solicitar cuenta virtual</Trans>
                  </Button>
                </div>
              ) : null}

              {/* Open provider requirements of this customer (S21), for Comercial and Super admin. */}
              <CustomerRequirementsLink customerId={selectedCustomer.id} />

              {/* #415: read-only view of the client app, super admin and commercial. */}
              {canViewAs ? (
                <ViewAsCustomerButton
                  customerId={selectedCustomer.id}
                  customerLabel={formatCustomerName(
                    selectedCustomer.firstName,
                    selectedCustomer.lastName,
                    selectedCustomer.email
                  )}
                />
              ) : null}

              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">
                      <Trans>Billeteras</Trans>
                    </h3>
                  </div>
                  {addWallet.visible ? (
                    <div className="flex flex-col items-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7"
                        disabled={!addWallet.enabled}
                        aria-describedby={
                          addWallet.blockedReason ? 'add-wallet-blocked-reason' : undefined
                        }
                        onClick={() => setAddWalletOpen(true)}
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        <Trans>Agregar billetera</Trans>
                      </Button>
                      {addWallet.blockedReason === 'kyc_not_approved' ? (
                        <p id="add-wallet-blocked-reason" className="text-xs text-muted-foreground">
                          <Trans>Requiere KYC aprobado</Trans>
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                {walletsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <Trans>Cargando billeteras...</Trans>
                  </div>
                ) : wallets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    <Trans>Sin billeteras</Trans>
                  </p>
                ) : (
                  <div className="space-y-2">
                    {wallets.map((wallet) => (
                      <div
                        key={wallet.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{wallet.currency}</span>
                            {wallet.chain && (
                              <span className="text-xs text-muted-foreground">{wallet.chain}</span>
                            )}
                          </div>
                          <span className="text-xs font-mono text-muted-foreground">
                            {wallet.address ?? EMPTY_CELL}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono tabular-nums">
                            {formatFiat(wallet.balance, wallet.currency)}
                          </span>
                          <StatePillChip status={wallet.status} variant="payin" />
                          {canManageStatus ? (
                            <div className="flex gap-1">
                              {wallet.status === 'ACTIVE' ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7"
                                    disabled={updateWallet.isPending}
                                    onClick={() =>
                                      setPendingWalletChange({
                                        walletId: wallet.id,
                                        label: `${wallet.currency}${wallet.chain ? ` · ${wallet.chain}` : ''}`,
                                        nextStatus: 'SUSPENDED',
                                      })
                                    }
                                  >
                                    <Trans>Suspender</Trans>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-7"
                                    disabled={updateWallet.isPending}
                                    onClick={() =>
                                      setPendingWalletChange({
                                        walletId: wallet.id,
                                        label: `${wallet.currency}${wallet.chain ? ` · ${wallet.chain}` : ''}`,
                                        nextStatus: 'CLOSED',
                                      })
                                    }
                                  >
                                    <Trans>Cerrar</Trans>
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  className="h-7"
                                  disabled={updateWallet.isPending}
                                  onClick={() =>
                                    setPendingWalletChange({
                                      walletId: wallet.id,
                                      label: `${wallet.currency}${wallet.chain ? ` · ${wallet.chain}` : ''}`,
                                      nextStatus: 'ACTIVE',
                                    })
                                  }
                                >
                                  {wallet.status === 'CLOSED' ? (
                                    <Trans>Reabrir</Trans>
                                  ) : (
                                    <Trans>Activar</Trans>
                                  )}
                                </Button>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedCustomer.customerStatus === 'OFFBOARDED' ? (
                <p className="pt-4 text-sm text-muted-foreground border-t border-border">
                  <Trans>
                    Cliente offboarded: el estado es terminal y solo puede reactivarse completando
                    KYC de nuevo.
                  </Trans>
                </p>
              ) : canManageStatus ? (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  {UPDATABLE_STATUSES.filter(
                    (status) => status !== selectedCustomer.customerStatus
                  ).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={statusActionVariant(status)}
                      disabled={updateCustomerStatus.isPending}
                      onClick={() =>
                        setPendingStatusChange({
                          customer: selectedCustomer,
                          nextStatus: status,
                        })
                      }
                    >
                      {statusActionLabel(status)}
                    </Button>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </DialogContent>
      </Dialog>

      {selectedCustomer ? (
        <RequestVirtualAccountDialog
          open={requestVaOpen}
          onOpenChange={setRequestVaOpen}
          customerId={selectedCustomer.id}
          customerLabel={formatCustomerName(
            selectedCustomer.firstName,
            selectedCustomer.lastName,
            selectedCustomer.email
          )}
        />
      ) : null}

      {selectedCustomer ? (
        <AddWalletDialog
          open={addWalletOpen}
          onOpenChange={setAddWalletOpen}
          clientId={selectedCustomer.clientId}
          customerId={selectedCustomer.id}
          customerLabel={formatCustomerName(
            selectedCustomer.firstName,
            selectedCustomer.lastName,
            selectedCustomer.email
          )}
          existingChains={wallets.map((wallet) => wallet.chain)}
        />
      ) : null}

      <StateChangeConfirmationModal
        open={pendingStatusChange !== null}
        onClose={() => setPendingStatusChange(null)}
        onConfirm={(reason) => {
          if (!pendingStatusChange) return;
          updateCustomerStatus.mutate({
            customerId: pendingStatusChange.customer.id,
            input: {
              status: pendingStatusChange.nextStatus,
              reason: reason.trim() || undefined,
            },
          });
        }}
        selectedCount={1}
        fromState={pendingStatusChange?.customer.customerStatus ?? ''}
        toState={pendingStatusChange?.nextStatus ?? ''}
        entityType="ops"
        entityLabel={t`cliente`}
        entityLabelPlural={t`clientes`}
        entitySummary={[
          {
            label: t`Nombre`,
            value: formatCustomerName(
              pendingStatusChange?.customer.firstName,
              pendingStatusChange?.customer.lastName,
              pendingStatusChange?.customer.email ?? ''
            ),
          },
          {
            label: t`Email`,
            value: pendingStatusChange?.customer.email ?? '',
          },
        ]}
        loading={updateCustomerStatus.isPending}
      />

      <ToggleConfirmationDialog
        open={pendingWalletChange !== null}
        onClose={() => setPendingWalletChange(null)}
        onConfirm={() => {
          if (!pendingWalletChange) return;
          updateWallet.mutate({
            id: pendingWalletChange.walletId,
            input: { status: pendingWalletChange.nextStatus },
          });
        }}
        entityType={t`billetera`}
        entityName={pendingWalletChange?.label ?? ''}
        action={
          pendingWalletChange?.nextStatus === 'ACTIVE'
            ? 'activate'
            : pendingWalletChange?.nextStatus === 'CLOSED'
              ? 'close'
              : 'deactivate'
        }
        loading={updateWallet.isPending}
      />
    </div>
  );
}
