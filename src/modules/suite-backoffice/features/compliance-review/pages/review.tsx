/**
 * `/backoffice/compliance-review` — manual KYC decision queue.
 *
 * Lists customers whose `kyc_status` is awaiting a human decision, opens the
 * full dossier (`adminLoopay_getCustomerKycData`) in a drawer, and records the
 * decision through `adminLoopay_reviewKyc` /
 * `adminLoopay_requestKycAdditionalInfo`.
 */

import { useMemo, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { ColumnDef } from '@tanstack/react-table';

import type { AdminKycQueueItem } from '@/graphql/types/admin-loopay';
import { DataTable } from '@/shared/components/common/DataTable';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { StateChangeConfirmationModal } from '@/shared/components/backoffice/StateChangeConfirmationModal';
import { StatePillChip } from '@/shared/components/backoffice/StatePillChip';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useCanOperateMoney } from '@/shared/hooks/use-can-operate-money';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

import { KycDossierDialog } from '../components/kyc-dossier-dialog';
import { ProviderRequirementsBanner } from '../../provider-requirements/components/provider-requirements-banner';
import {
  usePendingKycQueue,
  useRequestKycAdditionalInfo,
  useReviewKyc,
} from '../hooks/use-kyc-review';
import {
  buildRequestKycAdditionalInfoInput,
  buildReviewKycInput,
  isKycReasonRequired,
  kycActionTargetStatus,
  type KycReviewAction,
} from '../lib/kyc-review-actions';
import {
  EMPTY_CELL,
  formatCustomerName,
  formatOpsDateTime,
} from '../../ops-review/lib/ops-formatting';
import { kycStatusLabel } from '../../ops-review/lib/ops-labels';
import { customerTypeLabel } from '../../ops-review/lib/ops-value-labels';
import { ClientFilterSelect } from '../../ops-review/components/client-filter-select';
import { withClientFilter } from '../../ops-review/lib/client-options';

const ANY_CUSTOMER_TYPE = 'all';

interface PendingKycAction {
  action: KycReviewAction;
  customer: AdminKycQueueItem;
}

