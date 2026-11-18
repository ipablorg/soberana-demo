import { PageHeader } from '@/shared/components/common/PageHeader';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { DataTable } from '@/shared/components/ui/data-table';
import { PageTransition } from '@/shared/components/motion/PageTransition';
import { useMobile } from '@/shared/hooks/use-mobile';
import { useAuthStore } from '@/shared/stores/auth-store';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowUpDown, Calendar, Plus } from '@/shared/components/animated-icons';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Trans, useLingui } from '@lingui/react/macro';
import { PayoutWizard } from './PayoutWizard';
import { PayoutsToolbar } from './components/PayoutsToolbar';
import { usePayoutsByCompany } from './hooks/usePayoutsByCompany';
import type { Payout } from './types';

// Función auxiliar para formatear moneda
const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
  try {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currencyCode || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `$${amount.toFixed(2)}`;
  }
};

export default function MovePayouts() {
  const { t } = useLingui();
  const isMobile = useMobile();
  const [showWizard, setShowWizard] = useState(false);

  // Obtener companyId del auth store
  const user = useAuthStore((state) => state.user);
  const companyId = user?.company_user?.[0]?.company?.id || 0;
  const currentCompany = user?.company_user?.[0]?.company;

  // Logic to check company state
  const isCompanyActive = React.useMemo(() => {
    if (!currentCompany) {
      return false;
    }

    const { stateCompany, stateStudyCompany } = currentCompany;
    
    // Condition: stateCompany must be 'active' AND stateStudyCompany must be 'approved'
    // Los botones se deshabilitan si NO se cumplen ambas condiciones
    const isActive = stateCompany === 'active' && stateStudyCompany === 'approved';
    
    return isActive;
  }, [currentCompany]);

  const {
    payouts,
    totalCount,
    isLoading,
    pagination,
    setSearch,
    setStateFilter,
    setDateRange,
    setPage,
    setPageSize,
    refetch,
  } = usePayoutsByCompany({ companyId, enabled: companyId > 0 });

  const handleNewPayoutClick = () => {
    // No permitir crear nueva dispersión si la compañía no está activa
    if (!isCompanyActive) {
      toast.error(t`No puedes crear dispersiones`, {
        description: t`Activa tu cuenta para empezar a operar`,
      });
      return;
    }
    setShowWizard(true);
  };

  const handleSuccess = (batchId: string) => {
    toast.success(t`Dispersión completada`, {
      description: `ID: ${batchId}`,
    });
    refetch();
  };

  // Definir columnas de la tabla
  const columns = useMemo<ColumnDef<Payout>[]>(
    () => [
      {
        accessorKey: 'uid',
        header: ({ column }) => (
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            UID
            <ArrowUpDown className="h-4 w-4" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="font-mono text-xs text-muted-foreground">{row.original.uid}</div>
        ),
      },
      {
        accessorKey: 'state',
        header: () => <div className="min-w-[95px] sm:min-w-[110px]"><Trans>Estado</Trans></div>,
        cell: ({ row }) => {
          const state = row.original.state.toLowerCase();
          const stateColors: Record<string, string> = {
            pending: 'bg-warning/20 text-warning border-warning/30',
            onhold: 'bg-warning/20 text-warning border-warning/30',
            processing: 'bg-primary/20 text-primary border-primary/30',
            completed: 'bg-success/20 text-success border-success/30',
            failed: 'bg-destructive/20 text-destructive border-destructive/30',
            cancelled: 'bg-muted/20 text-muted-foreground border-muted/30',
          };
          const stateLabels: Record<string, string> = {
            pending: t`Pendiente`,
            onhold: t`En espera`,
            processing: t`En proceso`,
            completed: t`Completado`,
            failed: t`Fallido`,
            cancelled: t`Cancelado`,
          };
          return (
            <span
              className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-medium border whitespace-nowrap ${
                stateColors[state] || 'bg-muted/20 text-muted-foreground border-muted/30'
              }`}
            >
              {stateLabels[state] || row.original.state}
            </span>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline"><Trans>Fecha</Trans></span>
            <ArrowUpDown className="h-4 w-4" />
          </div>
        ),
        cell: ({ row }) => {
          try {
            return (
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                <span className="hidden sm:inline">
                  {format(new Date(row.original.createdAt), "dd MMM yyyy 'a las' HH:mm", {
                    locale: es,
                  })}
                </span>
                <span className="sm:hidden">
                  {format(new Date(row.original.createdAt), 'dd/MM/yy', {
                    locale: es,
                  })}
                </span>
              </div>
            );
          } catch {
            return <div className="text-sm text-muted-foreground">-</div>;
          }
        },
      },
      {
        accessorKey: 'companyName',
        header: () => <div className="hidden md:table-cell"><Trans>Empresa</Trans></div>,
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate text-sm text-muted-foreground hidden md:table-cell">
            {row.original.companyName || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'beneficiaryName',
        header: () => <div className="hidden sm:table-cell"><Trans>Beneficiario</Trans></div>,
        cell: ({ row }) => {
          return (
            <div className="space-y-1 hidden sm:table-cell">
              <div className="font-medium text-foreground">{row.original.beneficiaryName}</div>
              <div className="text-xs text-muted-foreground">{row.original.email || '-'}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'bankName',
        header: () => <div className="hidden lg:table-cell"><Trans>Banco</Trans></div>,
        cell: ({ row }) => {
          return (
            <div className="space-y-1 hidden lg:table-cell">
              <div className="text-sm text-muted-foreground">{row.original.bankName || '-'}</div>
              {row.original.documentNumber && (
                <div className="text-xs text-muted-foreground font-mono">{row.original.documentNumber}</div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'Amount',
        header: ({ column }) => (
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors justify-end"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <Trans>Monto</Trans>
            <ArrowUpDown className="h-4 w-4" />
          </div>
        ),
        cell: ({ row }) => {
          const amount = row.original.Amount || 0;
          const currency = row.original.currencyCode || 'USD';
          try {
            return (
              <div className="text-right font-mono tabular-nums font-semibold text-foreground whitespace-nowrap">
                {formatCurrency(amount, currency)}
              </div>
            );
          } catch {
            return <div className="text-right text-muted-foreground">-</div>;
          }
        },
      },
    ],
    [t]
  );

  // Mostrar mensaje si no hay companyId
  if (!companyId) {
    return (
      <PageTransition className={isMobile ? 'space-y-6 p-4' : 'space-y-8 p-6'}>
        <Card className="p-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium"><Trans>No pudimos obtener la información de tu empresa</Trans></p>
              <p className="text-sm mt-1"><Trans>Inicia sesión nuevamente para continuar.</Trans></p>
            </div>
          </div>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition className={isMobile ? 'space-y-6 p-4' : 'space-y-8 p-6'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <PageHeader
            title={t`Pagos`}
            subtitle={t`Envía pagos a uno o varios destinatarios.`}
          />
          {!isCompanyActive && currentCompany && (
            <div 
              className="mt-2 rounded-md bg-destructive/10 border border-destructive/20 p-2 max-w-md cursor-pointer hover:bg-destructive/15 transition-colors"
              onClick={() => window.open('https://app.loopay.com/onboarding-light', '_blank')}
            >
              <p className="text-destructive text-xs font-medium">
                <Trans>Activa tu cuenta para empezar a operar</Trans>
              </p>
              <p className="text-destructive/70 text-[10px] mt-1">
                <Trans>Estado:</Trans> {currentCompany.stateCompany} | <Trans>Documentación:</Trans> {currentCompany.stateStudyCompany}
              </p>
            </div>
          )}
        </div>
        <Button 
          variant="default"
          onClick={handleNewPayoutClick} 
          disabled={!isCompanyActive}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          <Trans>Nueva dispersión</Trans>
        </Button>
      </div>

      {/* Contenedor de tabla */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          {/* Toolbar */}
          <PayoutsToolbar
            onSearchChange={setSearch}
            onStateChange={setStateFilter}
            onDateRangeChange={(from, to) => setDateRange(from, to)}
            totalCount={totalCount}
            filteredCount={totalCount}
          />

          {/* Tabla */}
          <DataTable
            columns={columns}
            data={payouts}
            isLoading={isLoading}
            showPagination={true}
            pageSize={pagination.pageSize}
            manualPagination={true}
            totalCount={totalCount}
            currentPage={pagination.currentPage}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>

      {/* Wizard */}
      <PayoutWizard open={showWizard} onOpenChange={setShowWizard} onSuccess={handleSuccess} />
    </PageTransition>
  );
}
