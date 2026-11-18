import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Filter } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';
import { PRICING_CORRIDORS } from '../data/pricing-master.data';
import type { PricingCurrency } from '../types';
import { useClientIntakeStore } from '../stores/client-intake-store';
import { IntakeBanner } from './IntakeBanner';

const CURRENCIES: PricingCurrency[] = ['USDT', 'COP', 'USD', 'SOLES', 'EUR'];

const currencyColors: Record<PricingCurrency, string> = {
  USDT: 'bg-success/10 text-success border-success/20',
  COP: 'bg-primary/10 text-primary border-primary/20',
  USD: 'bg-warning/10 text-warning border-warning/20',
  SOLES: 'bg-destructive/10 text-destructive border-destructive/20',
  EUR: 'bg-accent-brand/10 text-accent-brand border-accent-brand/20',
};

function corridorToCurrency(corridor: string | null): PricingCurrency | null {
  if (!corridor) return null;
  const base = corridor.split('/')[0]?.trim().toUpperCase();
  if (base === 'COP') return 'COP';
  if (base === 'USD') return 'USD';
  if (base === 'EUR') return 'EUR';
  if (base === 'USDT') return 'USDT';
  if (base === 'SOLES') return 'SOLES';
  return null;
}

export function PricingMasterSection() {
  const intake = useClientIntakeStore();
  const [activeCurrency, setActiveCurrency] = useState<PricingCurrency | 'ALL'>('ALL');

  useEffect(() => {
    if (intake.completed && intake.corridor) {
      const cur = corridorToCurrency(intake.corridor);
      if (cur) setActiveCurrency(cur);
    }
  }, [intake.completed, intake.corridor]);

  const filtered =
    activeCurrency === 'ALL'
      ? PRICING_CORRIDORS
      : PRICING_CORRIDORS.filter((c) => c.currency === activeCurrency);

  return (
    <div className="space-y-6">
      <IntakeBanner />
      <header>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Tabla Maestra de Pricing
            </h1>
            <p className="text-sm text-muted-foreground">
              Tarifas por corredor — Costo mínimo, dispersión, precio base, tarifa de inicio
            </p>
          </div>
        </div>
      </header>

      {/* Currency filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <button
            onClick={() => setActiveCurrency('ALL')}
            className={cn(
              'rounded-md border px-3 py-1 text-xs font-medium transition-colors duration-150',
              activeCurrency === 'ALL'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/50'
            )}
          >
            Todos
          </button>
          {CURRENCIES.map((cur) => (
            <button
              key={cur}
              onClick={() => setActiveCurrency(cur)}
              className={cn(
                'rounded-md border px-3 py-1 text-xs font-medium transition-colors duration-150',
                activeCurrency === cur
                  ? currencyColors[cur]
                  : 'border-border text-muted-foreground hover:border-primary/50'
              )}
            >
              {cur}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Corredor</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Divisa</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Costo mín.</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Dispersión</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Precio base</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Tarifa inicio</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tiempos</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((corridor, idx) => {
              const isHighlighted =
                intake.completed &&
                intake.corridor &&
                corridor.corridor.toLowerCase().includes(intake.corridor.toLowerCase().split('/')[0]);

              return (
              <motion.tr
                key={`${corridor.corridor}-${idx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.02 }}
                className={cn(
                  'border-b border-border/50 transition-colors hover:bg-muted/30',
                  isHighlighted && 'ring-2 ring-inset ring-primary bg-primary/5',
                )}
              >
                <td className="px-4 py-2.5 font-medium text-foreground">
                  {corridor.corridor}
                  {corridor.type && (
                    <span className="ml-2 text-[10px] text-muted-foreground">
                      ({corridor.type})
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', currencyColors[corridor.currency])}>
                    {corridor.currency}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-foreground">
                  {corridor.minCost ?? '—'}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                  {corridor.dispersion ?? '—'}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums font-medium text-foreground">
                  {corridor.basePrice ?? '—'}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-primary">
                  {corridor.startingTariff ?? '—'}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {corridor.deliveryTime ?? '—'}
                </td>
                <td className="max-w-[200px] truncate px-4 py-2.5 text-xs text-muted-foreground">
                  {corridor.observations ?? ''}
                </td>
              </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} corredor{filtered.length !== 1 ? 'es' : ''} mostrado{filtered.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
