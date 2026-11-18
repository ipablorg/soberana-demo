import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';
import { VOLUME_RANGES, VOLUME_RANGE_LABELS } from '../types';
import type { VolumePricingTable, VolumeRange } from '../types';
import { VOLUME_PRICING_TABLES } from '../data/volume-pricing.data';
import { PARTNER_PRICING_TABLES } from '../data/partner-pricing.data';
import { useClientIntakeStore } from '../stores/client-intake-store';
import { IntakeBanner } from './IntakeBanner';

type ViewMode = 'standard' | 'partners';

interface PricingTableProps {
  table: VolumePricingTable;
  highlightDestination: string | null;
  highlightRange: VolumeRange | null;
}

function PricingTable({ table, highlightDestination, highlightRange }: PricingTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
              Movilizado
            </th>
            {table.corridors.map((c) => (
              <th
                key={c.corridor}
                className={cn(
                  'px-3 py-2.5 text-center font-medium text-muted-foreground',
                  highlightDestination && c.destination === highlightDestination && 'bg-primary/5 text-primary',
                )}
              >
                <div>{c.corridor}</div>
                <div className="text-[10px] font-normal">{c.destination}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {VOLUME_RANGES.map((range, rIdx) => (
            <tr
              key={range}
              className={cn(
                'border-t border-border/30 transition-colors hover:bg-muted/20',
                highlightRange === range && 'bg-primary/5',
              )}
            >
              <td className="whitespace-nowrap px-3 py-2 font-medium text-foreground">
                {VOLUME_RANGE_LABELS[range]}
              </td>
              {table.corridors.map((c) => {
                const isCellHighlighted =
                  highlightDestination === c.destination && highlightRange === range;

                return (
                  <td
                    key={c.corridor}
                    className={cn(
                      'px-3 py-2 text-center font-mono tabular-nums',
                      isCellHighlighted && 'ring-2 ring-inset ring-primary rounded bg-primary/10',
                    )}
                  >
                    {c.rates[range] ? (
                      <span className={cn(
                        'text-foreground',
                        rIdx >= 4 && 'font-medium text-success',
                        isCellHighlighted && 'font-bold text-primary',
                      )}>
                        {c.rates[range]}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function VolumePricingSection() {
  const intake = useClientIntakeStore();
  const [viewMode, setViewMode] = useState<ViewMode>('standard');

  const tables = viewMode === 'standard' ? VOLUME_PRICING_TABLES : PARTNER_PRICING_TABLES;

  const highlightOrigin = intake.completed ? intake.originCountry : null;
  const highlightDest = intake.completed ? intake.destinationCountry : null;
  const highlightRange = intake.completed ? intake.volumeRange : null;

  return (
    <div className="space-y-6">
      <IntakeBanner />
      <header>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Pricing por Volumen Movilizado
            </h1>
            <p className="text-sm text-muted-foreground">
              Tarifas escalonadas por rango de volumen — 6 rangos desde 0 hasta +40MM USD
            </p>
          </div>
        </div>
      </header>

      {/* Toggle */}
      <div className="flex gap-2 rounded-xl bg-muted/50 p-1">
        <button
          onClick={() => setViewMode('standard')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150',
            viewMode === 'standard'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <BarChart3 className="h-4 w-4" />
          Estándar
        </button>
        <button
          onClick={() => setViewMode('partners')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150',
            viewMode === 'partners'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Users className="h-4 w-4" />
          Aliados
        </button>
      </div>

      {/* Tables */}
      <div className="space-y-8">
        {tables.map((table, idx) => (
          <motion.section
            key={table.origin}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="space-y-3"
          >
            <h2 className="font-heading text-base font-semibold text-foreground">
              {table.label}
            </h2>
            <PricingTable
              table={table}
              highlightDestination={table.origin === highlightOrigin ? highlightDest : null}
              highlightRange={table.origin === highlightOrigin ? highlightRange : null}
            />
          </motion.section>
        ))}
      </div>
    </div>
  );
}
