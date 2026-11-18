/**
 * `/backoffice/provider-requirements` — "Requerimientos de proveedores" (S21).
 *
 * What VA providers still need from customers and the customer already
 * answered: Comercial (and Super admin) opens each document, approves or
 * rejects it with a reason (an approved answer too, before it is sent), and
 * sends the approved items of an endorsement to the provider. Items the
 * provider API cannot take ("Completar en el proveedor") are completed in the
 * provider console or through the KiraFin link ("Generar link"), then marked
 * as resolved with a note. Opened from a VA request or Customer 360 it
 * arrives filtered by customer (`?customerId=`).
 */

import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';
import type { ColumnDef } from '@tanstack/react-table';

import type {
  AdminProviderRequirementSubmitResult,
  ProviderRequirementFilterInput,
} from '@/graphql/types/admin-loopay';
import type { ProviderRequirementStatus } from '@/graphql/types/provider-requirements';
import { FileText } from '@/shared/components/animated-icons';
import { DataTable } from '@/shared/components/common/DataTable';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { requirementStatusLabel } from '@/shared/lib/provider-requirements';
import { useCanOperateMoney } from '@/shared/hooks/use-can-operate-money';

import { OptionSelect } from '../../../components/option-select';
import { useProviderOptions } from '../../platform-config/hooks/use-catalog-options';
import { formatOpsDateTime } from '../../ops-review/lib/ops-formatting';
import { MarkHandledDialog } from '../components/mark-handled-dialog';
import { ReadyToSubmitPanel, groupReadyEndorsements } from '../components/ready-to-submit-panel';
import { RejectRequirementDialog } from '../components/reject-requirement-dialog';
import { RequirementStatusChip } from '../components/requirement-status-chip';
import {
  useCreateProviderRequirementLink,
  useMarkProviderRequirementHandled,
  useProviderRequirementDocument,
  useProviderRequirementsQueue,
  useReviewProviderRequirement,
  useSubmitProviderRequirements,
} from '../hooks/use-provider-requirements';
import {
  DEFAULT_REQUIREMENT_STATUSES,
  REQUIREMENT_STATUS_FILTERS,
  describeProviderRequirement,
  type ProviderRequirementRow,
} from '../lib/provider-requirement-rows';

/** Sentinel of the status select for "every status". */
const ALL_STATUSES = 'ALL';
const PAGE_SIZE = 100;

