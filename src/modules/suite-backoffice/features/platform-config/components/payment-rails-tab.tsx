/**
 * Payment rails catalog (platform-level). #411: a read-only catalogue for the
 * super admin. A rail is country + currency + direction; an alias rail
 * (`canonical_code` differs from its code, e.g. us_ach -> ach) is shown with
 * the rail it duplicates and is never offered for selection anywhere.
 */

import { useCallback, useMemo } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { ColumnDef } from '@tanstack/react-table';

import type { AdminPaymentRail } from '@/graphql/types/admin-loopay';
import { DataTable } from '@/shared/components/common/DataTable';

import { usePaymentRails } from '../hooks/use-platform-catalog';
import { isCanonicalRail } from '../lib/catalog-options';
import { RailStatusBadge } from './rail-status-badge';

export function PaymentRailsTab() {
  const { t } = useLingui();
  const directionLabel = useCallback(
    (direction: string): string => {
      if (direction === 'INBOUND') return t`Entrada`;
      if (direction === 'OUTBOUND') return t`Salida`;
      if (direction === 'BOTH') return t`Entrada y salida`;
      return direction;
    },
    [t]
  );

  const { data, isLoading } = usePaymentRails();
  const rows = data?.adminLoopay_listPaymentRails ?? [];

  const columns = useMemo<ColumnDef<AdminPaymentRail>[]>(
    () => [
      {
        accessorKey: 'code',
        header: t`Código`,
        cell: ({ row }) => <span className="font-mono text-sm">{row.original.code}</span>,
      },
      { accessorKey: 'name', header: t`Nombre` },
      { accessorKey: 'currency', header: t`Moneda` },
      { accessorKey: 'country', header: t`País` },
      {
        accessorKey: 'direction',
        header: t`Dirección`,
        cell: ({ row }) => directionLabel(row.original.direction),
      },
      {
        id: 'canonical',
        header: t`Duplica a`,
        cell: ({ row }) =>
          isCanonicalRail(row.original) ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            <span className="font-mono text-sm" data-testid={`rail-alias-${row.original.code}`}>
              {row.original.canonical_code}
            </span>
          ),
      },
      {
        accessorKey: 'is_active',
        header: t`Estado`,
        cell: ({ row }) => (
          <RailStatusBadge code={row.original.code} active={row.original.is_active} />
        ),
      },
    ],
    [t, directionLabel]
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        <Trans>
          Catálogo de solo lectura: los rieles no se crean ni se editan desde aquí. Un riel que
          duplica a otro no se ofrece en ninguna selección.
        </Trans>
      </p>
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        minWidth="1000px"
        emptyMessage={t`No hay rieles de pago registrados`}
      />
    </div>
  );
}
