/**
 * DataTable - Generic Table Component
 * 
 * A reusable, generic data table component that wraps @tanstack/react-table
 * and shadcn/ui Table components. Provides consistent styling and functionality
 * across the entire application.
 * 
 * Features:
 * - Automatic sorting
 * - Pagination support
 * - Loading states with skeleton
 * - Toolbar slot for filters/actions
 * - Fully typed with TypeScript generics
 */

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { DataTablePagination } from "./DataTablePagination";

export interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  toolbar?: React.ReactNode;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
  minWidth?: string; // CSS width value (e.g. "1000px" or "100%")
  /** Row spacing. `compact` trims vertical cell padding for dense ops queues. */
  density?: DataTableDensity;
  /**
   * A refetch is running behind rows that are already on screen (e.g. filters
   * changed with `keepPreviousData`): dims the table instead of a skeleton.
   */
  isFetching?: boolean;
}

export type DataTableDensity = "comfortable" | "compact";

/** Extra cell classes per density; `comfortable` keeps the TableCell default. */
const CELL_DENSITY_CLASS: Record<DataTableDensity, string | undefined> = {
  comfortable: undefined,
  compact: "py-2.5",
};

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  showPagination = true,
  pageSize = 15,
  toolbar,
  emptyMessage = "Sin resultados por ahora",
  onRowClick,
  minWidth = "1000px",
  density = "comfortable",
  isFetching = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
  });

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar slot */}
      {toolbar && <div className="flex items-center justify-between">{toolbar}</div>}

      {/* Table */}
      <div
        aria-busy={isFetching || undefined}
        className={cn(
          "rounded-md border bg-card overflow-hidden transition-opacity duration-150",
          isFetching && "opacity-60",
        )}
      >
        <div className="overflow-x-auto w-full custom-scrollbar">
          <div style={{ minWidth: minWidth }}>
            <Table>
              <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : undefined}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={CELL_DENSITY_CLASS[density]}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {showPagination && data.length > 0 && (
        <DataTablePagination table={table} />
      )}
    </div>
  );
}

