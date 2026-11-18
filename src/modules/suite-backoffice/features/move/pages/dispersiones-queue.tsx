/**
 * `/backoffice/move/dispersiones` — manual outbound-withdrawal queue.
 *
 * The queue is status-scoped by the backend (`PENDING` by default,
 * `PROCESSING` on request), so the page exposes that as a tab-like filter and
 * offers only the transitions legal for the row's current status. The
 * "Esperando aprobación" view is the PENDING page narrowed to the #413
 * withdrawals whose gross is in the ops vault waiting for the backoffice:
 * LOOPAY_OPERATIONS / LOOPAY_ADMIN approve (the Mesta order is placed) or
 * reject them, and retry a blocked funding or return. Rows the #410 stale
 * scan flagged show "Revisión requerida" with the reason.
 */

import { useMemo, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { ColumnDef } from '@tanstack/react-table';

import type { AdminDispersionQueueRow as AdminDispersion } from '@/graphql/queries/admin-loopay';
import { DataTable } from '@/shared/components/common/DataTable';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { StateChangeConfirmationModal } from '@/shared/components/backoffice/StateChangeConfirmationModal';
import { StatePillChip } from '@/shared/components/backoffice/StatePillChip';
import { Button } from '@/shared/components/ui/button';
import { formatFiat } from '@/shared/lib/format-money';
import { useCanOperateMoney } from '@/shared/hooks/use-can-operate-money';

import { DispersionPayoutBadge } from '../components/dispersion-payout-badge';
import {
  DispersionDecisionFailure,
  DispersionPayoutPlan,
  DispersionStaleReview,
} from '../components/dispersion-review-cells';
import {
  ApproveDispersionDialog,
  CompleteDispersionDialog,
} from '../components/dispersion-settlement-dialogs';
import {
  useApproveDispersion,
  useCancelDispersion,
  useCanDecideWithdrawals,
  useCompleteDispersion,
  useFailDispersion,
  usePendingDispersiones,
  useRejectDispersion,
  useRejectWithdrawal,
  useRetryDispersionFunding,
  useRetryDispersionReturn,
} from '../hooks/use-dispersiones-queue';
import {
  buildCancelDispersionInput,
  buildCompleteDispersionInput,
  buildFailDispersionInput,
  buildRejectDispersionInput,
  dispersionActionTargetStatus,
  isDispersionReasonRequired,
  type CompleteDispersionFormValues,
  type DispersionAction,
} from '../lib/dispersion-actions';
import {
  canApproveOrRejectDispersion,
  canCancelDispersion,
  canCompleteManually,
  canFailDispersion,
} from '../lib/dispersion-payout';
import {
  buildApproveWithdrawalInput,
  canApproveWithdrawal,
  canRejectWithdrawal,
  canRetryFunding,
  canRetryReturn,
  queueFilterOf,
  WITHDRAWAL_QUEUE_VIEWS,
  type WithdrawalDecisionFailure,
  type WithdrawalQueueView,
} from '../lib/dispersion-approval';
import { EMPTY_CELL, formatOpsDateTime, formatOpsText } from '../../ops-review/lib/ops-formatting';
import { ClientFilterSelect } from '../../ops-review/components/client-filter-select';
import { withClientFilter } from '../../ops-review/lib/client-options';

/** `reject-withdrawal`: the #413 reject (custody return), distinct from the legacy hold release. */
type ReasonAction = Extract<DispersionAction, 'reject' | 'fail' | 'cancel'> | 'reject-withdrawal';

interface PendingReasonAction {
  action: ReasonAction;
  dispersion: AdminDispersion;
}

export default function DispersionesQueue() {
  const { t } = useLingui();
  // #411: commercial reads this queue; only operations acts on it.
  const canOperate = useCanOperateMoney();
  // #413: the approval-flow decisions are LOOPAY_OPERATIONS / LOOPAY_ADMIN only.
  const canDecide = useCanDecideWithdrawals();

  const [view, setView] = useState<WithdrawalQueueView>('PENDING');
  const [clientId, setClientId] = useState<string | undefined>();
  const [completeTarget, setCompleteTarget] = useState<AdminDispersion | null>(null);
  const [approveTarget, setApproveTarget] = useState<AdminDispersion | null>(null);
  const [reasonAction, setReasonAction] = useState<PendingReasonAction | null>(null);
  const [decisionFailure, setDecisionFailure] = useState<WithdrawalDecisionFailure | null>(null);

  const filter = useMemo(() => withClientFilter(queueFilterOf(view), clientId), [view, clientId]);
  const { data, isLoading } = usePendingDispersiones(filter);

  const completeDispersion = useCompleteDispersion(() => setCompleteTarget(null));
  const closeReasonModal = () => setReasonAction(null);
  const rejectDispersion = useRejectDispersion(closeReasonModal);
  const failDispersion = useFailDispersion(closeReasonModal);
  const cancelDispersion = useCancelDispersion(closeReasonModal);
  const approveWithdrawal = useApproveDispersion(() => setApproveTarget(null), setDecisionFailure);
  const rejectWithdrawal = useRejectWithdrawal(closeReasonModal, setDecisionFailure);
  const retryFunding = useRetryDispersionFunding(setDecisionFailure);
  const retryReturn = useRetryDispersionReturn(setDecisionFailure);

  const isSubmitting =
    completeDispersion.isPending ||
    rejectDispersion.isPending ||
    failDispersion.isPending ||
    cancelDispersion.isPending ||
    approveWithdrawal.isPending ||
    rejectWithdrawal.isPending ||
    retryFunding.isPending ||
    retryReturn.isPending;

  const viewLabel = (queueView: WithdrawalQueueView) =>
    queueView === 'AWAITING_APPROVAL' ? t`Esperando aprobación` : queueView;

  const handleApprove = (note: string) => {
    if (!approveTarget || approveWithdrawal.isPending) return;

    setDecisionFailure(null);
    approveWithdrawal.mutate({
      id: approveTarget.id,
      input: buildApproveWithdrawalInput(note),
    });
  };

  const rows = data?.adminLoopay_listPendingDispersiones.data ?? [];

  const handleComplete = (values: CompleteDispersionFormValues) => {
    if (!completeTarget || completeDispersion.isPending) return;

    completeDispersion.mutate({
      id: completeTarget.id,
      input: buildCompleteDispersionInput(values),
    });
  };

  const handleReasonConfirm = (reason: string) => {
    if (!reasonAction || isSubmitting) return;

    const { action, dispersion } = reasonAction;

    if (action === 'reject-withdrawal') {
      setDecisionFailure(null);
      rejectWithdrawal.mutate({
        id: dispersion.id,
        input: buildRejectDispersionInput(reason),
      });
      return;
    }

    if (action === 'reject') {
      rejectDispersion.mutate({
        id: dispersion.id,
        input: buildRejectDispersionInput(reason),
      });
      return;
    }

    if (action === 'cancel') {
      cancelDispersion.mutate({
        id: dispersion.id,
        input: buildCancelDispersionInput(reason),
      });
      return;
    }

    failDispersion.mutate({
      id: dispersion.id,
      input: buildFailDispersionInput(reason),
    });
  };

  const columns = useMemo<ColumnDef<AdminDispersion>[]>(
    () => [
      {
        accessorKey: 'client_name',
        header: t`Cliente`,
        cell: ({ row }) => <span className="font-medium">{row.original.client_name}</span>,
      },
      {
        accessorKey: 'customer_email',
        header: t`Usuario`,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.customer_email}</span>
            <span className="text-xs text-muted-foreground">{row.original.reference_code}</span>
          </div>
        ),
      },
      {
        accessorKey: 'amount',
        header: t`Monto`,
        cell: ({ row }) => (
          <span className="font-medium">
            {formatFiat(row.original.amount, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: 'held_amount',
        header: t`Retenido`,
        cell: ({ row }) =>
          row.original.held_amount
            ? formatFiat(row.original.held_amount, row.original.currency)
            : EMPTY_CELL,
      },
      {
        id: 'quote_rate',
        header: t`Tasa cliente`,
        cell: ({ row }) =>
          row.original.quote_rate
            ? `${row.original.quote_rate} ${row.original.quote_target_currency ?? ''}`
            : EMPTY_CELL,
      },
      {
        id: 'quote_target_amount',
        header: t`Monto esperado`,
        cell: ({ row }) =>
          row.original.quote_target_amount
            ? formatFiat(row.original.quote_target_amount, row.original.quote_target_currency ?? '')
            : EMPTY_CELL,
      },
      {
        id: 'fee_amount',
        header: t`Fee`,
        cell: ({ row }) =>
          row.original.fee_amount
            ? formatFiat(row.original.fee_amount, row.original.fee_currency ?? '')
            : EMPTY_CELL,
      },
      {
        id: 'beneficiary',
        header: t`Beneficiario`,
        cell: ({ row }) => {
          const beneficiary = row.original.beneficiary;
          if (!beneficiary) return EMPTY_CELL;

          return (
            <div className="flex flex-col">
              <span className="font-medium">{beneficiary.holder_name}</span>
              <span className="text-xs text-muted-foreground">
                {beneficiary.rail_code} · {beneficiary.currency}
              </span>
            </div>
          );
        },
      },
      {
        id: 'payout_plan',
        header: t`Plan de pago`,
        cell: ({ row }) =>
          row.original.payout_plan ? (
            <DispersionPayoutPlan
              plan={row.original.payout_plan}
              currency={row.original.currency}
            />
          ) : (
            EMPTY_CELL
          ),
      },
      {
        accessorKey: 'funds_location',
        header: t`Fondos`,
        cell: ({ row }) => formatOpsText(row.original.funds_location),
      },
      {
        accessorKey: 'status',
        header: t`Estado`,
        cell: ({ row }) => <StatePillChip status={row.original.status} variant="payout" />,
      },
      {
        id: 'withdrawal_state',
        header: t`Etapa`,
        cell: ({ row }) => formatOpsText(row.original.dispersion_state ?? null),
      },
      {
        id: 'stale_review',
        header: t`Revisión`,
        cell: ({ row }) => <DispersionStaleReview row={row.original} />,
      },
      {
        id: 'payout',
        header: t`Pago al proveedor`,
        cell: ({ row }) =>
          row.original.payout ? <DispersionPayoutBadge payout={row.original.payout} /> : EMPTY_CELL,
      },
      {
        accessorKey: 'created_at',
        header: t`Creado`,
        cell: ({ row }) => formatOpsDateTime(row.original.created_at),
      },
      {
        id: 'actions',
        header: t`Acciones`,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            {/* #413: approve / reject a withdrawal whose gross is in the ops
                vault; the sweep and the payout stay automatic (#409). */}
            {canDecide && canApproveWithdrawal(row.original) ? (
              <Button
                size="sm"
                disabled={isSubmitting}
                onClick={() => {
                  setDecisionFailure(null);
                  setApproveTarget(row.original);
                }}
              >
                <Trans>Aprobar</Trans>
              </Button>
            ) : null}
            {canDecide && canRejectWithdrawal(row.original) ? (
              <Button
                size="sm"
                variant="destructive"
                disabled={isSubmitting}
                onClick={() =>
                  setReasonAction({
                    action: 'reject-withdrawal',
                    dispersion: row.original,
                  })
                }
              >
                <Trans>Rechazar</Trans>
              </Button>
            ) : null}
            {canDecide && canRetryFunding(row.original) ? (
              <Button
                size="sm"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => {
                  setDecisionFailure(null);
                  retryFunding.mutate({ id: row.original.id });
                }}
              >
                <Trans>Reintentar fondeo</Trans>
              </Button>
            ) : null}
            {canDecide && canRetryReturn(row.original) ? (
              <Button
                size="sm"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => {
                  setDecisionFailure(null);
                  retryReturn.mutate({ id: row.original.id });
                }}
              >
                <Trans>Reintentar devolución</Trans>
              </Button>
            ) : null}
            {canOperate && canApproveOrRejectDispersion(row.original) ? (
              <>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isSubmitting}
                  onClick={() =>
                    setReasonAction({
                      action: 'reject',
                      dispersion: row.original,
                    })
                  }
                >
                  <Trans>Rechazar</Trans>
                </Button>
              </>
            ) : null}
            {canOperate && canCompleteManually(row.original) ? (
              <Button
                size="sm"
                disabled={isSubmitting}
                onClick={() => setCompleteTarget(row.original)}
              >
                <Trans>Completar</Trans>
              </Button>
            ) : null}
            {canOperate && canCancelDispersion(row.original) ? (
              <Button
                size="sm"
                variant="destructive"
                disabled={isSubmitting}
                onClick={() =>
                  setReasonAction({
                    action: 'cancel',
                    dispersion: row.original,
                  })
                }
              >
                <Trans>Cancelar</Trans>
              </Button>
            ) : null}
            {canOperate && canFailDispersion(row.original) ? (
              <>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isSubmitting}
                  onClick={() =>
                    setReasonAction({
                      action: 'fail',
                      dispersion: row.original,
                    })
                  }
                >
                  <Trans>Marcar fallida</Trans>
                </Button>
              </>
            ) : null}
          </div>
        ),
      },
    ],
    [t, isSubmitting, canOperate, canDecide, retryFunding, retryReturn]
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={t`Retiros`}
        subtitle={t`Retiros salientes que requieren operación manual.`}
      />

      {decisionFailure ? <DispersionDecisionFailure kind={decisionFailure} /> : null}

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        minWidth="1900px"
        emptyMessage={t`No hay retiros en este estado`}
        toolbar={
          <div className="flex flex-wrap items-end gap-4">
            <ClientFilterSelect
              id="dispersion-client-filter"
              value={clientId}
              onChange={setClientId}
            />
            <div className="flex items-center gap-2">
              {WITHDRAWAL_QUEUE_VIEWS.map((queueView) => (
                <Button
                  key={queueView}
                  size="sm"
                  variant={view === queueView ? 'default' : 'outline'}
                  aria-pressed={view === queueView}
                  onClick={() => setView(queueView)}
                >
                  {viewLabel(queueView)}
                </Button>
              ))}
            </div>
          </div>
        }
      />

      <CompleteDispersionDialog
        dispersion={completeTarget}
        loading={completeDispersion.isPending}
        onClose={() => setCompleteTarget(null)}
        onConfirm={handleComplete}
      />

      <ApproveDispersionDialog
        dispersion={approveTarget}
        loading={approveWithdrawal.isPending}
        lockedFundsLocation="ops_vault"
        consequence={t`Se coloca la orden de pago en Mesta con el emisor del cliente y se fondea desde la bóveda de operaciones.`}
        onClose={() => setApproveTarget(null)}
        onConfirm={(_fundsLocation, note) => handleApprove(note)}
      />

      <StateChangeConfirmationModal
        open={reasonAction !== null}
        onClose={closeReasonModal}
        onConfirm={handleReasonConfirm}
        selectedCount={1}
        fromState={reasonAction?.dispersion.status ?? EMPTY_CELL}
        toState={reasonAction ? reasonTargetStatus(reasonAction.action) : ''}
        entityType="ops"
        entityLabel={t`dispersión`}
        entityLabelPlural={t`dispersiones`}
        reasonRequired={reasonAction ? isReasonRequired(reasonAction.action) : false}
        loading={isSubmitting}
        entitySummary={
          reasonAction
            ? [
                { label: t`Usuario`, value: reasonAction.dispersion.customer_email },
                { label: t`Cliente`, value: reasonAction.dispersion.client_name },
                {
                  label: t`Monto`,
                  value: formatFiat(
                    reasonAction.dispersion.amount,
                    reasonAction.dispersion.currency
                  ),
                },
                { label: t`Referencia`, value: reasonAction.dispersion.reference_code },
                {
                  label: t`Beneficiario`,
                  value: reasonAction.dispersion.beneficiary
                    ? `${reasonAction.dispersion.beneficiary.holder_name} (${reasonAction.dispersion.beneficiary.rail_code})`
                    : EMPTY_CELL,
                },
              ]
            : undefined
        }
      />
    </div>
  );
}

/** The #413 reject ends REJECTED with a mandatory reason, like the legacy one. */
function asDispersionAction(action: ReasonAction): DispersionAction {
  return action === 'reject-withdrawal' ? 'reject' : action;
}

function reasonTargetStatus(action: ReasonAction): string {
  return dispersionActionTargetStatus(asDispersionAction(action));
}

function isReasonRequired(action: ReasonAction): boolean {
  return isDispersionReasonRequired(asDispersionAction(action));
}
