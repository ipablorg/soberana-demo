/**
 * `/backoffice/compliance/beneficiaries` — manual beneficiary review queue.
 *
 * Approval writes `VERIFIED` (not `APPROVED`), which is what the backend's
 * `AdminBeneficiaryReviewDecision` enum accepts.
 */

import { useMemo, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { ColumnDef } from '@tanstack/react-table';

import type { AdminReviewedBeneficiary } from '@/graphql/queries/admin-loopay/beneficiaries.queries';
import type { AdminBeneficiaryQueueItem } from '@/graphql/types/admin-loopay';
import { DataTable } from '@/shared/components/common/DataTable';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { StateChangeConfirmationModal } from '@/shared/components/backoffice/StateChangeConfirmationModal';
import { StatePillChip } from '@/shared/components/backoffice/StatePillChip';
import { BankDetailsDisplay } from '@/shared/components/backoffice/bank-details-display';
import { Button } from '@/shared/components/ui/button';
import { providerDisplayName, railCodeLabel } from '@/shared/lib/rail-provider-labels';
import { useCanOperateMoney } from '@/shared/hooks/use-can-operate-money';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

import { LinkBeneficiaryProviderDialog } from '../components/link-beneficiary-provider-dialog';
import { ProviderSandboxActions } from '../components/provider-sandbox-actions';
import { StartProviderVerificationButton } from '../components/start-provider-verification-button';
import { ReviewStatusBadge } from '../components/review-status-badge';
import { countryName, isProviderManaged } from '../lib/beneficiary-review-status';
import {
  useAllBeneficiaries,
  useDeactivateBeneficiary,
  useLinkBeneficiaryProviderId,
  usePendingBeneficiaries,
  useReactivateBeneficiary,
  useReviewBeneficiary,
} from '../hooks/use-review-queues';
import {
  beneficiaryTargetStatus,
  buildLinkBeneficiaryProviderInput,
  buildReviewBeneficiaryInput,
  isQueueReasonRequired,
  type QueueReviewAction,
} from '../lib/queue-review-actions';
import { EMPTY_CELL, formatOpsDateTime } from '../../ops-review/lib/ops-formatting';
import { ClientFilterSelect } from '../../ops-review/components/client-filter-select';
import { RailFilterSelect } from '../../ops-review/components/rail-filter-select';
import { beneficiaryHolderLabel } from '../../ops-review/lib/ops-value-labels';
import { withClientFilter } from '../../ops-review/lib/client-options';

interface PendingBeneficiaryAction {
  action: QueueReviewAction;
  beneficiary: AdminBeneficiaryQueueItem;
}

type BeneficiaryTab = 'pending' | 'all';

export default function BeneficiariesQueue() {
  const { t } = useLingui();
  // #411: commercial reads this queue; only operations acts on it.
  const canOperate = useCanOperateMoney();

  const [tab, setTab] = useState<BeneficiaryTab>('pending');
  const [clientId, setClientId] = useState<string | undefined>();
  const [railFilter, setRailFilter] = useState('');
  const [pendingAction, setPendingAction] = useState<PendingBeneficiaryAction | null>(null);
  const [linkTarget, setLinkTarget] = useState<AdminBeneficiaryQueueItem | null>(null);
  const [bankDetailsTarget, setBankDetailsTarget] = useState<AdminBeneficiaryQueueItem | null>(
    null
  );
  const [allBankDetailsTarget, setAllBankDetailsTarget] = useState<{
    holderName: string;
    railCode: string;
    bankDetails: unknown;
  } | null>(null);
  const [lifecycleTarget, setLifecycleTarget] = useState<AdminReviewedBeneficiary | null>(null);

  const filter = useMemo(
    () => withClientFilter(railFilter.trim() ? { railCode: railFilter.trim() } : {}, clientId),
    [clientId, railFilter]
  );

  const { data, isLoading } = usePendingBeneficiaries(filter);
  const closeConfirmation = () => setPendingAction(null);

  const reviewBeneficiary = useReviewBeneficiary(closeConfirmation);
  const linkProviderId = useLinkBeneficiaryProviderId(() => setLinkTarget(null));
  const deactivateBeneficiary = useDeactivateBeneficiary(() => setLifecycleTarget(null));
  const reactivateBeneficiary = useReactivateBeneficiary(() => setLifecycleTarget(null));

  const isSubmitting =
    reviewBeneficiary.isPending ||
    linkProviderId.isPending ||
    deactivateBeneficiary.isPending ||
    reactivateBeneficiary.isPending;
  const rows = data?.adminLoopay_listPendingBeneficiaries.data ?? [];

  const allBeneficiariesWhere = useMemo(
    () => ({
      ...(clientId ? { clientId: { equals: clientId } } : {}),
      ...(railFilter.trim() ? { railCode: { equals: railFilter.trim() } } : {}),
    }),
    [clientId, railFilter]
  );
  const { data: allData, isLoading: isAllLoading } = useAllBeneficiaries(allBeneficiariesWhere);
  const allRows = allData?.adminLoopay_listBeneficiaries.data ?? [];

  const handleConfirm = (reason: string) => {
    if (!pendingAction || isSubmitting) return;

    reviewBeneficiary.mutate({
      id: pendingAction.beneficiary.id,
      input: buildReviewBeneficiaryInput(pendingAction.action, reason),
    });
  };

  const handleLink = (providerCode: string, providerBeneficiaryId: string) => {
    if (!linkTarget || linkProviderId.isPending) return;

    linkProviderId.mutate({
      id: linkTarget.id,
      input: buildLinkBeneficiaryProviderInput(providerCode, providerBeneficiaryId),
    });
  };

  const columns = useMemo<ColumnDef<AdminBeneficiaryQueueItem>[]>(
    () => [
      {
        accessorKey: 'holder_name',
        header: t`Beneficiario`,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.holder_name}</span>
            <span className="text-xs text-muted-foreground">
              {beneficiaryHolderLabel(row.original.holder_type, row.original.relationship, (d) =>
                t(d)
              )}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'client_name',
        header: t`Cliente`,
        cell: ({ row }) => <span className="font-medium">{row.original.client_name}</span>,
      },
      {
        accessorKey: 'customer_email',
        header: t`Usuario`,
      },
      {
        accessorKey: 'rail_code',
        header: t`Riel`,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span>{railCodeLabel(row.original.rail_code)}</span>
            <span className="text-xs text-muted-foreground">{row.original.currency}</span>
          </div>
        ),
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
            <Button size="sm" variant="outline" onClick={() => setBankDetailsTarget(row.original)}>
              <Trans>Ver datos bancarios</Trans>
            </Button>
            {canOperate ? (
              <>
                <Button
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() =>
                    setPendingAction({
                      action: 'approve',
                      beneficiary: row.original,
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
                      beneficiary: row.original,
                    })
                  }
                >
                  <Trans>Rechazar</Trans>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => setLinkTarget(row.original)}
                >
                  <Trans>Vincular ID del proveedor</Trans>
                </Button>
              </>
            ) : null}
          </div>
        ),
      },
    ],
    [t, isSubmitting, canOperate]
  );

  const allColumns = useMemo<ColumnDef<AdminReviewedBeneficiary>[]>(
    () => [
      {
        accessorKey: 'holderName',
        header: t`Beneficiario`,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.holderName}</span>
            <span className="text-xs text-muted-foreground">
              {beneficiaryHolderLabel(row.original.holderType, row.original.relationship, (d) =>
                t(d)
              )}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'customerEmail',
        header: t`Usuario`,
        cell: ({ row }) => row.original.customerEmail ?? EMPTY_CELL,
      },
      {
        id: 'provider',
        header: t`Proveedor`,
        cell: ({ row }) =>
          row.original.providerCode ? (
            <span className="font-medium">{providerDisplayName(row.original.providerCode)}</span>
          ) : (
            <span className="text-muted-foreground">{EMPTY_CELL}</span>
          ),
      },
      {
        id: 'country',
        header: t`País`,
        cell: ({ row }) =>
          countryName(row.original.country ?? row.original.railCountry) || EMPTY_CELL,
      },
      {
        accessorKey: 'railCode',
        header: t`Riel`,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span>{railCodeLabel(row.original.railCode)}</span>
            <span className="text-xs text-muted-foreground">{row.original.currency}</span>
          </div>
        ),
      },
      {
        id: 'review',
        header: t`Revisión`,
        cell: ({ row }) => (
          <ReviewStatusBadge
            reviewStatus={row.original.reviewStatus}
            reason={row.original.reviewReason}
          />
        ),
      },
      {
        accessorKey: 'status',
        header: t`Estado`,
        cell: ({ row }) => <StatePillChip status={row.original.status} variant="documentation" />,
      },
      {
        accessorKey: 'createdAt',
        header: t`Creado`,
        cell: ({ row }) => formatOpsDateTime(row.original.createdAt),
      },
      {
        id: 'actions',
        header: t`Acciones`,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setAllBankDetailsTarget({
                  holderName: row.original.holderName,
                  railCode: row.original.railCode,
                  bankDetails: row.original.bankDetails,
                })
              }
            >
              <Trans>Ver datos bancarios</Trans>
            </Button>
            {!canOperate ? null : isProviderManaged(row.original) ? (
              <>
                <span className="self-center text-xs text-muted-foreground">
                  <Trans>Lo gestiona el proveedor</Trans>
                </span>
                <StartProviderVerificationButton beneficiary={row.original} />
                <ProviderSandboxActions beneficiary={row.original} />
              </>
            ) : row.original.status === 'VERIFIED' ? (
              <Button
                size="sm"
                variant="destructive"
                disabled={isSubmitting}
                onClick={() => setLifecycleTarget(row.original)}
              >
                <Trans>Desactivar</Trans>
              </Button>
            ) : row.original.status === 'UNVERIFIED' || row.original.status === 'REJECTED' ? (
              <Button
                size="sm"
                disabled={isSubmitting}
                onClick={() => setLifecycleTarget(row.original)}
              >
                <Trans>Reactivar</Trans>
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [t, isSubmitting, canOperate]
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={t`Beneficiarios`}
        subtitle={t`Beneficiarios pendientes de verificación manual.`}
      />

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={tab === 'pending' ? 'default' : 'outline'}
          onClick={() => setTab('pending')}
        >
          <Trans>Pendientes</Trans>
        </Button>
        <Button
          size="sm"
          variant={tab === 'all' ? 'default' : 'outline'}
          onClick={() => setTab('all')}
        >
          <Trans>Todos los beneficiarios</Trans>
        </Button>
      </div>

      {tab === 'pending' ? (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          minWidth="1100px"
          emptyMessage={t`No hay beneficiarios pendientes`}
          toolbar={
            <div className="flex flex-wrap items-end gap-4">
              <ClientFilterSelect
                id="beneficiary-client-filter"
                value={clientId}
                onChange={setClientId}
              />
              <RailFilterSelect
                id="beneficiary-rail-filter"
                value={railFilter}
                onChange={setRailFilter}
              />
            </div>
          }
        />
      ) : (
        <DataTable
          columns={allColumns}
          data={allRows}
          isLoading={isAllLoading}
          minWidth="1100px"
          emptyMessage={t`No hay beneficiarios`}
          toolbar={
            <div className="flex flex-wrap items-end gap-4">
              <ClientFilterSelect
                id="beneficiary-all-client-filter"
                value={clientId}
                onChange={setClientId}
              />
              <RailFilterSelect
                id="beneficiary-all-rail-filter"
                value={railFilter}
                onChange={setRailFilter}
              />
            </div>
          }
        />
      )}

      <LinkBeneficiaryProviderDialog
        beneficiary={linkTarget}
        loading={linkProviderId.isPending}
        onClose={() => setLinkTarget(null)}
        onConfirm={handleLink}
      />

      <Dialog open={bankDetailsTarget !== null} onOpenChange={() => setBankDetailsTarget(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{bankDetailsTarget?.holder_name ?? EMPTY_CELL}</DialogTitle>
            <DialogDescription>
              {bankDetailsTarget
                ? `${railCodeLabel(bankDetailsTarget.rail_code)} · ${bankDetailsTarget.currency}`
                : EMPTY_CELL}
            </DialogDescription>
          </DialogHeader>
          {bankDetailsTarget ? (
            <BankDetailsDisplay
              bankDetails={bankDetailsTarget.bank_details}
              railCode={bankDetailsTarget.rail_code}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <StateChangeConfirmationModal
        open={pendingAction !== null}
        onClose={closeConfirmation}
        onConfirm={handleConfirm}
        selectedCount={1}
        // The queue lists beneficiaries pending review.
        fromState="PENDING"
        toState={pendingAction ? beneficiaryTargetStatus(pendingAction.action) : ''}
        entityType="ops"
        entityLabel={t`beneficiario`}
        entityLabelPlural={t`beneficiarios`}
        reasonRequired={pendingAction ? isQueueReasonRequired(pendingAction.action) : false}
        loading={isSubmitting}
        entitySummary={
          pendingAction
            ? [
                { label: t`Usuario`, value: pendingAction.beneficiary.customer_email },
                { label: t`Cliente`, value: pendingAction.beneficiary.client_name },
                { label: t`Beneficiario`, value: pendingAction.beneficiary.holder_name },
                {
                  label: t`Riel`,
                  value: `${railCodeLabel(pendingAction.beneficiary.rail_code)} · ${pendingAction.beneficiary.currency}`,
                },
              ]
            : undefined
        }
      />

      <Dialog
        open={allBankDetailsTarget !== null}
        onOpenChange={() => setAllBankDetailsTarget(null)}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{allBankDetailsTarget?.holderName ?? EMPTY_CELL}</DialogTitle>
            <DialogDescription>
              {allBankDetailsTarget ? railCodeLabel(allBankDetailsTarget.railCode) : EMPTY_CELL}
            </DialogDescription>
          </DialogHeader>
          {allBankDetailsTarget ? (
            <BankDetailsDisplay
              bankDetails={allBankDetailsTarget.bankDetails}
              railCode={allBankDetailsTarget.railCode}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <StateChangeConfirmationModal
        open={lifecycleTarget !== null}
        onClose={() => setLifecycleTarget(null)}
        onConfirm={() => {
          if (!lifecycleTarget || isSubmitting) return;
          if (lifecycleTarget.status === 'VERIFIED') {
            deactivateBeneficiary.mutate({ id: lifecycleTarget.id });
          } else {
            reactivateBeneficiary.mutate({ id: lifecycleTarget.id });
          }
        }}
        selectedCount={1}
        fromState={lifecycleTarget?.status ?? EMPTY_CELL}
        toState={
          lifecycleTarget ? (lifecycleTarget.status === 'VERIFIED' ? 'UNVERIFIED' : 'VERIFIED') : ''
        }
        entityType="ops"
        entityLabel={t`beneficiario`}
        entityLabelPlural={t`beneficiarios`}
        showReason={false}
        loading={isSubmitting}
        entitySummary={
          lifecycleTarget
            ? [
                { label: t`Usuario`, value: lifecycleTarget.customerEmail ?? EMPTY_CELL },
                { label: t`Beneficiario`, value: lifecycleTarget.holderName },
                {
                  label: t`Riel`,
                  value: `${railCodeLabel(lifecycleTarget.railCode)} · ${lifecycleTarget.currency}`,
                },
              ]
            : undefined
        }
      />
    </div>
  );
}
