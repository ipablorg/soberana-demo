/**
 * `/backoffice/clients` — client (tenant) management.
 *
 * Lists tenants via `adminLoopay_listClients`, supports name search and status
 * filtering, and exposes a detail drawer with status actions (suspend /
 * activate / revoke) and API-key regeneration / revocation.
 */

import { useMemo, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';

import type { AdminClientEntity, AdminClientStatus } from '@/graphql/types/admin-loopay';
import { DataTable } from '@/shared/components/common/DataTable';
import { PageHeader } from '@/shared/components/common/PageHeader';
import {
  StatePillChip,
  StatePillChipStatusLabel,
} from '@/shared/components/backoffice/StatePillChip';
import { ToggleConfirmationDialog } from '@/shared/components/backoffice/toggle-confirmation-dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import { OptionSelect } from '../../../components/option-select';
import { useCountryIso3Options } from '../../../lib/country-options';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Loader2, Plus } from '@/shared/components/animated-icons';
import { useAuthStore } from '@/shared/stores/auth-store';

import {
  useCreateClient,
  useClients,
  useTaxIdTypes,
  useRevokeClientApiKey,
  useUpdateClient,
} from '../hooks/use-clients';
import { ApiKeyPanel } from '../components/api-key-panel';
import {
  canManageClients,
  canReadClients,
  taxIdTypeLabel,
  taxIdTypeOptions,
} from '../lib/clients-logic';
import {
  formatJsonBlock,
  formatOpsDateTime,
  formatOpsText,
} from '../../ops-review/lib/ops-formatting';

const CLIENT_STATUSES = ['ACTIVE', 'SUSPENDED', 'REVOKED'] as const;

const EMPTY_CREATE_FORM = {
  name: '',
  email: '',
  taxId: '',
  taxIdTypeId: '',
  country: '',
  status: 'ACTIVE' as AdminClientStatus,
};

