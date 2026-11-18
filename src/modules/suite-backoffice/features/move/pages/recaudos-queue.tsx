/**
 * `/backoffice/move/recaudos` — manual inbound-deposit queue.
 *
 * Lists deposits (`adminLoopay_listPendingRecaudos`, pending by default and
 * filterable by status) and records the decision through approve / reject /
 * reverse. Reversal is only offered on already-credited deposits, because the
 * backend guards it with `status = COMPLETED`, and it moves the deposit to
 * `FAILED`.
 *
 * Filters follow the shadcn "Data Table" pattern: a global search, a toolbar
 * and the column-header titles edit one filter state and apply on change.
 */

import { useCallback, useMemo, useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import type { ColumnDef } from '@tanstack/react-table';

import type { AdminRecaudo, RecaudoStatusFilter } from '@/graphql/types/admin-loopay';
import { DataTable } from '@/shared/components/common/DataTable';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { StateChangeConfirmationModal } from '@/shared/components/backoffice/StateChangeConfirmationModal';
import { StatePillChip } from '@/shared/components/backoffice/StatePillChip';
import { formatFiat } from '@/shared/lib/format-money';
import { truncateMiddle } from '@/shared/lib/truncate-middle';
import { useCanOperateMoney } from '@/shared/hooks/use-can-operate-money';

import { CreateRecaudoForm } from '../components/create-recaudo-form';
import { PendingCountBadge } from '../components/pending-count-badge';
import { RecaudoColumnHeader } from '../components/recaudo-column-header';
import {
  RecaudoClientFacet,
  RecaudoCurrencyFacet,
  RecaudoProviderFacet,
  RecaudoStatusFacet,
} from '../components/recaudo-facets';
import { RecaudoFilterToolbar } from '../components/recaudo-filter-toolbar';
import { RecaudoRowActions } from '../components/recaudo-row-actions';
import { useProviderSuggestions } from '../hooks/use-provider-suggestions';
import { useRecaudoFilters } from '../hooks/use-recaudo-filters';
import { useRecaudoStatusLabels } from '../hooks/use-recaudo-status-labels';
import { recaudoSourceLabel } from '../../ops-review/lib/ops-value-labels';
import {
  useApproveRecaudo,
  usePendingRecaudos,
  useRejectRecaudo,
  useReverseRecaudo,
} from '../hooks/use-recaudos-queue';
import {
  buildApproveRecaudoInput,
  buildRejectRecaudoInput,
  buildReverseRecaudoInput,
  isRecaudoReasonRequired,
  recaudoActionTargetStatus,
  type RecaudoAction,
} from '../lib/recaudo-actions';
import { hasCustomRecaudoStatuses, resolveRecaudoCountKind } from '../lib/recaudo-filters';
import { recaudoStatusBadgeVariant, resolvePendingCount } from '../lib/recaudo-queue-view';
import { EMPTY_CELL, formatOpsDateTime, formatOpsText } from '../../ops-review/lib/ops-formatting';

interface PendingRecaudoAction {
  action: RecaudoAction;
  recaudo: AdminRecaudo;
}

export default function RecaudosQueue() {
  const { t } = useLingui();
  // #411: commercial reads this queue; only operations acts on it.
  const canOperate = useCanOperateMoney();

  const filters = useRecaudoFilters();
  const statusLabels = useRecaudoStatusLabels();
  const [pendingAction, setPendingAction] = useState<PendingRecaudoAction | null>(null);

  const { data, isLoading, isFetching, isPlaceholderData, isError } = usePendingRecaudos(
    filters.filter
  );
  const closeConfirmation = () => setPendingAction(null);

  const approveRecaudo = useApproveRecaudo(closeConfirmation);
  const rejectRecaudo = useRejectRecaudo(closeConfirmation);
  const reverseRecaudo = useReverseRecaudo(closeConfirmation);

  const isSubmitting =
    approveRecaudo.isPending || rejectRecaudo.isPending || reverseRecaudo.isPending;

  const queue = data?.adminLoopay_listPendingRecaudos;
  const rows = useMemo(() => queue?.data ?? [], [queue]);
  const providerSuggestions = useProviderSuggestions(rows);
  // While the previous filter's rows are still on screen its total is stale.
  const pendingCount = resolvePendingCount({
    isLoading: isLoading || Boolean(isPlaceholderData),
    total: queue?.total,
    rowsLength: rows.length,
    hasData: queue !== undefined,
  });
  const countKind = resolveRecaudoCountKind(filters.values.statuses);
  const isTruncated = Boolean(queue?.has_more);
  const shownCount = rows.length;
  const totalCount = queue?.total ?? rows.length;

  const searchTerm = filters.values.search;
  const emptyMessage = searchTerm
    ? hasCustomRecaudoStatuses(filters.values.statuses)
      ? t`Ningún depósito coincide con «${searchTerm}»`
      : t`Sin depósitos pendientes para «${searchTerm}». Amplía el filtro Estado para incluir los resueltos.`
    : filters.hasActiveFilters
      ? t`Ningún depósito coincide con los filtros`
      : t`No hay depósitos pendientes`;

  const requestAction = useCallback(
    (action: RecaudoAction, recaudo: AdminRecaudo) => setPendingAction({ action, recaudo }),
    []
  );

  const handleConfirm = (reason: string) => {
    if (!pendingAction || isSubmitting) return;

    const { action, recaudo } = pendingAction;

    if (action === 'approve') {
      approveRecaudo.mutate({
        id: recaudo.id,
        input: buildApproveRecaudoInput(reason),
      });
      return;
    }

    if (action === 'reject') {
      rejectRecaudo.mutate({
        id: recaudo.id,
        input: buildRejectRecaudoInput(reason),
      });
      return;
    }

    reverseRecaudo.mutate({
      id: recaudo.id,
      input: buildReverseRecaudoInput(reason),
    });
  };

  const columns = useMemo<ColumnDef<AdminRecaudo>[]>(
    () => [
      {
        accessorKey: 'client_name',
        header: () => (
          <RecaudoColumnHeader
            filter={
              <RecaudoClientFacet variant="column" values={filters.values} onEdit={filters.edit} />
            }
          />
        ),
        cell: ({ row }) => (
          <span className="font-medium whitespace-nowrap">{row.original.client_name}</span>
        ),
      },
      {
        accessorKey: 'customer_email',
        header: t`Usuario`,
        cell: ({ row }) => (
          <div className="flex max-w-[16rem] flex-col">
            <span className="truncate font-medium" title={row.original.customer_email}>
              {row.original.customer_email}
            </span>
            {row.original.reference && (
              <span
                className="truncate text-xs font-medium text-foreground"
                title={row.original.reference}
                data-testid="recaudo-operator-reference"
              >
                {row.original.reference}
              </span>
            )}
            <span
              className="truncate text-xs text-muted-foreground"
              data-testid="recaudo-internal-reference"
            >
              {row.original.reference_code}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'wallet_id',
        header: t`Billetera`,
        cell: ({ row }) => (
          <span className="font-mono text-xs whitespace-nowrap" title={row.original.wallet_id}>
            {truncateMiddle(row.original.wallet_id, 8, 4)}
          </span>
        ),
      },
      {
        accessorKey: 'amount',
        header: () => (
          <RecaudoColumnHeader
            align="right"
            filter={
              <RecaudoCurrencyFacet
                variant="column"
                label={t`Monto`}
                values={filters.values}
                onEdit={filters.edit}
              />
            }
          />
        ),
        cell: ({ row }) => (
          <span className="block text-right font-mono font-medium tabular-nums whitespace-nowrap">
            {formatFiat(row.original.amount, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: 'source',
        header: t`Origen`,
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            {recaudoSourceLabel(row.original.source, (d) => t(d))}
          </span>
        ),
      },
      {
        accessorKey: 'provider_code',
        header: () => (
          <RecaudoColumnHeader
            filter={
              <RecaudoProviderFacet
                variant="column"
                values={filters.values}
                onEdit={filters.edit}
                suggestions={providerSuggestions}
              />
            }
          />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="whitespace-nowrap">{formatOpsText(row.original.provider_code)}</span>
            <span
              className="font-mono text-xs whitespace-nowrap text-muted-foreground"
              title={row.original.provider_event_id ?? undefined}
            >
              {truncateMiddle(row.original.provider_event_id, 8, 4) || EMPTY_CELL}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: () => (
          <RecaudoColumnHeader
            filter={
              <RecaudoStatusFacet variant="column" values={filters.values} onEdit={filters.edit} />
            }
          />
        ),
        cell: ({ row }) => (
          <StatePillChip
            status={row.original.status}
            variant="payin"
            badgeVariant={recaudoStatusBadgeVariant(row.original.status)}
            label={statusLabels[row.original.status as RecaudoStatusFilter]}
          />
        ),
      },
      {
        accessorKey: 'created_at',
        header: t`Creado`,
        cell: ({ row }) => (
          <span className="whitespace-nowrap">{formatOpsDateTime(row.original.created_at)}</span>
        ),
      },
      {
        id: 'actions',
        header: t`Acciones`,
        cell: ({ row }) =>
          canOperate ? (
            <RecaudoRowActions
              recaudo={row.original}
              disabled={isSubmitting}
              onAction={requestAction}
            />
          ) : null,
      },
    ],
    [
      t,
      canOperate,
      isSubmitting,
      requestAction,
      filters.values,
      filters.edit,
      providerSuggestions,
      statusLabels,
    ]
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={t`Depósitos`}
        subtitle={t`Depósitos entrantes que requieren aprobación manual.`}
        titleAccessory={<PendingCountBadge state={pendingCount} kind={countKind} />}
      />

      <div className="space-y-4">
        <RecaudoFilterToolbar
          values={filters.values}
          onEdit={filters.edit}
          onReset={filters.reset}
          canReset={filters.hasActiveFilters}
        />

        {isError && !queue && (
          <p role="alert" className="text-sm text-destructive">
            {t`No se pudieron cargar los depósitos.`}
          </p>
        )}

        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          isFetching={isFetching}
          minWidth="1200px"
          density="compact"
          emptyMessage={emptyMessage}
        />

        {isTruncated && (
          <p role="status" className="text-xs text-muted-foreground">
            {t`Mostrando ${shownCount} de ${totalCount} depósitos. Ajusta los filtros para acotar la lista.`}
          </p>
        )}
      </div>

      {canOperate ? <CreateRecaudoForm /> : null}

      <StateChangeConfirmationModal
        open={pendingAction !== null}
        onClose={closeConfirmation}
        onConfirm={handleConfirm}
        selectedCount={1}
        fromState={pendingAction?.recaudo.status ?? EMPTY_CELL}
        toState={pendingAction ? recaudoActionTargetStatus(pendingAction.action) : ''}
        entityType="ops"
        entityLabel={t`recaudo`}
        entityLabelPlural={t`recaudos`}
        reasonRequired={pendingAction ? isRecaudoReasonRequired(pendingAction.action) : false}
        loading={isSubmitting}
        entitySummary={
          pendingAction
            ? [
                { label: t`Usuario`, value: pendingAction.recaudo.customer_email },
                { label: t`Cliente`, value: pendingAction.recaudo.client_name },
                {
                  label: t`Monto`,
                  value: formatFiat(pendingAction.recaudo.amount, pendingAction.recaudo.currency),
                },
                {
                  label: t`Referencia`,
                  value: pendingAction.recaudo.reference ?? pendingAction.recaudo.reference_code,
                },
                ...(pendingAction.recaudo.reference
                  ? [
                      {
                        label: t`ID de recaudo`,
                        value: pendingAction.recaudo.reference_code,
                      },
                    ]
                  : []),
                { label: t`Billetera`, value: pendingAction.recaudo.wallet_id },
              ]
            : undefined
        }
      />
    </div>
  );
}