export default function ProviderRequirementsQueue() {
  const { t } = useLingui();
  // #411: commercial reads this queue; only operations acts on it.
  const canOperate = useCanOperateMoney();
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get('customerId') ?? '';
  const providerOptions = useProviderOptions();

  const [status, setStatus] = useState<string>(DEFAULT_REQUIREMENT_STATUSES[0]);
  const [provider, setProvider] = useState('');
  const [search, setSearch] = useState('');

  const filter = useMemo<ProviderRequirementFilterInput>(
    () => ({
      ...(status !== ALL_STATUSES && { status: [status as ProviderRequirementStatus] }),
      ...(provider && { provider }),
      ...(customerId && { customerId }),
      ...(search.trim() && { search: search.trim() }),
    }),
    [status, provider, customerId, search]
  );

  const queue = useProviderRequirementsQueue({ filter, page: 1, pageSize: PAGE_SIZE });
  // Approved items of every endorsement, for "Enviar al proveedor" (same customer/provider scope).
  const approved = useProviderRequirementsQueue({
    filter: {
      status: ['APPROVED'],
      ...(provider && { provider }),
      ...(customerId && { customerId }),
    },
    page: 1,
    pageSize: PAGE_SIZE,
  });

  const openDocument = useProviderRequirementDocument();
  const [rejecting, setRejecting] = useState<ProviderRequirementRow | null>(null);
  const review = useReviewProviderRequirement(() => setRejecting(null));
  const [handling, setHandling] = useState<ProviderRequirementRow | null>(null);
  const markHandled = useMarkProviderRequirementHandled(() => setHandling(null));
  // Provider links generated in this session, by requirement.
  const [links, setLinks] = useState<Record<string, string>>({});
  const linkingRef = useRef<string | null>(null);
  const createLink = useCreateProviderRequirementLink((result) => {
    const requirementId = linkingRef.current;
    linkingRef.current = null;
    if (!requirementId) return;
    setLinks((current) => ({
      ...current,
      [requirementId]: result.adminLoopay_createProviderRequirementLink,
    }));
  });

  const [results, setResults] = useState<Record<string, AdminProviderRequirementSubmitResult>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  // The endorsement of the send in flight, read when the mutation settles.
  const submittingRef = useRef<string | null>(null);
  const finishSubmit = () => {
    submittingRef.current = null;
    setSubmitting(null);
  };
  const submit = useSubmitProviderRequirements(
    (result) => {
      const endorsementId = submittingRef.current;
      if (endorsementId) {
        setResults((current) => ({
          ...current,
          [endorsementId]: result.adminLoopay_submitProviderRequirements,
        }));
      }
      finishSubmit();
    },
    () => setSubmitting(null)
  );

  const rows = useMemo(
    () =>
      (queue.data?.adminLoopay_listProviderRequirements.items ?? []).map((item) =>
        describeProviderRequirement(item, (d) => t(d))
      ),
    [queue.data, t]
  );
  const readyEndorsements = useMemo(
    () =>
      groupReadyEndorsements(
        (approved.data?.adminLoopay_listProviderRequirements.items ?? []).map((item) =>
          describeProviderRequirement(item, (d) => t(d))
        )
      ),
    [approved.data, t]
  );

  const statusOptions = useMemo(
    () => [
      ...REQUIREMENT_STATUS_FILTERS.map((value) => ({
        value,
        label: requirementStatusLabel(value, (d) => t(d)),
      })),
      { value: ALL_STATUSES, label: t`Todos los estados` },
    ],
    [t]
  );

  const columns = useMemo<ColumnDef<ProviderRequirementRow>[]>(
    () => [
      {
        accessorKey: 'customerName',
        header: t`Cliente`,
        cell: ({ row }) => (
          <div className="flex min-w-[180px] flex-col">
            <span className="font-medium">{row.original.customerName}</span>
            <span className="break-all text-xs text-muted-foreground">
              {row.original.customerEmail}
            </span>
          </div>
        ),
      },
      { accessorKey: 'clientName', header: t`Tenant` },
      {
        accessorKey: 'providerLabel',
        header: t`Proveedor`,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span>{row.original.providerLabel}</span>
            <span className="text-xs text-muted-foreground">{row.original.railLabel}</span>
          </div>
        ),
      },
      {
        accessorKey: 'requirementLabel',
        header: t`Requerimiento`,
        cell: ({ row }) => (
          <div className="flex min-w-[200px] flex-col gap-1">
            <span className="font-medium">{row.original.requirementLabel}</span>
            <span className="text-xs text-muted-foreground">{row.original.kindLabel}</span>
            {row.original.value ? (
              <span className="break-all text-xs">{row.original.value}</span>
            ) : null}
            {row.original.rejectReason ? (
              <span className="text-xs text-destructive">
                <Trans>Motivo del rechazo: {row.original.rejectReason}</Trans>
              </span>
            ) : null}
            {row.original.providerConsole ? (
              <Badge variant="outline" className="w-fit whitespace-nowrap">
                <Trans>Completar en el proveedor</Trans>
              </Badge>
            ) : null}
            {links[row.original.id] ? (
              <a
                href={links[row.original.id]}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-xs text-primary underline"
              >
                {links[row.original.id]}
              </a>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'statusLabel',
        header: t`Estado`,
        cell: ({ row }) => (
          <RequirementStatusChip status={row.original.status} label={row.original.statusLabel} />
        ),
      },
      {
        accessorKey: 'requestedAt',
        header: t`Solicitado`,
        cell: ({ row }) => formatOpsDateTime(row.original.requestedAt),
      },
      {
        id: 'documents',
        header: t`Documentos`,
        cell: ({ row }) =>
          row.original.documents.length === 0 ? (
            '—'
          ) : (
            <div className="flex max-w-[220px] flex-col items-start gap-1">
              {row.original.documents.map((document) => (
                <Button
                  key={document.id}
                  size="sm"
                  variant="link"
                  className="h-auto gap-1 p-0 text-left"
                  onClick={() => void openDocument(document.id)}
                >
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span className="break-all">{document.fileName}</span>
                </Button>
              ))}
            </div>
          ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const item = row.original;
          if (
            !canOperate ||
            (!item.canApprove && !item.canReject && !item.canMarkHandled && !item.canGenerateLink)
          ) {
            return null;
          }
          return (
            <div className="flex flex-wrap gap-2">
              {item.canApprove ? (
                <Button
                  size="sm"
                  disabled={review.isPending}
                  onClick={() =>
                    review.mutate({
                      input: { requirementId: item.id, decision: 'APPROVE' },
                    })
                  }
                >
                  <Trans>Aprobar</Trans>
                </Button>
              ) : null}
              {item.canReject ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={review.isPending}
                  onClick={() => setRejecting(item)}
                >
                  <Trans>Rechazar</Trans>
                </Button>
              ) : null}
              {item.canGenerateLink ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={createLink.isPending}
                  onClick={() => {
                    linkingRef.current = item.id;
                    createLink.mutate({ requirementId: item.id });
                  }}
                >
                  <Trans>Generar link</Trans>
                </Button>
              ) : null}
              {item.canMarkHandled ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={markHandled.isPending}
                  onClick={() => setHandling(item)}
                >
                  <Trans>Marcar resuelto en el proveedor</Trans>
                </Button>
              ) : null}
            </div>
          );
        },
      },
    ],
    [t, review, openDocument, createLink, markHandled, links, canOperate]
  );

  return (
    <div className="space-y-8 p-4 sm:p-6">
      <PageHeader
        title={t`Requerimientos de proveedores`}
        subtitle={t`Documentos y datos que piden los proveedores: revíselos y envíe los aprobados.`}
      />

      {canOperate ? (
        <ReadyToSubmitPanel
          endorsements={readyEndorsements}
          results={results}
          pendingId={submitting}
          onSubmit={(endorsementId) => {
            submittingRef.current = endorsementId;
            setSubmitting(endorsementId);
            submit.mutate({ endorsementId });
          }}
        />
      ) : null}

      <section className="space-y-4">
        {queue.isError ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
          >
            <Trans>No se pudieron cargar los requerimientos.</Trans>
          </div>
        ) : null}
        <DataTable
          columns={columns}
          data={rows}
          isLoading={queue.isLoading}
          minWidth="1100px"
          emptyMessage={t`No hay requerimientos para estos filtros`}
          toolbar={
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider-requirements-status">
                  <Trans>Estado</Trans>
                </Label>
                <OptionSelect
                  id="provider-requirements-status"
                  value={status}
                  onChange={(next) => setStatus(next || ALL_STATUSES)}
                  options={statusOptions}
                  placeholder={t`Todos los estados`}
                  className="w-52"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider-requirements-provider">
                  <Trans>Proveedor</Trans>
                </Label>
                <OptionSelect
                  id="provider-requirements-provider"
                  value={provider}
                  onChange={setProvider}
                  options={providerOptions}
                  placeholder={t`Todos los proveedores`}
                  emptyLabel={t`Todos los proveedores`}
                  className="w-52"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider-requirements-search">
                  <Trans>Buscar</Trans>
                </Label>
                <Input
                  id="provider-requirements-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t`Cliente, correo o requerimiento`}
                  className="w-64"
                />
              </div>
            </div>
          }
        />
      </section>

      <MarkHandledDialog
        requirementLabel={handling?.requirementLabel ?? null}
        isPending={markHandled.isPending}
        onClose={() => setHandling(null)}
        onConfirm={(note) => {
          if (!handling) return;
          markHandled.mutate({ input: { requirementId: handling.id, note } });
        }}
      />

      <RejectRequirementDialog
        requirementLabel={rejecting?.requirementLabel ?? null}
        isPending={review.isPending}
        onClose={() => setRejecting(null)}
        onConfirm={(reason) => {
          if (!rejecting) return;
          review.mutate({
            input: { requirementId: rejecting.id, decision: 'REJECT', reason },
          });
        }}
      />
    </div>
  );
}