export default function ClientsList() {
  const { t } = useLingui();
  const countryOptions = useCountryIso3Options();

  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminClientStatus | null>(null);
  const [selectedClient, setSelectedClient] = useState<AdminClientEntity | null>(null);
  const [pendingToggle, setPendingToggle] = useState<{
    client: AdminClientEntity;
    nextStatus: AdminClientStatus;
  } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);

  const where = useMemo(
    () => ({
      ...(searchFilter.trim() && {
        name: { contains: searchFilter.trim() },
      }),
      ...(statusFilter && { status: statusFilter }),
    }),
    [searchFilter, statusFilter]
  );

  const staffRoles = useAuthStore((state) => state.user?.staff_roles);
  const canManage = canManageClients(staffRoles);
  // #411: commercial reads the list (read-only); a row opens its Setup screen.
  const canRead = canReadClients(staffRoles);
  const navigate = useNavigate();

  // Roles the backend refuses (e.g. LOOPAY_OPERATIONS): do not fire the query.
  const { data, isLoading } = useClients(where, canRead);
  const { data: taxIdTypesData } = useTaxIdTypes();
  const taxIdTypes = taxIdTypesData?.adminLoopay_listTaxIdTypes ?? [];

  const createClient = useCreateClient((result) => {
    setCreateOpen(false);
    setCreateForm(EMPTY_CREATE_FORM);
    setSelectedClient(result.adminLoopay_createClient);
  });

  const updateClient = useUpdateClient((result) => {
    setSelectedClient(result.adminLoopay_updateClient);
    setPendingToggle(null);
  });

  const revokeApiKey = useRevokeClientApiKey((result) => {
    setSelectedClient(result.adminLoopay_revokeClientApiKey);
  });

  const clients = data?.adminLoopay_listClients.data ?? [];

  const columns = useMemo<ColumnDef<AdminClientEntity>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t`Nombre`,
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: 'email',
        header: t`Email`,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.email}</span>
        ),
      },
      {
        accessorKey: 'country',
        header: t`País`,
      },
      {
        accessorKey: 'status',
        header: t`Estado`,
        cell: ({ row }) => <StatePillChip status={row.original.status} variant="company" />,
      },
      {
        accessorKey: 'kyc_status',
        header: t`KYC`,
        cell: ({ row }) => (
          <StatePillChip status={row.original.kyc_status} variant="documentation" />
        ),
      },
      {
        accessorKey: 'api_key_prefix',
        header: t`Identificador de API key`,
        cell: ({ row }) => (
          <span className="text-xs font-mono tabular-nums">
            {formatOpsText(row.original.api_key_prefix)}
          </span>
        ),
      },
      {
        accessorKey: 'created_at',
        header: t`Creado`,
        cell: ({ row }) => formatOpsDateTime(row.original.created_at),
      },
    ],
    [t]
  );

  const handleCreateSubmit = () => {
    if (
      !createForm.name.trim() ||
      !createForm.email.trim() ||
      !createForm.taxId.trim() ||
      !createForm.taxIdTypeId.trim() ||
      !createForm.country.trim()
    ) {
      return;
    }

    createClient.mutate({
      input: {
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        taxId: createForm.taxId.trim(),
        taxIdTypeId: createForm.taxIdTypeId.trim(),
        country: createForm.country.trim(),
        status: createForm.status,
      },
    });
  };

  const isCreateDisabled =
    !createForm.name.trim() ||
    !createForm.email.trim() ||
    !createForm.taxId.trim() ||
    !createForm.taxIdTypeId.trim() ||
    !createForm.country.trim();

  const configJson = selectedClient ? formatJsonBlock(selectedClient.config) : null;
  const metadataJson = selectedClient ? formatJsonBlock(selectedClient.metadata) : null;

  return (
    <div className="p-6 space-y-8">
      <PageHeader
        title={t`Clientes`}
        subtitle={t`Gestión de tenants y API keys`}
        actions={
          canManage ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              <Trans>Crear cliente</Trans>
            </Button>
          ) : undefined
        }
      />

      {!canManage ? (
        <p
          role="note"
          className="rounded-lg border border-border p-4 text-sm text-muted-foreground"
          data-testid="clients-restricted-notice"
        >
          <Trans>
            Solo lectura: abre un cliente para ver su configuración. El alta, los rieles, las
            tarifas y la API key se hacen desde Configuración y tarifas.
          </Trans>
        </p>
      ) : null}

      <section className="space-y-4" hidden={!canRead}>
        <h2 className="text-lg font-semibold">
          <Trans>Clientes</Trans>
        </h2>
        <DataTable
          columns={columns}
          data={clients}
          isLoading={isLoading}
          onRowClick={(client) =>
            canManage
              ? setSelectedClient(client)
              : navigate(`/backoffice/commercial/clients/${client.id}`)
          }
          minWidth="1200px"
          emptyMessage={t`No hay clientes para estos filtros`}
          toolbar={
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <Label htmlFor="client-search">
                  <Trans>Buscar por nombre</Trans>
                </Label>
                <Input
                  id="client-search"
                  value={searchFilter}
                  onChange={(event) => setSearchFilter(event.target.value)}
                  className="w-72"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant={statusFilter === null ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(null)}
                >
                  <Trans>Todos</Trans>
                </Button>
                {CLIENT_STATUSES.map((status) => (
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

      {/* Detail drawer */}
      <Dialog
        open={selectedClient !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedClient(null);
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          {selectedClient && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedClient.name}</DialogTitle>
                <DialogDescription>{selectedClient.email}</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    <Trans>País</Trans>
                  </Label>
                  <p className="text-sm">{selectedClient.country}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    <Trans>Tax ID</Trans>
                  </Label>
                  <p className="text-sm font-mono">{formatOpsText(selectedClient.tax_id)}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    <Trans>Tax ID tipo</Trans>
                  </Label>
                  <p className="text-sm font-mono">
                    {taxIdTypeLabel(selectedClient.tax_id_type_id, taxIdTypes)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    <Trans>Estado</Trans>
                  </Label>
                  <StatePillChip status={selectedClient.status} variant="company" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    <Trans>KYC</Trans>
                  </Label>
                  <StatePillChip status={selectedClient.kyc_status} variant="documentation" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    <Trans>Creado</Trans>
                  </Label>
                  <p className="text-sm">{formatOpsDateTime(selectedClient.created_at)}</p>
                </div>
              </div>

              {configJson && (
                <details className="rounded-lg border border-border p-3">
                  <summary className="cursor-pointer text-sm font-medium">
                    <Trans>Configuración</Trans>
                  </summary>
                  <pre className="mt-2 text-xs font-mono overflow-auto max-h-48">{configJson}</pre>
                </details>
              )}

              {metadataJson && (
                <details className="rounded-lg border border-border p-3">
                  <summary className="cursor-pointer text-sm font-medium">
                    <Trans>Metadata</Trans>
                  </summary>
                  <pre className="mt-2 text-xs font-mono overflow-auto max-h-48">
                    {metadataJson}
                  </pre>
                </details>
              )}

              {/* Status actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                {selectedClient.status === 'ACTIVE' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updateClient.isPending}
                      onClick={() =>
                        setPendingToggle({
                          client: selectedClient,
                          nextStatus: 'SUSPENDED',
                        })
                      }
                    >
                      <Trans>Suspender</Trans>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={updateClient.isPending}
                      onClick={() =>
                        setPendingToggle({
                          client: selectedClient,
                          nextStatus: 'REVOKED',
                        })
                      }
                    >
                      <Trans>Revocar</Trans>
                    </Button>
                  </>
                )}
                {selectedClient.status === 'SUSPENDED' && (
                  <>
                    <Button
                      size="sm"
                      disabled={updateClient.isPending}
                      onClick={() =>
                        setPendingToggle({
                          client: selectedClient,
                          nextStatus: 'ACTIVE',
                        })
                      }
                    >
                      <Trans>Activar</Trans>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={updateClient.isPending}
                      onClick={() =>
                        setPendingToggle({
                          client: selectedClient,
                          nextStatus: 'REVOKED',
                        })
                      }
                    >
                      <Trans>Revocar</Trans>
                    </Button>
                  </>
                )}
                {selectedClient.status === 'REVOKED' && (
                  <Button
                    size="sm"
                    disabled={updateClient.isPending}
                    onClick={() =>
                      setPendingToggle({
                        client: selectedClient,
                        nextStatus: 'ACTIVE',
                      })
                    }
                  >
                    <Trans>Activar</Trans>
                  </Button>
                )}
              </div>

              <ApiKeyPanel
                clientId={selectedClient.id}
                prefix={selectedClient.api_key_prefix}
                onRegenerated={(result) =>
                  setSelectedClient({
                    ...selectedClient,
                    api_key_prefix: result.adminLoopay_regenerateClientApiKey.api_key_prefix,
                  })
                }
                extraActions={
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={revokeApiKey.isPending}
                    onClick={() => revokeApiKey.mutate({ clientId: selectedClient.id })}
                  >
                    {revokeApiKey.isPending && (
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    )}
                    <Trans>Revocar key</Trans>
                  </Button>
                }
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Status toggle confirmation */}
      <ToggleConfirmationDialog
        open={pendingToggle !== null}
        onClose={() => setPendingToggle(null)}
        onConfirm={() => {
          if (!pendingToggle) return;
          updateClient.mutate({
            id: pendingToggle.client.id,
            input: { status: pendingToggle.nextStatus },
          });
        }}
        entityType={t`cliente`}
        entityName={pendingToggle?.client.name ?? ''}
        action={pendingToggle?.nextStatus === 'ACTIVE' ? 'activate' : 'deactivate'}
        loading={updateClient.isPending}
      />

      {/* Create client dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              <Trans>Crear cliente</Trans>
            </DialogTitle>
            <DialogDescription>
              <Trans>Registra un nuevo tenant en la plataforma.</Trans>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">
                <Trans>Nombre</Trans>
              </Label>
              <Input
                id="create-name"
                value={createForm.name}
                onChange={(event) => setCreateForm({ ...createForm, name: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">
                <Trans>Email</Trans>
              </Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-tax-id">
                  <Trans>Tax ID</Trans>
                </Label>
                <Input
                  id="create-tax-id"
                  value={createForm.taxId}
                  onChange={(event) => setCreateForm({ ...createForm, taxId: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-tax-id-type">
                  <Trans>Tax ID tipo</Trans>
                </Label>
                <OptionSelect
                  id="create-tax-id-type"
                  value={createForm.taxIdTypeId}
                  onChange={(value) => setCreateForm({ ...createForm, taxIdTypeId: value })}
                  options={taxIdTypeOptions(taxIdTypes)}
                  placeholder={t`Selecciona el tipo`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-country">
                <Trans>País</Trans>
              </Label>
              <OptionSelect
                id="create-country"
                value={createForm.country}
                onChange={(value) => setCreateForm({ ...createForm, country: value })}
                options={countryOptions}
                placeholder={t`Seleccione un país`}
              />
            </div>
            <div className="space-y-2">
              <Label>
                <Trans>Estado</Trans>
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                {CLIENT_STATUSES.map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={createForm.status === status ? 'default' : 'outline'}
                    onClick={() => setCreateForm({ ...createForm, status })}
                  >
                    {StatePillChipStatusLabel(status)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={createClient.isPending}
            >
              <Trans>Cancelar</Trans>
            </Button>
            <Button
              disabled={isCreateDisabled || createClient.isPending}
              onClick={handleCreateSubmit}
            >
              {createClient.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Trans>Crear</Trans>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
