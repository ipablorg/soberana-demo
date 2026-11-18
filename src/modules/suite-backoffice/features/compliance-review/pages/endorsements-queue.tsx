/**
 * `/backoffice/compliance/endorsements` — manual rail-endorsement queue.
 *
 * The backend decision enum also accepts `ADDITIONAL_INFO_REQUIRED`; this page
 * deliberately exposes only approve and reject, which is the agreed scope.
 */

import { useMemo, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { ColumnDef } from '@tanstack/react-table';

import type { ReviewEndorsementResult } from '@/graphql/mutations/admin-loopay';
import type { AdminEndorsementQueueItem } from '@/graphql/types/admin-loopay';
import { DataTable } from '@/shared/components/common/DataTable';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { StateChangeConfirmationModal } from '@/shared/components/backoffice/StateChangeConfirmationModal';
import { StatePillChip } from '@/shared/components/backoffice/StatePillChip';
import { Button } from '@/shared/components/ui/button';
import { useCanOperateMoney } from '@/shared/hooks/use-can-operate-money';

import { CompleteProviderProfileDialog } from '../components/complete-provider-profile-dialog';
import { EndorsementApprovalDialog } from '../components/endorsement-approval-dialog';
import { EndorsementOnboardingResult } from '../components/endorsement-onboarding-result';
import { usePendingEndorsements, useReviewEndorsement } from '../hooks/use-review-queues';
import {
  buildReviewEndorsementInput,
  endorsementTargetStatus,
  isQueueReasonRequired,
  type QueueReviewAction,
} from '../lib/queue-review-actions';
import { EMPTY_CELL, formatOpsDateTime } from '../../ops-review/lib/ops-formatting';
import { ClientFilterSelect } from '../../ops-review/components/client-filter-select';
import { RailFilterSelect } from '../../ops-review/components/rail-filter-select';
import { withClientFilter } from '../../ops-review/lib/client-options';
import { endorsementReasonLabel, railDisplayName } from '../../ops-review/lib/ops-value-labels';

interface PendingEndorsementAction {
  action: QueueReviewAction;
  endorsement: AdminEndorsementQueueItem;
}

export default function EndorsementsQueue() {
  const { t } = useLingui();
  // #411: commercial reads this queue; only operations acts on it.
  const canOperate = useCanOperateMoney();

  const [clientId, setClientId] = useState<string | undefined>();
  const [railFilter, setRailFilter] = useState('');
  const [pendingAction, setPendingAction] = useState<PendingEndorsementAction | null>(null);

  const filter = useMemo(
    () => withClientFilter(railFilter.trim() ? { railCode: railFilter.trim() } : {}, clientId),
    [clientId, railFilter]
  );

  const { data, isLoading } = usePendingEndorsements(filter);
  const [onboardingResult, setOnboardingResult] = useState<ReviewEndorsementResult | null>(null);
  // The approved endorsement whose missing provider data is being completed.
  const [completing, setCompleting] = useState<ReviewEndorsementResult | null>(null);
  const closeConfirmation = () => setPendingAction(null);
  const reviewEndorsement = useReviewEndorsement((response) => {
    closeConfirmation();
    setOnboardingResult(response.adminLoopay_reviewEndorsement);
  });

  const isSubmitting = reviewEndorsement.isPending;
  const rows = data?.adminLoopay_listPendingEndorsements.data ?? [];

  const approvalTarget = pendingAction?.action === 'approve' ? pendingAction.endorsement : null;
  const rejectionAction = pendingAction?.action === 'reject' ? pendingAction : null;

  // #411: no provider is sent; the backend takes it from the client rail.
  const handleApprove = () => {
    if (!approvalTarget || isSubmitting) return;

    reviewEndorsement.mutate({
      id: approvalTarget.id,
      input: buildReviewEndorsementInput('approve', ''),
    });
  };

  const handleConfirm = (reason: string) => {
    if (!pendingAction || isSubmitting) return;

    reviewEndorsement.mutate({
      id: pendingAction.endorsement.id,
      input: buildReviewEndorsementInput(pendingAction.action, reason),
    });
  };

  const columns = useMemo<ColumnDef<AdminEndorsementQueueItem>[]>(
    () => [
      {
        accessorKey: 'client_name',
        header: t`Cliente`,
        cell: ({ row }) => <span className="font-medium">{row.original.client_name}</span>,
      },
      {
        accessorKey: 'customer_email',
        header: t`Usuario`,
        cell: ({ row }) => <span className="font-medium">{row.original.customer_email}</span>,
      },
      {
        accessorKey: 'rail_name',
        header: t`Riel`,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{railDisplayName(row.original.rail_name)}</span>
            <span className="text-xs text-muted-foreground">{row.original.rail_code}</span>
          </div>
        ),
      },
      {
        accessorKey: 'currency',
        header: t`Moneda`,
      },
      {
        accessorKey: 'status',
        header: t`Estado`,
        cell: ({ row }) => <StatePillChip status={row.original.status} variant="documentation" />,
      },
      {
        accessorKey: 'requested_at',
        header: t`Solicitado`,
        cell: ({ row }) => formatOpsDateTime(row.original.requested_at),
      },
      {
        accessorKey: 'review_reason',
        header: t`Motivo`,
        cell: ({ row }) => endorsementReasonLabel(row.original.review_reason, (d) => t(d)),
      },
      ...(canOperate
        ? [
            {
              id: 'actions',
              header: t`Acciones`,
              cell: ({ row }: { row: { original: AdminEndorsementQueueItem } }) => (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() =>
                      setPendingAction({
                        action: 'approve',
                        endorsement: row.original,
                      })
                    }
                  >
                    <Trans>Aprobar</Trans>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isSubmitting}
                    onClick={() =>
                      setPendingAction({
                        action: 'reject',
                        endorsement: row.original,
                      })
                    }
                  >
                    <Trans>Rechazar</Trans>
                  </Button>
                </div>
              ),
            },
          ]
        : []),
    ],
    [t, isSubmitting, canOperate]
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={t`Habilitaciones de riel`}
        subtitle={t`Habilitaciones de riel pendientes de decisión manual.`}
      />

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        minWidth="1000px"
        emptyMessage={t`No hay habilitaciones pendientes`}
        toolbar={
          <div className="flex flex-wrap items-end gap-4">
            <ClientFilterSelect
              id="endorsement-client-filter"
              value={clientId}
              onChange={setClientId}
            />
            <RailFilterSelect
              id="endorsement-rail-filter"
              value={railFilter}
              onChange={setRailFilter}
            />
          </div>
        }
      />

      <EndorsementApprovalDialog
        endorsement={approvalTarget}
        loading={isSubmitting}
        onClose={closeConfirmation}
        onConfirm={handleApprove}
      />

      <EndorsementOnboardingResult
        result={onboardingResult}
        onClose={() => setOnboardingResult(null)}
        onCompleteData={() => {
          setCompleting(onboardingResult);
          setOnboardingResult(null);
        }}
      />

      {completing ? (
        <CompleteProviderProfileDialog
          endorsementId={completing.id}
          customerId={completing.customer_id}
          missingFields={completing.onboarding?.missing_fields ?? []}
          missingFieldDetails={completing.onboarding?.missing_field_details ?? []}
          onClose={() => setCompleting(null)}
          onRetried={(onboarding) => setOnboardingResult({ ...completing, onboarding })}
        />
      ) : null}

      <StateChangeConfirmationModal
        open={rejectionAction !== null}
        onClose={closeConfirmation}
        onConfirm={handleConfirm}
        selectedCount={1}
        fromState={rejectionAction?.endorsement.status ?? EMPTY_CELL}
        toState={rejectionAction ? endorsementTargetStatus(rejectionAction.action) : ''}
        entityType="ops"
        entityLabel={t`endoso`}
        entityLabelPlural={t`endosos`}
        reasonRequired={rejectionAction ? isQueueReasonRequired(rejectionAction.action) : false}
        loading={isSubmitting}
        entitySummary={
          rejectionAction
            ? [
                { label: t`Usuario`, value: rejectionAction.endorsement.customer_email },
                { label: t`Cliente`, value: rejectionAction.endorsement.client_name },
                {
                  label: t`Riel`,
                  value: `${railDisplayName(rejectionAction.endorsement.rail_name)} (${rejectionAction.endorsement.rail_code})`,
                },
                { label: t`Moneda`, value: rejectionAction.endorsement.currency },
              ]
            : undefined
        }
      />
    </div>
  );
}
