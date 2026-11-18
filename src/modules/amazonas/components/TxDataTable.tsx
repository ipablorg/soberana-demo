/**
 * TxDataTable — Tabla 1-1 con el CSV: todas las columnas en el mismo orden que txdata.csv.
 * Badges/pills en Operation, Tx Direction y Segment. Measure Values sin modificar. tabular-nums para números.
 */

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/shared/components/ui/data-table';
import { Badge } from '@/shared/components/ui/badge';
import type { TxRow } from '@/modules/amazonas/types/txdata.types';
import { useLingui } from '@lingui/react/macro';

const EMPTY_PLACEHOLDER = '—';

/** Orden y nombres de cabecera exactos del CSV (presentattion/txdata.csv) */
const CSV_COLUMNS: { key: keyof TxRow; header: string; isNumeric?: boolean; useBadge?: 'operation' | 'txDirection' | 'segment' }[] = [
  { key: 'customerName', header: 'Customer Name' },
  { key: 'region', header: 'Region' },
  { key: 'segment', header: 'Segment', useBadge: 'segment' },
  { key: 'businessType', header: 'Business Type' },
  { key: 'csm', header: 'CSM' },
  { key: 'sdr', header: 'SDR' },
  { key: 'tenantId', header: 'Tenant Id' },
  { key: 'date', header: 'Date' },
  { key: 'asset', header: 'Asset' },
  { key: 'txDirection', header: 'Tx Direction', useBadge: 'txDirection' },
  { key: 'operation', header: 'Operation', useBadge: 'operation' },
  { key: 'measureNames', header: 'Measure Names' },
  { key: 'measureValues', header: 'Measure Values', isNumeric: true },
  { key: 'mes', header: 'mes' },
];

function OperationBadge({ value }: { value: string }) {
  if (!value.trim()) return <span className="text-muted-foreground">{EMPTY_PLACEHOLDER}</span>;
  const variant = value.toUpperCase().includes('TRANSFER') ? 'default' : 'secondary';
  return <Badge variant={variant} className="tabular-nums">{value}</Badge>;
}

function TxDirectionBadge({ value }: { value: string }) {
  if (!value.trim()) return <span className="text-muted-foreground">{EMPTY_PLACEHOLDER}</span>;
  const isOutgoing = value.toLowerCase() === 'outgoing';
  return (
    <Badge variant={isOutgoing ? 'default' : 'secondary'} className="capitalize">
      {value}
    </Badge>
  );
}

function SegmentBadge({ value }: { value: string }) {
  if (!value.trim()) return <span className="text-muted-foreground">{EMPTY_PLACEHOLDER}</span>;
  return <Badge variant="outline" className="text-foreground border-primary/40 bg-primary/5">{value}</Badge>;
}

export interface TxDataTableProps {
  data: TxRow[];
  isLoading?: boolean;
}

export function TxDataTable({ data, isLoading = false }: TxDataTableProps) {
  const { t } = useLingui();
  const columns = useMemo<ColumnDef<TxRow, unknown>[]>(() => {
    const dataColumns = CSV_COLUMNS.map(({ key, header, isNumeric, useBadge }) => ({
      accessorKey: key,
      header,
      cell: ({ getValue }: { getValue: () => unknown }) => {
        const v = getValue() as string | undefined;
        const raw = (v ?? '').trim();
        const display = raw || EMPTY_PLACEHOLDER;

        if (useBadge === 'operation') {
          return <OperationBadge value={raw || ''} />;
        }
        if (useBadge === 'txDirection') {
          return <TxDirectionBadge value={raw || ''} />;
        }
        if (useBadge === 'segment') {
          return <SegmentBadge value={raw || ''} />;
        }

        return (
          <span
            className={
              isNumeric
                ? 'font-mono tabular-nums text-foreground text-right inline-block w-full'
                : 'text-foreground text-left'
            }
          >
            {display}
          </span>
        );
      },
    }));

    const indexColumn: ColumnDef<TxRow, unknown> = {
      id: 'index',
      header: '#',
      cell: ({ row, table }) => {
        const { pageIndex, pageSize } = table.getState().pagination;
        const index = pageIndex * pageSize + row.index + 1;
        return (
          <span className="tabular-nums text-muted-foreground text-right inline-block w-full font-medium">
            {index}
          </span>
        );
      },
      size: 48,
    };

    return [indexColumn, ...dataColumns];
  }, []);

  const sortedData = useMemo(
    () => [...data].sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [data]
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t`Columns in the same order as the source. Values unmodified.`}
      </p>
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <DataTable<TxRow, unknown>
          columns={columns}
          data={sortedData}
          isLoading={isLoading}
          showPagination
          pageSize={15}
          emptyMessage={t`No transaction data available.`}
          bordered
        />
      </div>
    </div>
  );
}
