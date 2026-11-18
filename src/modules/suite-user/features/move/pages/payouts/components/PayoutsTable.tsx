/**
 * PayoutsTable Component
 *
 * Componente de tabla para mostrar la lista de payouts con soporte para:
 * - Ordenamiento por columnas
 * - Paginación
 * - Estados visuales
 */

import { Badge, type BadgeProps } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2 } from '@/shared/components/animated-icons';
import { useMemo } from 'react';
import type { OrderDirection, PayoutOrderBy, PayoutsTableProps } from '../types';
import { Trans, useLingui } from '@lingui/react/macro';

const STATE_VARIANTS: Record<string, BadgeProps['variant']> = {
  pending: 'secondary',
  onHold: 'outline',
  processing: 'default',
  completed: 'success',
  failed: 'destructive',
  cancelled: 'secondary',
};

/**
 * Formatea una cantidad de dinero con símbolo de moneda
 */
const formatCurrency = (amount: number, currencyCode?: string | null) => {
  const validCurrencyCode = currencyCode || 'USD';

  try {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: validCurrencyCode,
    }).format(amount);
  } catch (error) {
    // Si el código de moneda no es válido, formatear como número con símbolo genérico
    return `${validCurrencyCode} ${amount.toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
};

/**
 * Formatea una fecha
 */
const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

export function PayoutsTable({
  payouts,
  isLoading = false,
  pagination,
  onPageChange,
  onPageSizeChange,
  onSort,
  currentOrderBy = 'CREATED_AT',
  currentOrderDirection = 'DESC',
}: PayoutsTableProps) {
  const { t } = useLingui();

  const stateLabels: Record<string, string> = {
    pending: t`Pendiente`,
    onHold: t`En espera`,
    processing: t`En proceso`,
    completed: t`Completado`,
    failed: t`Fallido`,
    cancelled: t`Cancelado`,
  };
  /**
   * Renderiza el icono de ordenamiento para una columna
   */
  const renderSortIcon = (columnKey: PayoutOrderBy) => {
    if (currentOrderBy !== columnKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return currentOrderDirection === 'ASC' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  /**
   * Maneja el click en un encabezado de columna para ordenar
   */
  const handleSort = (columnKey: PayoutOrderBy) => {
    if (!onSort) return;

    const newDirection: OrderDirection =
      currentOrderBy === columnKey && currentOrderDirection === 'ASC' ? 'DESC' : 'ASC';

    onSort(columnKey, newDirection);
  };

  /**
   * Genera opciones de paginación
   */
  const paginationOptions = useMemo(() => {
    if (!pagination) return [];

    const pages: (number | string)[] = [];
    const { currentPage, totalPages } = pagination;

    if (totalPages <= 7) {
      // Mostrar todas las páginas si son 7 o menos
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar páginas con elipsis
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  }, [pagination]);

  /**
   * Estado de carga
   */
  if (isLoading && payouts.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 rounded-xl border border-border bg-card">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p><Trans>Un momento...</Trans></p>
        </div>
      </div>
    );
  }

  if (!isLoading && payouts.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 rounded-xl border border-border bg-card">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium"><Trans>Sin registros por ahora</Trans></p>
          <p className="text-sm mt-1"><Trans>Intenta ajustar los filtros de búsqueda</Trans></p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-0 overflow-hidden">
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/40 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin text-foreground" />
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground">ID</TableHead>
                <TableHead
                  className="text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('BENEFICIARY_NAME')}
                >
                  <div className="flex items-center">
                    Beneficiario
                    {renderSortIcon('BENEFICIARY_NAME')}
                  </div>
                </TableHead>
                <TableHead
                  className="text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('AMOUNT')}
                >
                  <div className="flex items-center">
                    Monto
                    {renderSortIcon('AMOUNT')}
                  </div>
                </TableHead>
                <TableHead
                  className="text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('STATE')}
                >
                  <div className="flex items-center">
                    Estado
                    {renderSortIcon('STATE')}
                  </div>
                </TableHead>
                <TableHead className="text-muted-foreground">Banco</TableHead>
                <TableHead className="text-muted-foreground">Producto</TableHead>
                <TableHead
                  className="text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('CREATED_AT')}
                >
                  <div className="flex items-center">
                    Fecha de creación
                    {renderSortIcon('CREATED_AT')}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{payout.uid}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{payout.beneficiaryName}</span>
                      {payout.email && (
                        <span className="text-xs text-muted-foreground">{payout.email}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono tabular-nums text-right font-semibold text-foreground">
                    {formatCurrency(payout.Amount, payout.currencyCode)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATE_VARIANTS[payout.state] || 'secondary'}>
                      {stateLabels[payout.state] || payout.state}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{payout.bankName || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{payout.productName || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(payout.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <Trans>Mostrando {payouts.length} de {pagination.currentPage * pagination.pageSize} resultados</Trans>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange?.(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              <Trans>Anterior</Trans>
            </Button>

            <div className="flex gap-1">
              {paginationOptions.map((page, index) =>
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange?.(page as number)}
                    className={
                      pagination.currentPage === page
                        ? 'bg-foreground/10 text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }
                  >
                    {page}
                  </Button>
                )
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange?.(pagination.currentPage + 1)}
              disabled={!pagination.hasMore}
            >
              <Trans>Siguiente</Trans>
            </Button>
          </div>

          {onPageSizeChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground"><Trans>Mostrar:</Trans></span>
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(value) => onPageSizeChange(Number(value))}
              >
                <SelectTrigger className="w-20 h-8 text-sm" aria-label={t`Tamaño de página`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
