/**
 * Provider <-> payment rail junctions (platform-level). #411: a read-only
 * catalogue for the super admin: Loopay's catalogue fixes the provider behind
 * each rail; nothing is assigned or toggled here.
 */

import { useMemo } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { ColumnDef } from '@tanstack/react-table';

import type { AdminProviderPaymentRail } from '@/graphql/types/admin-loopay';
import { DataTable } from '@/shared/components/common/DataTable';

import { useProviderPaymentRails } from '../hooks/use-platform-catalog';
import { RailStatusBadge } from './rail-status-badge';

export function ProviderRailsTab() {
  const { t } = useLingui();
  const { data, isLoading } = useProviderPaymentRails();
  const rows = data?.adminLoopay_listProviderPaymentRails ?? [];

  const columns = useMemo<ColumnDef<AdminProviderPaymentRail>[]>(
    () => [
      {
        id: 'provider',
        header: t`Proveedor`,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.provider.name}</span>
            <span className="font-mono text-xs text-muted-foreground">
              {row.original.provider.code}
            </span>
          </div>
        ),
      },
      {
        id: 'rail',
        header: t`Riel`,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.rail.name}</span>
            <span className="font-mono text-xs text-muted-foreground">
              {row.original.rail.code}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'is_active',
        header: t`Estado`,
        cell: ({ row }) => (
          <RailStatusBadge code={row.original.rail.code} active={row.original.is_active} />
        ),
      },
    ],
    [t]
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        <Trans>
          Catálogo de solo lectura: el proveedor de cada riel lo fija el catálogo de Loopay.
        </Trans>
      </p>
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        minWidth="800px"
        emptyMessage={t`No hay relaciones proveedor ↔ riel registradas`}
      />
    </div>
  );
}
