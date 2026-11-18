import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, ArrowDown, Calculator } from '@/shared/components/animated-icons';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';
import { COMEX_CORRIDORS, CLIENT_RATES } from '../data/corridors.data';
import { useClientIntakeStore } from '../stores/client-intake-store';
import { IntakeBanner } from './IntakeBanner';
import { VOLUME_RANGE_MIN_VALUES } from '../data/wizard.data';

function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function ComexCalculator() {
  const intake = useClientIntakeStore();
  const [corridor, setCorridor] = useState(COMEX_CORRIDORS[0].value);
  const [initialValue, setInitialValue] = useState(20_000_000);
  const [commissionRate, setCommissionRate] = useState(0.65);
  const [conversionRate, setConversionRate] = useState(3760);

  useEffect(() => {
    if (!intake.completed) return;
    if (intake.corridor) {
      const match = COMEX_CORRIDORS.find((c) => c.value === intake.corridor);
      if (match) setCorridor(match.value);
    }
    if (intake.volumeRange) {
      setInitialValue(VOLUME_RANGE_MIN_VALUES[intake.volumeRange]);
    }
  }, [intake.completed, intake.corridor, intake.volumeRange]);

  const result = useMemo(() => {
    const commission = initialValue * (commissionRate / 100);
    const netAmount = initialValue - commission;
    const convertedValue = netAmount * conversionRate;
    return { commission, netAmount, convertedValue };
  }, [initialValue, commissionRate, conversionRate]);

  return (
    <div className="space-y-6">
      <IntakeBanner />
      <header>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Calculadora COMEX
            </h1>
            <p className="text-sm text-muted-foreground">
              Cotización de operaciones de comercio exterior
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calculator */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              <h2 className="font-heading text-sm font-semibold text-foreground">
                Cotización
              </h2>
            </div>

            <div className="space-y-4">
              {/* Corridor selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Tipo de operación COMEX
                </label>
                <select
                  value={corridor}
                  onChange={(e) => setCorridor(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
                >
                  {COMEX_CORRIDORS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Initial value */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Valor inicial
                </label>
                <Input
                  type="number"
                  value={initialValue}
                  onChange={(e) => setInitialValue(Number(e.target.value))}
                  className="font-mono tabular-nums"
                />
              </div>

              {/* Commission rate */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Tasa comisión (%)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="font-mono tabular-nums"
                />
              </div>

              <div className="flex justify-center">
                <ArrowDown className="h-5 w-5 text-muted-foreground" />
              </div>

              {/* Net amount */}
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">Saldo a enviar</p>
                <p className="font-heading text-xl font-bold font-mono tabular-nums text-foreground">
                  {formatNumber(result.netAmount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Comisión: {formatNumber(result.commission)}
                </p>
              </div>

              {/* Conversion rate */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Tasa de referencia conversión
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={conversionRate}
                  onChange={(e) => setConversionRate(Number(e.target.value))}
                  className="font-mono tabular-nums"
                />
              </div>

              <div className="flex justify-center">
                <ArrowDown className="h-5 w-5 text-muted-foreground" />
              </div>

              {/* Result */}
              <motion.div
                className="rounded-xl bg-primary/5 p-5 ring-1 ring-primary/20"
                layout
              >
                <p className="text-xs font-medium text-primary">Valor convertido final</p>
                <p className="font-heading text-2xl font-bold font-mono tabular-nums text-foreground">
                  {formatNumber(result.convertedValue)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {corridor} — Tasa: {conversionRate.toLocaleString()}
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Sidebar: corridors + client rates */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Corredores COMEX
            </h3>
            <ul className="space-y-1">
              {COMEX_CORRIDORS.map((c) => (
                <li key={c.value}>
                  <button
                    onClick={() => setCorridor(c.value)}
                    className={cn(
                      'w-full rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors',
                      corridor === c.value
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {c.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tasas por cliente
            </h3>
            <div className="space-y-1">
              {CLIENT_RATES.map((client) => (
                <div
                  key={client.name}
                  className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors hover:bg-muted/50"
                >
                  <span className="text-foreground">{client.name}</span>
                  <span className="font-mono tabular-nums text-primary">{client.rate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
