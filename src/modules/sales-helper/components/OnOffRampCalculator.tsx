import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bitcoin, ArrowDown } from '@/shared/components/animated-icons';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';
import { OFF_RAMP_CORRIDORS, ON_RAMP_CORRIDORS, CLIENT_RATES } from '../data/corridors.data';
import type { CalculatorCorridor } from '../types';
import { useClientIntakeStore } from '../stores/client-intake-store';
import { IntakeBanner } from './IntakeBanner';
import { VOLUME_RANGE_MIN_VALUES } from '../data/wizard.data';

function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

type RampType = 'ON_RAMP' | 'OFF_RAMP';

export function OnOffRampCalculator() {
  const intake = useClientIntakeStore();
  const [rampType, setRampType] = useState<RampType>('ON_RAMP');
  const [corridor, setCorridor] = useState('COP/USDT');
  const [initialValue, setInitialValue] = useState(50_000_000);
  const [commissionRate, setCommissionRate] = useState(0.50);
  const [conversionRate, setConversionRate] = useState(4000);

  useEffect(() => {
    if (!intake.completed) return;
    if (intake.productType === 'Off Ramp') {
      setRampType('OFF_RAMP');
      if (intake.corridor) {
        const match = OFF_RAMP_CORRIDORS.find((c) => c.value === intake.corridor);
        if (match) setCorridor(match.value);
      }
    } else if (intake.productType === 'On Ramp') {
      setRampType('ON_RAMP');
      if (intake.corridor) {
        const match = ON_RAMP_CORRIDORS.find((c) => c.value === intake.corridor);
        if (match) setCorridor(match.value);
      }
    }
    if (intake.volumeRange) {
      setInitialValue(VOLUME_RANGE_MIN_VALUES[intake.volumeRange]);
    }
  }, [intake.completed, intake.corridor, intake.productType, intake.volumeRange]);

  const corridors: CalculatorCorridor[] =
    rampType === 'ON_RAMP' ? ON_RAMP_CORRIDORS : OFF_RAMP_CORRIDORS;

  const result = useMemo(() => {
    const commission = initialValue * (commissionRate / 100);
    const netAmount = initialValue - commission;
    const convertedValue = netAmount / conversionRate;
    const spreadPercent =
      conversionRate > 0
        ? ((initialValue / conversionRate - convertedValue) /
            (initialValue / conversionRate)) *
          100
        : 0;
    return { commission, netAmount, convertedValue, spreadPercent };
  }, [initialValue, commissionRate, conversionRate]);

  return (
    <div className="space-y-6">
      <IntakeBanner />
      <header>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
            <Bitcoin className="h-5 w-5 text-success" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Calculadora On/Off Ramp
            </h1>
            <p className="text-sm text-muted-foreground">
              Cotización para operaciones crypto — On Ramp y Off Ramp
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6">
            {/* Toggle On/Off */}
            <div className="mb-5 flex gap-2 rounded-xl bg-muted/50 p-1">
              {(['ON_RAMP', 'OFF_RAMP'] as RampType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setRampType(type);
                    const newCorridors = type === 'ON_RAMP' ? ON_RAMP_CORRIDORS : OFF_RAMP_CORRIDORS;
                    setCorridor(newCorridors[0].value);
                  }}
                  className={cn(
                    'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
                    rampType === type
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {type === 'ON_RAMP' ? 'On Ramp' : 'Off Ramp'}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Tipo de operación
                </label>
                <select
                  value={corridor}
                  onChange={(e) => setCorridor(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
                >
                  {corridors.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Valor inicial</label>
                <Input
                  type="number"
                  value={initialValue}
                  onChange={(e) => setInitialValue(Number(e.target.value))}
                  className="font-mono tabular-nums"
                />
              </div>

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

              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">Saldo a enviar</p>
                <p className="font-heading text-xl font-bold font-mono tabular-nums text-foreground">
                  {formatNumber(result.netAmount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Comisión: {formatNumber(result.commission)}
                </p>
              </div>

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

              <motion.div
                className="rounded-xl bg-success/5 p-5 ring-1 ring-success/20"
                layout
              >
                <p className="text-xs font-medium text-success">Valor convertido final</p>
                <p className="font-heading text-2xl font-bold font-mono tabular-nums text-foreground">
                  {formatNumber(result.convertedValue)}
                </p>
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{corridor}</span>
                  <span>Tasa: {conversionRate.toLocaleString()}</span>
                  <span className="font-medium text-warning">
                    Margen: {result.spreadPercent.toFixed(2)}%
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Corredores Off Ramp
            </h3>
            <ul className="space-y-1">
              {OFF_RAMP_CORRIDORS.map((c) => (
                <li key={c.value}>
                  <button
                    onClick={() => { setRampType('OFF_RAMP'); setCorridor(c.value); }}
                    className={cn(
                      'w-full rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors',
                      corridor === c.value && rampType === 'OFF_RAMP'
                        ? 'bg-warning/10 font-medium text-warning'
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
              Corredores On Ramp
            </h3>
            <ul className="space-y-1">
              {ON_RAMP_CORRIDORS.map((c) => (
                <li key={c.value}>
                  <button
                    onClick={() => { setRampType('ON_RAMP'); setCorridor(c.value); }}
                    className={cn(
                      'w-full rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors',
                      corridor === c.value && rampType === 'ON_RAMP'
                        ? 'bg-success/10 font-medium text-success'
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
