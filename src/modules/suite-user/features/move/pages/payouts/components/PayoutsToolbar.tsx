/**
 * PayoutsToolbar - Barra de herramientas de filtros para payouts
 *
 * Toolbar simplificado para suite-user con:
 * - Búsqueda con debounce
 * - Filtro por estado (tabs)
 * - Date range picker
 * - Contador de resultados
 */

import { Button } from '@/shared/components/ui/button';
import { Calendar as CalendarComponent } from '@/shared/components/ui/calendar';
import { Input } from '@/shared/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { format, getMonth, getYear, setMonth, setYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, Search, X } from '@/shared/components/animated-icons';
import { useEffect, useRef, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import type { PayoutState } from '../types';
import { Trans, useLingui } from '@lingui/react/macro';

interface PayoutsToolbarProps {
  onSearchChange: (searchTerm: string) => void;
  onStateChange: (state: PayoutState | 'all') => void;
  onDateRangeChange: (from?: Date, to?: Date) => void;
  totalCount: number;
  filteredCount: number;
}

export function PayoutsToolbar({
  onSearchChange,
  onStateChange,
  onDateRangeChange,
  totalCount,
  filteredCount,
}: PayoutsToolbarProps) {
  const { t } = useLingui();

  const payoutStateLabels = {
    all: t`Todos`,
    pending: t`Pendientes`,
    onHold: t`En espera`,
    processing: t`En proceso`,
    completed: t`Completados`,
    failed: t`Fallidos`,
    cancelled: t`Cancelados`,
  };

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Debounce timer ref
  const debounceTimerRef = useRef<number | null>(null);

  // Arrays para los selectores de fecha
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const years = Array.from({ length: 12 }, (_, i) => 2015 + i);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onStateChange(value as PayoutState | 'all');
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer (500ms)
    debounceTimerRef.current = window.setTimeout(() => {
      onSearchChange(value);
    }, 500);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      onDateRangeChange(range.from, range.to);
    } else if (!range) {
      onDateRangeChange(undefined, undefined);
    }
  };

  const clearDateRange = () => {
    setDateRange(undefined);
    onDateRangeChange(undefined, undefined);
  };

  const handleMonthChange = (monthIndex: number) => {
    setCurrentMonth(setMonth(currentMonth, monthIndex));
  };

  const handleYearChange = (year: number) => {
    setCurrentMonth(setYear(currentMonth, year));
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
      {/* Tabs de estado */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-background/60 backdrop-blur-sm">
          <TabsTrigger value="all">{payoutStateLabels.all}</TabsTrigger>
          <TabsTrigger value="pending">{payoutStateLabels.pending}</TabsTrigger>
          <TabsTrigger value="onHold">{payoutStateLabels.onHold}</TabsTrigger>
          <TabsTrigger value="processing">{payoutStateLabels.processing}</TabsTrigger>
          <TabsTrigger value="completed">{payoutStateLabels.completed}</TabsTrigger>
          <TabsTrigger value="failed">{payoutStateLabels.failed}</TabsTrigger>
          <TabsTrigger value="cancelled">{payoutStateLabels.cancelled}</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Búsqueda y fecha */}
      <div className="flex-1 flex gap-2 items-center">
        <div className="relative flex-1">
          <Input
            placeholder={t`Buscar por beneficiario, email, documento...`}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-background/50 backdrop-blur-sm border-border/50"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange('')}
              aria-label={t`Limpiar búsqueda`}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Date range picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              {dateRange?.from
                ? dateRange.to
                  ? `${format(dateRange.from, 'dd MMM', { locale: es })} - ${format(
                      dateRange.to,
                      'dd MMM',
                      { locale: es }
                    )}`
                  : format(dateRange.from, 'dd MMM', { locale: es })
                : t`Rango de fechas`}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-0">
            <div className="p-3 border-b space-y-2">
              <div className="flex gap-2">
                <Select
                  value={getMonth(currentMonth).toString()}
                  onValueChange={(value) => handleMonthChange(parseInt(value))}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={getYear(currentMonth).toString()}
                  onValueChange={(value) => handleYearChange(parseInt(value))}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCurrentMonth(new Date(getYear(currentMonth) - 1, getMonth(currentMonth)))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCurrentMonth(new Date(getYear(currentMonth) + 1, getMonth(currentMonth)))
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <CalendarComponent
              mode="range"
              selected={dateRange}
              onSelect={handleDateRangeChange}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              numberOfMonths={2}
              locale={es}
            />
          </PopoverContent>
        </Popover>

        {dateRange && (
          <Button variant="ghost" size="icon" onClick={clearDateRange} className="h-10 w-10 shrink-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Contador de resultados */}
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        {filteredCount === totalCount ? (
          <span>
            <Trans>Total: <strong className="text-foreground">{totalCount}</strong> registros</Trans>
          </span>
        ) : (
          <span>
            <Trans>Mostrando <strong className="text-foreground">{filteredCount}</strong> de{' '}
            <strong className="text-foreground">{totalCount}</strong></Trans>
          </span>
        )}
      </div>
    </div>
  );
}