export default function ComplianceReview() {
  const { t } = useLingui();
  // #411: commercial reads this queue; only operations acts on it.
  const canOperate = useCanOperateMoney();

  const [clientId, setClientId] = useState<string | undefined>();
  const [emailFilter, setEmailFilter] = useState('');
  const [customerType, setCustomerType] = useState<string>(ANY_CUSTOMER_TYPE);
  const [openDossierFor, setOpenDossierFor] = useState<AdminKycQueueItem | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingKycAction | null>(null);

  const filter = useMemo(
    () =>
      withClientFilter(
        {
          ...(emailFilter.trim().length > 0 ? { search: emailFilter.trim() } : {}),
          ...(customerType !== ANY_CUSTOMER_TYPE
            ? { customerType: customerType as 'individual' | 'business' }
            : {}),
          includeAdditionalInfoRequired: true,
        },
        clientId
      ),
    [clientId, emailFilter, customerType]
  );

  const { data, isLoading } = usePendingKycQueue(filter);
  const closeConfirmation = () => setPendingAction(null);

  const reviewKyc = useReviewKyc(closeConfirmation);
  const requestAdditionalInfo = useRequestKycAdditionalInfo(closeConfirmation);

  const isSubmitting = reviewKyc.isPending || requestAdditionalInfo.isPending;
  const rows = data?.adminLoopay_listPendingKyc.data ?? [];

  const handleConfirm = (reason: string) => {
    if (!pendingAction || isSubmitting) return;

    const { action, customer } = pendingAction;

    if (action === 'request-info') {
      requestAdditionalInfo.mutate({
        customerId: customer.id,
        input: buildRequestKycAdditionalInfoInput(reason),
      });
      return;
    }

    reviewKyc.mutate({
      customerId: customer.id,
      input: buildReviewKycInput(action, reason),
    });
  };

  const columns = useMemo<ColumnDef<AdminKycQueueItem>[]>(
    () => [
      {
        accessorKey: 'client_name',
        header: t`Cliente`,
        cell: ({ row }) => <span className="font-medium">{row.original.client_name}</span>,
      },
      {
        accessorKey: 'first_name',
        header: t`Usuario`,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">
              {formatCustomerName(
                row.original.first_name,
                row.original.last_name,
                row.original.email
              )}
            </span>
            <span className="text-xs text-muted-foreground">{row.original.email}</span>
          </div>
        ),
      },
      {
        accessorKey: 'customer_type',
        header: t`Tipo`,
        cell: ({ row }) => (
          <span>{customerTypeLabel(row.original.customer_type, (d) => t(d))}</span>
        ),
      },
      {
        accessorKey: 'country',
        header: t`País`,
      },
      {
        accessorKey: 'kyc_status',
        header: t`Estado KYC`,
        cell: ({ row }) => (
          <StatePillChip
            status={row.original.kyc_status}
            variant="documentation"
            label={kycStatusLabel(row.original.kyc_status)}
          />
        ),
      },
      {
        accessorKey: 'documents_count',
        header: t`Documentos`,
        cell: ({ row }) => row.original.documents_count,
      },
      {
        accessorKey: 'submitted_at',
        header: t`Enviado`,
        cell: ({ row }) => formatOpsDateTime(row.original.submitted_at),
      },
      {
        id: 'actions',
        header: t`Acciones`,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setOpenDossierFor(row.original)}>
              <Trans>Ver expediente</Trans>
            </Button>
            {canOperate ? (
              <>
                <Button
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => setPendingAction({ action: 'approve', customer: row.original })}
                >
                  <Trans>Aprobar</Trans>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isSubmitting}
                  onClick={() => setPendingAction({ action: 'reject', customer: row.original })}
                >
                  <Trans>Rechazar</Trans>
                </Button>
                {row.original.kyc_status === 'PENDING_REVIEW' ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={isSubmitting}
                    onClick={() =>
                      setPendingAction({
                        action: 'request-info',
                        customer: row.original,
                      })
                    }
                  >
                    <Trans>Solicitar información</Trans>
                  </Button>
                ) : null}
              </>
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
        title={t`Revisión de Cumplimiento`}
        subtitle={t`Decisiones manuales de KYC sobre clientes en revisión.`}
      />

      {/* Super admin lands here: pending provider requirements must be noticed (S21). */}
      <ProviderRequirementsBanner />

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        minWidth="1100px"
        emptyMessage={t`No hay clientes pendientes de revisión`}
        toolbar={
          <div className="flex flex-wrap items-end gap-4">
            <ClientFilterSelect id="kyc-client-filter" value={clientId} onChange={setClientId} />
            <div className="space-y-2">
              <Label htmlFor="kyc-search">
                <Trans>Buscar cliente</Trans>
              </Label>
              <Input
                id="kyc-search"
                value={emailFilter}
                onChange={(event) => setEmailFilter(event.target.value)}
                placeholder={t`Nombre, razón social o email`}
                className="w-64"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kyc-type-filter">
                <Trans>Tipo de cliente</Trans>
              </Label>
              <Select value={customerType} onValueChange={setCustomerType}>
                <SelectTrigger id="kyc-type-filter" className="w-48">
                  <SelectValue placeholder={t`Todos`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY_CUSTOMER_TYPE}>{t`Todos`}</SelectItem>
                  <SelectItem value="individual">{t`Persona natural`}</SelectItem>
                  <SelectItem value="business">{t`Empresa`}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        }
      />

      <KycDossierDialog customer={openDossierFor} onClose={() => setOpenDossierFor(null)} />

      <StateChangeConfirmationModal
        open={pendingAction !== null}
        onClose={closeConfirmation}
        onConfirm={handleConfirm}
        selectedCount={1}
        fromState={pendingAction ? kycStatusLabel(pendingAction.customer.kyc_status) : EMPTY_CELL}
        toState={pendingAction ? kycActionTargetStatus(pendingAction.action) : ''}
        entityType="ops"
        entityLabel={t`caso de KYC`}
        entityLabelPlural={t`casos de KYC`}
        reasonRequired={pendingAction ? isKycReasonRequired(pendingAction.action) : false}
        loading={isSubmitting}
        entitySummary={
          pendingAction
            ? [
                {
                  label: t`Usuario`,
                  value: formatCustomerName(
                    pendingAction.customer.first_name,
                    pendingAction.customer.last_name,
                    pendingAction.customer.email
                  ),
                },
                { label: t`Correo`, value: pendingAction.customer.email },
                { label: t`Cliente`, value: pendingAction.customer.client_name },
                { label: t`País`, value: pendingAction.customer.country },
                {
                  label: t`Tipo`,
                  value: customerTypeLabel(pendingAction.customer.customer_type, (d) => t(d)),
                },
              ]
            : undefined
        }
      />
    </div>
  );
}
