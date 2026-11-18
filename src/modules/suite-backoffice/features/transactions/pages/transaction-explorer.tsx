/**
 * `/backoffice/transactions` — transaction explorer.
 *
 * Lists transactions via `adminLoopay_listTransactions`, supports reference
 * search plus type / status / client filters, and opens a detail dialog with
 * the full entity (wallet, customer, beneficiary, provider operations and
 * collapsible metadata). Exports the current page results to CSV.
 */

import { useMemo, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { ColumnDef } from '@tanstack/react-table';

import type { AdminTransactionEntity } from '@/graphql/types/admin-loopay';
import { DataTable } from '@/shared/components/common/DataTable';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { StatePillChip } from '@/shared/components/backoffice/StatePillChip';
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
import { Download } from '@/shared/components/animated-icons';
import { formatFiat } from '@/shared/lib/format-money';

import { useTransactions, useTransactionDetail } from '../hooks/use-transactions';
import { exportTransactionsCsv } from '../lib/export-transactions-csv';
import { ClientFilterSelect } from '../../ops-review/components/client-filter-select';
import {
  formatCustomerName,
  formatJsonBlock,
  formatOpsDateTime,
  formatOpsText,
} from '../../ops-review/lib/ops-formatting';

const TRANSACTION_TYPES = ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER'] as const;
const TRANSACTION_STATUSES = [
  'CREATED',
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
] as const;
const ALL_VALUE = 'ALL';

export default function TransactionExplorer() {
  const { t } = useLingui();

  const [referenceSearch, setReferenceSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const where = useMemo(
    () => ({
      ...(typeFilter && { type: typeFilter }),
      ...(statusFilter && { status: statusFilter }),
      ...(clientId && { clientId }),
    }),
    [typeFilter, statusFilter, clientId],
  );

  const { data, isLoading } = useTransactions(where);
  const { data: detailData, isLoading: detailLoading } =
    useTransactionDetail(selectedId);

  const allRows = data?.adminLoopay_listTransactions.data ?? [];
  const rows = useMemo(() => {
    const term = referenceSearch.trim().toLowerCase();
    if (!term) return allRows;
    return allRows.filter((tx) =>
      tx.referenceCode.toLowerCase().includes(term),
    );
  }, [allRows, referenceSearch]);

  const detail = detailData?.adminLoopay_getTransaction ?? null;
  const metadataJson = detail ? formatJsonBlock(detail.metadata) : null;

  const columns = useMemo<ColumnDef<AdminTransactionEntity>[]>(
    () => [
      {
        accessorKey: 'referenceCode',
        header: t`Referencia`,
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums">
            {row.original.referenceCode}
          </span>
        ),
      },
      {
        accessorKey: 'type',
        header: t`Tipo`,
      },
      {
        accessorKey: 'direction',
        header: t`Dirección`,
      },
      {
        accessorKey: 'status',
        header: t`Estado`,
        cell: ({ row }) => (
          <StatePillChip status={row.original.status} variant="payin" />
        ),
      },
      {
        accessorKey: 'amount',
        header: t`Monto`,
        cell: ({ row }) => (
          <span className="font-mono tabular-nums text-right">
            {formatFiat(row.original.amount, row.original.currency)}
          </span>
        ),
      },
      {
        id: 'customerEmail',
        header: t`Cliente`,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatOpsText(row.original.wallet?.customer?.email)}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: t`Creado`,
        cell: ({ row }) => formatOpsDateTime(row.original.createdAt),
      },
    ],
    [t],
  );

  return (
    <div className="p-6 space-y-8">
      <PageHeader
        title={t`Transacciones`}
        subtitle={t`Explorador de transacciones`}
        actions={
          <Button
            variant="outline"
            onClick={() => exportTransactionsCsv(rows)}
            disabled={rows.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            <Trans>Exportar CSV</Trans>
          </Button>
        }
      />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          <Trans>Transacciones</Trans>
        </h2>
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          onRowClick={(tx) => setSelectedId(tx.id)}
          minWidth="1200px"
          emptyMessage={t`No hay transacciones para estos filtros`}
          toolbar={
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <Label htmlFor="tx-reference-search">
                  <Trans>Buscar por referencia</Trans>
                </Label>
                <Input
                  id="tx-reference-search"
                  value={referenceSearch}
                  onChange={(event) => setReferenceSearch(event.target.value)}
                  className="w-72"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tx-type-filter">
                  <Trans>Tipo</Trans>
                </Label>
                <Select
                  value={typeFilter ?? ALL_VALUE}
                  onValueChange={(next) =>
                    setTypeFilter(next === ALL_VALUE ? null : next)
                  }
                >
                  <SelectTrigger id="tx-type-filter" className="w-44">
                    <SelectValue placeholder={t`Todos`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>{t`Todos`}</SelectItem>
                    {TRANSACTION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tx-status-filter">
                  <Trans>Estado</Trans>
                </Label>
                <Select
                  value={statusFilter ?? ALL_VALUE}
                  onValueChange={(next) =>
                    setStatusFilter(next === ALL_VALUE ? null : next)
                  }
                >
                  <SelectTrigger id="tx-status-filter" className="w-44">
                    <SelectValue placeholder={t`Todos`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>{t`Todos`}</SelectItem>
                    {TRANSACTION_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ClientFilterSelect
                id="tx-client-filter"
                value={clientId}
                onChange={setClientId}
              />
            </div>
          }
        />
      </section>

      <Dialog
        open={selectedId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto">
          {detailLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          )}
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="font-mono text-sm">
                  {detail.referenceCode}
                </DialogTitle>
                <DialogDescription>
                  {detail.type} · {detail.direction}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    <Trans>Estado</Trans>
                  </Label>
                  <StatePillChip status={detail.status} variant="payin" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    <Trans>Monto</Trans>
                  </Label>
                  <p className="text-sm font-mono tabular-nums">
                    {formatFiat(detail.amount, detail.currency)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    <Trans>Descripción</Trans>
                  </Label>
                  <p className="text-sm">{formatOpsText(detail.description)}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    <Trans>Creado</Trans>
                  </Label>
                  <p className="text-sm">
                    {formatOpsDateTime(detail.createdAt)}
                  </p>
                </div>
                {detail.completedAt && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      <Trans>Completado</Trans>
                    </Label>
                    <p className="text-sm">
                      {formatOpsDateTime(detail.completedAt)}
                    </p>
                  </div>
                )}
              </div>

              {detail.failureReason && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 space-y-1">
                  <Label className="text-xs text-destructive">
                    <Trans>Motivo de fallo</Trans>
                  </Label>
                  <p className="text-sm">{detail.failureReason}</p>
                </div>
              )}

              {detail.wallet && (
                <div className="space-y-2 pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold">
                    <Trans>Billetera</Trans>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        <Trans>Chain</Trans>
                      </Label>
                      <p className="text-sm font-mono">
                        {formatOpsText(detail.wallet.chain)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        <Trans>Moneda</Trans>
                      </Label>
                      <p className="text-sm">{detail.wallet.currency}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        <Trans>Dirección</Trans>
                      </Label>
                      <p className="text-sm font-mono break-all">
                        {formatOpsText(detail.wallet.address)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        <Trans>Balance</Trans>
                      </Label>
                      <p className="text-sm font-mono tabular-nums">
                        {formatFiat(
                          detail.wallet.cachedBalance,
                          detail.wallet.currency,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {detail.wallet?.customer && (
                <div className="space-y-2 pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold">
                    <Trans>Cliente</Trans>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        <Trans>Nombre</Trans>
                      </Label>
                      <p className="text-sm">
                        {formatCustomerName(
                          detail.wallet.customer.firstName,
                          detail.wallet.customer.lastName,
                          detail.wallet.customer.email,
                        )}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        <Trans>Email</Trans>
                      </Label>
                      <p className="text-sm">{detail.wallet.customer.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {detail.beneficiary && (
                <div className="space-y-2 pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold">
                    <Trans>Beneficiario</Trans>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        <Trans>Estado</Trans>
                      </Label>
                      <p className="text-sm">
                        {formatOpsText(detail.beneficiary.status)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        <Trans>Rail</Trans>
                      </Label>
                      <p className="text-sm font-mono">
                        {formatOpsText(detail.beneficiary.railCode)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {detail.providerOperations.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold">
                    <Trans>Operaciones del proveedor</Trans>
                  </h3>
                  <div className="space-y-2">
                    {detail.providerOperations.map((op) => (
                      <div
                        key={op.id}
                        className="rounded-lg border border-border p-3 text-sm space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs">
                            {formatOpsText(op.externalId)}
                          </span>
                          <StatePillChip
                            status={op.status}
                            variant="payin"
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatOpsText(op.operationType)}</span>
                          <span>{formatOpsDateTime(op.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
