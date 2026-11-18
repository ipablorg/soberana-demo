/**
 * FlujosDataTable — Tabla financiera pivotada (métrica × períodos).
 * Cada fila es una métrica, cada columna un período temporal.
 * Usa DataTable pattern pero con columnas dinámicas por período.
 */

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/shared/components/ui/data-table';
import { cn } from '@/shared/lib/utils';
import type { FinancialRow, FinancialPeriod } from '@/modules/amazonas/types/flujos.types';
import { formatFinancialValue } from '@/modules/amazonas/data/flujos.data';
import { useLingui } from '@lingui/react/macro';

type ViewMode = 'quarterly' | 'annual';

interface FinancialTableRow {
  id: string;
  metric: string;
  isHighlight: boolean;
  isSeparator: boolean;
  indent: boolean;
  [period: string]: string | number | boolean | null;
}

function buildTableData(
  rows: FinancialRow[],
  periods: FinancialPeriod[],
  viewMode: ViewMode
): FinancialTableRow[] {
  const filteredPeriods =
    viewMode === 'annual'
      ? periods.filter((p) => p.isAnnual || p.key.startsWith('Q4_'))
      : periods;

  return rows.map((row, idx) => {
    const tableRow: FinancialTableRow = {
      id: `${idx}-${row.metric}`,
      metric: row.metric,
      isHighlight: row.isHighlight ?? false,
      isSeparator: row.isSeparator ?? false,
      indent: row.indent ?? false,
    };
    for (const p of filteredPeriods) {
      tableRow[p.key] = row.values[p.key] ?? null;
    }
    return tableRow;
  });
}

export interface FlujosDataTableProps {
  title: string;
  rows: FinancialRow[];
  periods: FinancialPeriod[];
}

export function FlujosDataTable({ title, rows, periods }: FlujosDataTableProps) {
  const { t } = useLingui();
  const [viewMode, setViewMode] = useState<ViewMode>('quarterly');

  const filteredPeriods = useMemo(
    () =>
      viewMode === 'annual'
        ? periods.filter((p) => p.isAnnual || p.key.startsWith('Q4_'))
        : periods,
    [periods, viewMode]
  );

  const tableData = useMemo(
    () => buildTableData(rows, periods, viewMode),
    [rows, periods, viewMode]
  );

  const columns = useMemo<ColumnDef<FinancialTableRow, unknown>[]>(() => {
    const metricCol: ColumnDef<FinancialTableRow, unknown> = {
      accessorKey: 'metric',
      header: title,
      cell: ({ row }) => {
        const data = row.original;
        if (data.isSeparator) return null;
        return (
          <span
            className={cn(
              'text-sm whitespace-nowrap',
              data.isHighlight ? 'font-bold text-foreground' : 'text-foreground',
              data.indent && 'pl-4 text-muted-foreground'
            )}
          >
            {data.metric}
          </span>
        );
      },
      size: 220,
      enableSorting: false,
    };

    const periodCols: ColumnDef<FinancialTableRow, unknown>[] = filteredPeriods.map((p) => ({
      accessorKey: p.key,
      header: () => (
        <span className="text-right block">
          {viewMode === 'annual' && !p.isAnnual ? p.label.replace('Q4 ', 'FY ') : p.label}
        </span>
      ),
      cell: ({ row }) => {
        const data = row.original;
        if (data.isSeparator) return null;
        const v = data[p.key] as number | null;
        const formatted = formatFinancialValue(v);
        const isNeg = v !== null && v < 0;
        return (
          <span
            className={cn(
              'font-mono tabular-nums text-right block text-xs',
              data.isHighlight ? 'font-bold' : 'font-normal',
              isNeg ? 'text-destructive' : 'text-foreground'
            )}
          >
            {formatted}
          </span>
        );
      },
      size: 110,
      enableSorting: false,
    }));

    return [metricCol, ...periodCols];
  }, [filteredPeriods, viewMode, title]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {viewMode === 'annual' ? t`Annual view (FY)` : t`Full quarterly view`}
        </p>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card/80 p-1">
          <button
            type="button"
            onClick={() => setViewMode('quarterly')}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-colors duration-150',
              viewMode === 'quarterly'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t`Quarterly`}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('annual')}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-colors duration-150',
              viewMode === 'annual'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t`Annual`}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <DataTable<FinancialTableRow, unknown>
          columns={columns}
          data={tableData}
          showPagination={false}
          emptyMessage={t`No financial data available.`}
          bordered
        />
      </div>
    </div>
  );
}
