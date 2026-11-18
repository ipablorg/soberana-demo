/**
 * `/backoffice/virtual-accounts` — VA requests, accounts and wallet ops.
 *
 * Sections: the open requests (with the S22 repair of a blocked request and
 * the link to its S21 provider requirements), the full VA list
 * (`adminLoopay_listVirtualAccounts`, legacy camelCase entity), the
 * provider-linked subset (`adminLoopay_listProviderLinkedAccounts`, snake_case
 * entity), and the manual wallet operations panel. There is no free-standing
 * provider account link: linking by hand only repairs a blocked request.
 */

import { useMemo, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { ColumnDef } from '@tanstack/react-table';

import type {
  AdminProviderLinkedAccount,
  AdminVirtualAccount,
  AdminVirtualAccountStatus,
} from '@/graphql/types/admin-loopay';
import type { AdminCustomerSearchItem } from '@/graphql/queries/admin-loopay';
import type { AdminOnboardingMissingField } from '@/graphql/mutations/admin-loopay';
import { DataTable } from '@/shared/components/common/DataTable';
import { PageHeader } from '@/shared/components/common/PageHeader';
import {
  StatePillChip,
  StatePillChipStatusLabel,
} from '@/shared/components/backoffice/StatePillChip';
import { ToggleConfirmationDialog } from '@/shared/components/backoffice/toggle-confirmation-dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { railCodeLabel } from '@/shared/lib/rail-provider-labels';
import { OPERATIONS_ROLE, canOperateMoney, hasAnyExactStaffRole } from '@/shared/lib/staff-roles';
import {
  PROVIDER_REQUIREMENTS_ROUTE,
  canAccessBackofficeRoute,
} from '@/shared/config/backoffice-modes.config';
import { useAuthStore } from '@/shared/stores/auth-store';

import { OptionSelect } from '../../../components/option-select';
import { CollapsibleItemList } from '../../../components/collapsible-item-list';
import { CompleteProviderProfileDialog } from '../../compliance-review/components/complete-provider-profile-dialog';
import { useRetryEndorsementOnboarding } from '../../compliance-review/hooks/use-provider-onboarding-retry';
import { useProviderOptions } from '../../platform-config/hooks/use-catalog-options';
import { useProviderRequirementsQueue } from '../../provider-requirements/hooks/use-provider-requirements';
import { RequirementsPendingLink } from '../../provider-requirements/components/customer-requirements-link';
import {
  OPEN_REQUIREMENT_STATUSES,
  openCountByEndorsement,
} from '../../provider-requirements/lib/provider-requirement-rows';
import {
  RepairVirtualAccountDialog,
  type RepairableRequest,
} from '../components/repair-virtual-account-dialog';
import { WalletOpsPanel } from '../components/wallet-ops-panel';
import {
  useProviderLinkedAccounts,
  useUpdateVirtualAccount,
  useVirtualAccountRequests,
  useVirtualAccounts,
} from '../hooks/use-virtual-accounts';
import {
  describeVirtualAccountRequest,
  type VirtualAccountRequestRow,
} from '../lib/virtual-account-requests';
import { CustomerPicker } from '../../ops-review/components/customer-picker';
import { formatOpsDateTime, formatOpsText } from '../../ops-review/lib/ops-formatting';

/** `VirtualAccountStatus` on the backend. */
const VA_STATUSES = ['PENDING', 'ACTIVE', 'SUSPENDED', 'CLOSED', 'FAILED'] as const;

const NO_STAFF_ROLES: readonly string[] = [];

export default function VirtualAccounts() {
  const { t } = useLingui();
  const providerOptions = useProviderOptions();
  // #411: operations retries, repairs and runs the wallet operations
  // (repairVirtualAccountRequest is a LOOPAY_OPERATIONS gate); commercial reads.
  const staffRoles = useAuthStore((state) => state.user?.staff_roles ?? NO_STAFF_ROLES);
  const canOperate = canOperateMoney(staffRoles);
  const canRepair = hasAnyExactStaffRole(staffRoles, [OPERATIONS_ROLE]);
  const seesRequirements = canAccessBackofficeRoute(PROVIDER_REQUIREMENTS_ROUTE, staffRoles);
  const [repairing, setRepairing] = useState<RepairableRequest | null>(null);
  const { data: requirementsData } = useProviderRequirementsQueue(
    { filter: { status: [...OPEN_REQUIREMENT_STATUSES] }, page: 1, pageSize: 100 },
    { enabled: seesRequirements }
  );
  const openRequirements = useMemo(
    () =>
      openCountByEndorsement(requirementsData?.adminLoopay_listProviderRequirements.items ?? []),
    [requirementsData]
  );

  const [customer, setCustomer] = useState<AdminCustomerSearchItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [providerFilter, setProviderFilter] = useState('');

  const where = useMemo(
    () => ({
      ...(customer && { customerId: { equals: customer.id } }),
      ...(statusFilter ? { status: [statusFilter] } : {}),
    }),
    [customer, statusFilter]
  );

  const linkedVariables = useMemo(
    () => ({
      ...(customer && { customerId: customer.id }),
      ...(providerFilter.trim() && { providerCode: providerFilter.trim() }),
    }),
    [customer, providerFilter]
  );

  const { data: accountsData, isLoading } = useVirtualAccounts(where);
  const { data: linkedData, isLoading: isLinkedLoading } =
    useProviderLinkedAccounts(linkedVariables);
  const updateVirtualAccount = useUpdateVirtualAccount();
  const { data: requestsData, isLoading: isRequestsLoading } = useVirtualAccountRequests();

  // A retried request whose provider still reports missing customer data.
  const [completing, setCompleting] = useState<{
    endorsementId: string;
    customerId: string;
    missingFields: string[];
    missingFieldDetails: AdminOnboardingMissingField[];
  } | null>(null);
  const [retrying, setRetrying] = useState<VirtualAccountRequestRow | null>(null);
  const retryOnboarding = useRetryEndorsementOnboarding((result) => {
    const onboarding = result.adminLoopay_retryEndorsementOnboarding;
    if (retrying && onboarding.missing_fields.length > 0) {
      setCompleting({
        endorsementId: retrying.id,
        customerId: retrying.customerId,
        missingFields: onboarding.missing_fields,
        missingFieldDetails: onboarding.missing_field_details ?? [],
      });
    }
    setRetrying(null);
  });

  const [pendingToggle, setPendingToggle] = useState<{
    id: string;
    railCode: string;
    nextStatus: AdminVirtualAccountStatus;
  } | null>(null);

  const accounts = accountsData?.adminLoopay_listVirtualAccounts.data ?? [];
  const linkedAccounts = linkedData?.adminLoopay_listProviderLinkedAccounts.data ?? [];

  const requestRows = useMemo(
    () =>
      (requestsData?.adminLoopay_listVirtualAccountRequests.data ?? []).map((request) =>
        describeVirtualAccountRequest(request, (d) => t(d))
      ),
    [requestsData, t]
  );

  const requestColumns = useMemo<ColumnDef<VirtualAccountRequestRow>[]>(
    () => [
      {
        accessorKey: 'tenant',
        header: t`Cliente`,
        cell: ({ row }) => (
          <div className="flex min-w-[180px] flex-col">
            <span className="font-medium">{row.original.tenant}</span>
            <span className="text-xs text-muted-foreground break-all">
              {row.original.customerEmail}
            </span>
          </div>
        ),
      },
      { accessorKey: 'railLabel', header: t`Riel` },
      { accessorKey: 'providerLabel', header: t`Proveedor` },
      {
        accessorKey: 'stateLabel',
        header: t`Estado`,
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <span>{row.original.stateLabel}</span>
            {row.original.repairLine ? (
              <span className="max-w-[320px] text-xs text-muted-foreground">
                {row.original.repairLine}
              </span>
            ) : null}
          </div>
        ),
      },
      {
        id: 'blockers',
        header: t`Pendientes`,
        cell: ({ row }) =>
          row.original.blockerLines.length === 0 ? (
            '—'
          ) : (
            // Long provider checklists (KiraFin asks ~46 items) collapse (NF-6).
            <div className="max-w-[320px]">
              <CollapsibleItemList items={row.original.blockerLines} />
            </div>
          ),
      },
      {
        id: 'requirements',
        header: t`Requerimientos`,
        cell: ({ row }) => {
          const open = openRequirements.get(row.original.id) ?? 0;
          return open === 0 ? (
            '—'
          ) : (
            <RequirementsPendingLink customerId={row.original.customerId} count={open} />
          );
        },
      },
      {
        accessorKey: 'requestedAt',
        header: t`Solicitada`,
        cell: ({ row }) => formatOpsDateTime(row.original.requestedAt),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-2">
            {canOperate && row.original.canRetryProvider ? (
              <Button
                size="sm"
                variant="outline"
                disabled={retryOnboarding.isPending}
                onClick={() => {
                  setRetrying(row.original);
                  retryOnboarding.mutate({ endorsementId: row.original.id });
                }}
              >
                <Trans>Reintentar alta en el proveedor</Trans>
              </Button>
            ) : null}
            {canRepair && row.original.canRepair ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setRepairing({
                    endorsementId: row.original.id,
                    railCode: row.original.railCode,
                    railLabel: row.original.railLabel,
                    providerLabel: row.original.providerLabel,
                    customerEmail: row.original.customerEmail,
                  })
                }
              >
                <Trans>Reparar con cuenta del proveedor</Trans>
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [t, retryOnboarding, canOperate, canRepair, openRequirements]
  );

  const accountColumns = useMemo<ColumnDef<AdminVirtualAccount>[]>(
    () => [
      {
        accessorKey: 'railCode',
        header: t`Riel`,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{railCodeLabel(row.original.railCode)}</span>
            <span className="text-xs text-muted-foreground">{row.original.currency}</span>
          </div>
        ),
      },
      {
        accessorKey: 'customerId',
        header: t`Cliente`,
        cell: ({ row }) => <span className="text-xs break-all">{row.original.customerId}</span>,
      },
      {
        accessorKey: 'providerAccountId',
        header: t`Cuenta en el proveedor`,
        cell: ({ row }) => (
          <span className="text-xs break-all">{formatOpsText(row.original.providerAccountId)}</span>
        ),
      },
      {
        accessorKey: 'alias',
        header: t`Alias`,
        cell: ({ row }) => formatOpsText(row.original.alias),
      },
      {
        accessorKey: 'status',
        header: t`Estado`,
        cell: ({ row }) => <StatePillChip status={row.original.status} variant="payin" />,
      },
      {
        accessorKey: 'createdAt',
        header: t`Creada`,
        cell: ({ row }) => formatOpsDateTime(row.original.createdAt),
      },
      {
        id: 'actions',
        header: t`Acciones`,
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <div className="flex flex-wrap gap-2">
              {!canOperate ? null : status === 'ACTIVE' ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updateVirtualAccount.isPending}
                    onClick={() =>
                      setPendingToggle({
                        id: row.original.id,
                        railCode: row.original.railCode,
                        nextStatus: 'SUSPENDED',
                      })
                    }
                  >
                    <Trans>Suspender</Trans>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={updateVirtualAccount.isPending}
                    onClick={() =>
                      setPendingToggle({
                        id: row.original.id,
                        railCode: row.original.railCode,
                        nextStatus: 'CLOSED',
                      })
                    }
                  >
                    <Trans>Cerrar</Trans>
                  </Button>
                </>
              ) : status === 'SUSPENDED' ? (
                <Button
                  size="sm"
                  disabled={updateVirtualAccount.isPending}
                  onClick={() =>
                    setPendingToggle({
                      id: row.original.id,
                      railCode: row.original.railCode,
                      nextStatus: 'ACTIVE',
                    })
                  }
                >
                  <Trans>Activar</Trans>
                </Button>
              ) : null}
            </div>
          );
        },
      },
    ],
    [t, updateVirtualAccount, canOperate]
  );

  const linkedColumns = useMemo<ColumnDef<AdminProviderLinkedAccount>[]>(
    () => [
      {
        accessorKey: 'customer_email',
        header: t`Cliente`,
        cell: ({ row }) => <span className="font-medium">{row.original.customer_email}</span>,
      },
      {
        accessorKey: 'provider_code',
        header: t`Proveedor`,
      },
      {
        accessorKey: 'provider_account_id',
        header: t`Cuenta en el proveedor`,
        cell: ({ row }) => (
          <span className="text-xs break-all">
            {formatOpsText(row.original.provider_account_id)}
          </span>
        ),
      },
      {
        accessorKey: 'rail_code',
        header: t`Riel`,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span>{row.original.rail_code}</span>
            <span className="text-xs text-muted-foreground">{row.original.currency}</span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: t`Estado`,
        cell: ({ row }) => <StatePillChip status={row.original.status} variant="payin" />,
      },
      {
        accessorKey: 'linked_at',
        header: t`Vinculada`,
        cell: ({ row }) => formatOpsDateTime(row.original.linked_at),
      },
    ],
    [t]
  );

  return (
    <div className="p-6 space-y-8">
      <PageHeader
        title={t`Cuentas virtuales`}
        subtitle={t`Solicitudes, cuentas virtuales y operaciones de billetera.`}
      />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          <Trans>Solicitudes en curso</Trans>
        </h2>
        <DataTable
          columns={requestColumns}
          data={requestRows}
          isLoading={isRequestsLoading}
          minWidth="900px"
          emptyMessage={t`No hay solicitudes de cuenta virtual en curso`}
        />
      </section>

      {repairing ? (
        <RepairVirtualAccountDialog
          key={repairing.endorsementId}
          request={repairing}
          onClose={() => setRepairing(null)}
        />
      ) : null}

      {completing ? (
        <CompleteProviderProfileDialog
          key={completing.missingFields.join(',')}
          endorsementId={completing.endorsementId}
          customerId={completing.customerId}
          missingFields={completing.missingFields}
          missingFieldDetails={completing.missingFieldDetails}
          onClose={() => setCompleting(null)}
          onRetried={(onboarding) => {
            // The provider still asks for data: reopen with what is left.
            if (onboarding.missing_fields.length > 0) {
              setCompleting({
                ...completing,
                missingFields: onboarding.missing_fields,
                missingFieldDetails: onboarding.missing_field_details ?? [],
              });
            }
          }}
        />
      ) : null}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          <Trans>Cuentas virtuales</Trans>
        </h2>
        <DataTable
          columns={accountColumns}
          data={accounts}
          isLoading={isLoading}
          minWidth="1100px"
          emptyMessage={t`No hay cuentas virtuales para estos filtros`}
          toolbar={
            <div className="flex flex-wrap items-end gap-4">
              <CustomerPicker
                id="va-customer-filter"
                selected={customer}
                onSelect={setCustomer}
                onClear={() => setCustomer(null)}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant={statusFilter === null ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(null)}
                >
                  <Trans>Todos</Trans>
                </Button>
                {VA_STATUSES.map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={statusFilter === status ? 'default' : 'outline'}
                    onClick={() => setStatusFilter(status)}
                  >
                    {StatePillChipStatusLabel(status)}
                  </Button>
                ))}
              </div>
            </div>
          }
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          <Trans>Cuentas vinculadas a un proveedor</Trans>
        </h2>
        <DataTable
          columns={linkedColumns}
          data={linkedAccounts}
          isLoading={isLinkedLoading}
          minWidth="1000px"
          emptyMessage={t`No hay cuentas vinculadas para estos filtros`}
          toolbar={
            <div className="space-y-2">
              <Label htmlFor="linked-provider-filter">
                <Trans>Código de proveedor</Trans>
              </Label>
              <OptionSelect
                id="linked-provider-filter"
                value={providerFilter}
                onChange={setProviderFilter}
                options={providerOptions}
                placeholder={t`Todos los proveedores`}
                emptyLabel={t`Todos los proveedores`}
                className="w-56"
              />
            </div>
          }
        />
      </section>

      {canOperate ? <WalletOpsPanel /> : null}

      <ToggleConfirmationDialog
        open={pendingToggle !== null}
        onClose={() => setPendingToggle(null)}
        onConfirm={() => {
          if (!pendingToggle) return;
          updateVirtualAccount.mutate({
            id: pendingToggle.id,
            input: { status: pendingToggle.nextStatus },
          });
          setPendingToggle(null);
        }}
        entityType={t`cuenta virtual`}
        entityName={pendingToggle?.railCode ?? ''}
        scope="customer"
        action={
          pendingToggle?.nextStatus === 'ACTIVE'
            ? 'activate'
            : pendingToggle?.nextStatus === 'CLOSED'
              ? 'close'
              : 'deactivate'
        }
        loading={updateVirtualAccount.isPending}
      />
    </div>
  );
}
