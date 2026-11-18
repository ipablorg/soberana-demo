import * as React from "react";
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
  RowSelectionState,
} from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { cn } from "@/shared/lib/utils";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "@/shared/components/animated-icons";
import { Checkbox } from "@/shared/components/ui/checkbox";

export interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  toolbar?: React.ReactNode;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
  bordered?: boolean;
  enableRowSelection?: boolean;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  manualPagination?: boolean;
  totalCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  showPagination = true,
  pageSize = 15,
  toolbar,
  emptyMessage = "Sin resultados por ahora",
  onRowClick,
  bordered = false,
  enableRowSelection = false,
  onRowSelectionChange,
  manualPagination = false,
  totalCount,
  currentPage = 1,
  onPageChange,
  pageSizeOptions = [15, 25, 50],
  onPageSizeChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: manualPagination ? currentPage - 1 : 0,
    pageSize,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  useEffect(() => {
    if (manualPagination && currentPage) {
      setPagination((prev) => ({ ...prev, pageIndex: currentPage - 1 }));
    }
  }, [currentPage, manualPagination]);

  const tableColumns = React.useMemo(() => {
    if (!enableRowSelection) return columns;

    return [
      {
        id: 'select',
        header: ({ table }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Seleccionar todo"
              className="border-border"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Seleccionar fila"
              className="border-border"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      ...columns,
    ] as ColumnDef<TData, TValue>[];
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: enableRowSelection,
    manualPagination: manualPagination,
    pageCount: manualPagination && totalCount
      ? Math.ceil(totalCount / pageSize)
      : undefined,
    state: {
      sorting,
      pagination,
      rowSelection,
    },
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps -- table ref changes every render; callback may not be memoized
  useEffect(() => {
    if (onRowSelectionChange && enableRowSelection) {
      const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
      onRowSelectionChange(selectedRows);
    }
  }, [rowSelection, enableRowSelection]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 w-full rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {toolbar && (
        <div className="flex items-center justify-between">
          {toolbar}
        </div>
      )}

      <div className="overflow-x-auto -mx-4 sm:-mx-2 md:mx-0">
        <div className="inline-block min-w-full align-middle px-4 sm:px-2 md:px-0">
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-border bg-muted/50"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className={cn(
                        "border-b border-border/50 transition-colors duration-150 hover:bg-muted/30",
                        bordered && "border-b border-border/30",
                        onRowClick && "cursor-pointer",
                      )}
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm text-foreground whitespace-nowrap"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showPagination && data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 sm:px-4 py-4">
          <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            {manualPagination && totalCount ? (
              <>
                <span className="hidden sm:inline">
                  Mostrando {((currentPage - 1) * pageSize) + 1} a{" "}
                  {Math.min(currentPage * pageSize, totalCount)}{" "}
                  de {totalCount} resultados
                </span>
                <span className="sm:hidden">
                  {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalCount)} de {totalCount}
                </span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">
                  Mostrando {table.getState().pagination.pageIndex * pageSize + 1} a{" "}
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * pageSize,
                    data.length
                  )}{" "}
                  de {data.length} resultados
                </span>
                <span className="sm:hidden">
                  {table.getState().pagination.pageIndex * pageSize + 1}-{Math.min(
                    (table.getState().pagination.pageIndex + 1) * pageSize,
                    data.length
                  )} de {data.length}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center flex-wrap justify-center gap-4 sm:gap-6">
            {manualPagination && onPageSizeChange && (
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Mostrar:</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="rounded-lg bg-background border-2 border-input px-2 py-1 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size} className="bg-background">
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (manualPagination && onPageChange) {
                    onPageChange(1);
                  } else {
                    table.setPageIndex(0);
                  }
                }}
                disabled={!table.getCanPreviousPage()}
                className="hidden sm:flex"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (manualPagination && onPageChange) {
                    onPageChange(currentPage - 1);
                  } else {
                    table.previousPage();
                  }
                }}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1 px-2">
                <span className="text-xs sm:text-sm text-foreground whitespace-nowrap">
                  <span className="hidden sm:inline">Página </span>
                  {manualPagination ? currentPage : table.getState().pagination.pageIndex + 1} de{" "}
                  {table.getPageCount()}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (manualPagination && onPageChange) {
                    onPageChange(currentPage + 1);
                  } else {
                    table.nextPage();
                  }
                }}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (manualPagination && onPageChange) {
                    onPageChange(table.getPageCount());
                  } else {
                    table.setPageIndex(table.getPageCount() - 1);
                  }
                }}
                disabled={!table.getCanNextPage()}
                className="hidden sm:flex"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
