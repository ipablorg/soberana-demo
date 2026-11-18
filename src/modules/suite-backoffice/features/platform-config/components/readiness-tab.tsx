/**
 * Readiness matrix: one row per active client, straight from
 * `adminLoopay_platformReadiness`. BLOCKED rows are highlighted in red and
 * sorted first; no row is ever hidden.
 */

import { useMemo } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { ColumnDef } from '@tanstack/react-table';

import type { AdminPlatformClientReadiness } from '@/graphql/types/admin-loopay';
import { DataTable } from '@/shared/components/common/DataTable';
import { StatePillChip } from '@/shared/components/backoffice/StatePillChip';
import { cn } from '@/shared/lib/utils';

import { EMPTY_CELL } from '../../ops-review/lib/ops-formatting';
import { usePlatformReadiness } from '../hooks/use-platform-readiness';
import { countReadinessByStatus, sortReadinessRows } from '../lib/readiness';
import { readinessIssueKeyLabel, readinessIssueLabel } from '../lib/readiness-issues';

function CodeList({ codes }: { codes: readonly string[] }) {
  if (codes.length === 0) return <span>{EMPTY_CELL}</span>;
  return <span className="break-words">{codes.join(', ')}</span>;
}

export function ReadinessTab() {
  const { t } = useLingui();
  const { data, isLoading } = usePlatformReadiness();

  const rows = useMemo(() => sortReadinessRows(data?.adminLoopay_platformReadiness ?? []), [data]);
  const counts = useMemo(() => countReadinessByStatus(rows), [rows]);

  const columns = useMemo<ColumnDef<AdminPlatformClientReadiness>[]>(
    () => [
      {
        accessorKey: 'client_name',
        header: t`Cliente`,
        cell: ({ row }) => (
          <span
            className={cn('font-medium', row.original.status === 'BLOCKED' && 'text-destructive')}
            data-readiness-status={row.original.status}
          >
            {row.original.client_name}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: t`Estado`,
        cell: ({ row }) => <StatePillChip status={row.original.status} variant="readiness" />,
      },
      {
        accessorKey: 'wallet_defaults_set',
        header: t`Defaults de billetera`,
        cell: ({ row }) => (row.original.wallet_defaults_set ? t`Configurados` : t`Faltan`),
      },
      {
        accessorKey: 'active_providers',
        header: t`Proveedores activos`,
        cell: ({ row }) => <CodeList codes={row.original.active_providers} />,
      },
      {
        accessorKey: 'active_junction_count',
        header: t`Conexiones activas`,
      },
      {
        accessorKey: 'missing_pairings',
        header: t`Pairings faltantes`,
        cell: ({ row }) => <CodeList codes={row.original.missing_pairings} />,
      },
      {
        accessorKey: 'dead_provider_junctions_active',
        header: t`Conexiones a proveedores muertos`,
        cell: ({ row }) => (
          <span
            className={cn(
              row.original.dead_provider_junctions_active > 0 && 'font-semibold text-destructive'
            )}
          >
            {row.original.dead_provider_junctions_active}
          </span>
        ),
      },
      {
        accessorKey: 'issues',
        header: t`Problemas`,
        cell: ({ row }) =>
          row.original.issues.length === 0 ? (
            EMPTY_CELL
          ) : (
            <ul className="list-disc space-y-1 pl-4 text-sm">
              {row.original.issues.map((issue, index) => {
                // #411: prefer the i18n key (same order as `issues`).
                const keyed = row.original.issue_keys?.[index];
                return (
                  <li key={`${index}:${issue}`}>
                    {keyed
                      ? readinessIssueKeyLabel(keyed, t, readinessIssueLabel(issue, t))
                      : readinessIssueLabel(issue, t)}
                  </li>
                );
              })}
            </ul>
          ),
      },
    ],
    [t]
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        <Trans>
          Bloqueados: {counts.BLOCKED} · Incompletos: {counts.INCOMPLETE} · Listos: {counts.READY}
        </Trans>
      </p>
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        minWidth="1200px"
        pageSize={50}
        emptyMessage={t`No hay clientes activos`}
      />
    </div>
  );
}
