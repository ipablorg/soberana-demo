/**
 * PayoutsFilters Component
 *
 * Componente de filtros avanzados para payouts con date pickers
 */

import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from '@/shared/components/animated-icons';
import { useState } from 'react';
import type { PayoutState } from '../types';
import { Trans, useLingui } from '@lingui/react/macro';

interface PayoutsFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: {
    state?: PayoutState | 'all';
    dateFrom?: Date;
    dateTo?: Date;
  }) => void;
  currentState?: PayoutState | 'all';
  currentDateFrom?: Date;
  currentDateTo?: Date;
}

export function PayoutsFilters({
  open,
  onOpenChange,
  onApplyFilters,
  currentState = 'all',
  currentDateFrom,
  currentDateTo,
}: PayoutsFiltersProps) {
  const { t } = useLingui();
  const [state, setState] = useState<PayoutState | 'all'>(currentState);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(currentDateFrom);
  const [dateTo, setDateTo] = useState<Date | undefined>(currentDateTo);

  const handleApply = () => {
    onApplyFilters({
      state,
      dateFrom,
      dateTo,
    });
    onOpenChange(false);
  };

  const handleClear = () => {
    setState('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    onApplyFilters({
      state: 'all',
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Panel de filtros */}
      <div className="relative w-full max-w-2xl mx-4 rounded-xl border border-border bg-card text-card-foreground p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
          <h3 className="text-xl font-semibold text-foreground"><Trans>Filtros avanzados</Trans></h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label={t`Cerrar filtros`}
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>

        {/* Filtros */}
        <div className="space-y-6">
          {/* Estado */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80"><Trans>Estado</Trans></label>
            <Select
              value={state}
              onValueChange={(value) => setState(value as PayoutState | 'all')}
            >
              <SelectTrigger aria-label={t`Estado del payout`}>
                <SelectValue placeholder={t`Todos los estados`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t`Todos los estados`}</SelectItem>
                <SelectItem value="pending">{t`Pendiente`}</SelectItem>
                <SelectItem value="onHold">{t`En espera`}</SelectItem>
                <SelectItem value="processing">{t`En proceso`}</SelectItem>
                <SelectItem value="completed">{t`Completado`}</SelectItem>
                <SelectItem value="failed">{t`Fallido`}</SelectItem>
                <SelectItem value="cancelled">{t`Cancelado`}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rango de fechas */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80"><Trans>Rango de fechas</Trans></label>
            <div className="grid grid-cols-2 gap-4">
              {/* Fecha desde */}
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground"><Trans>Desde</Trans></span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between font-normal"
                    >
                      {dateFrom ? (
                        format(dateFrom, 'PPP', { locale: es })
                      ) : (
                        <span className="text-muted-foreground"><Trans>Seleccionar fecha</Trans></span>
                      )}
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-popover border-border"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Fecha hasta */}
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground"><Trans>Hasta</Trans></span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between font-normal"
                    >
                      {dateTo ? (
                        format(dateTo, 'PPP', { locale: es })
                      ) : (
                        <span className="text-muted-foreground"><Trans>Seleccionar fecha</Trans></span>
                      )}
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-popover border-border"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      disabled={(date) => (dateFrom ? date < dateFrom : false)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Mostrar rango seleccionado */}
            {dateFrom && dateTo && (
              <div className="text-xs text-muted-foreground mt-2">
                <Trans>Rango:</Trans> {format(dateFrom, 'PP', { locale: es })} -{' '}
                {format(dateTo, 'PP', { locale: es })}
              </div>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3 mt-8 pt-4 border-t border-border/50">
          <Button variant="ghost" onClick={handleClear} className="flex-1">
            <Trans>Limpiar filtros</Trans>
          </Button>
          <Button variant="gradient" onClick={handleApply} className="flex-1">
            <Trans>Aplicar filtros</Trans>
          </Button>
        </div>
      </div>
    </div>
  );
}
