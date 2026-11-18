import { Button } from '@/shared/components/ui/button';
import { Calendar as CalendarComponent } from '@/shared/components/ui/calendar';
import { Input } from '@/shared/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Search, X } from '@/shared/components/animated-icons';
import { useEffect, useRef, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import type { PayinState } from '../types';

interface PayinsToolbarProps {
  onSearchChange: (searchTerm: string) => void;
  onStateChange: (state: PayinState | 'all') => void;
  onDateRangeChange: (from?: Date, to?: Date) => void;
  totalCount: number;
  filteredCount: number;
}

const payinStateLabels = {
  all: 'Todos',
  pending: 'Pendientes',
  accepted: 'Aceptados',
  rejected: 'Rechazados',
  processing: 'En proceso',
  failed: 'Fallidos',
  cancelled: 'Cancelados',
};

export function PayinsToolbar({
  onSearchChange,
  onStateChange,
  onDateRangeChange,
  totalCount,
  filteredCount,
}: PayinsToolbarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<PayinState | 'all'>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange(searchTerm);
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchTerm]);

  useEffect(() => {
    onStateChange(selectedState);
  }, [selectedState]);

  useEffect(() => {
    onDateRangeChange(dateRange?.from, dateRange?.to);
  }, [dateRange]);

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
      {/* Tabs de estado */}
      <Tabs value={selectedState} onValueChange={(v) => setSelectedState(v as PayinState | 'all')}>
        <TabsList className="bg-background/60 backdrop-blur-sm">
          {Object.entries(payinStateLabels).map(([key, label]) => (
            <TabsTrigger key={key} value={key} className="capitalize">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {/* Búsqueda y fecha */}
      <div className="flex-1 flex gap-2 items-center">
        <div className="relative flex-1">
          <Input
            placeholder="Buscar por referencia, origen, producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/50 backdrop-blur-sm border-border/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              aria-label="Limpiar búsqueda"
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
                : 'Rango de fechas'}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-0">
            <CalendarComponent
              initialFocus
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              locale={es}
            />
          </PopoverContent>
        </Popover>
      </div>
      {/* Contador de resultados */}
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        {filteredCount === totalCount ? (
          <span>
            Total: <strong className="text-foreground">{totalCount}</strong> payins
          </span>
        ) : (
          <span>
            Mostrando <strong className="text-foreground">{filteredCount}</strong> de{' '}
            <strong className="text-foreground">{totalCount}</strong>
          </span>
        )}
      </div>
    </div>
  );
}
