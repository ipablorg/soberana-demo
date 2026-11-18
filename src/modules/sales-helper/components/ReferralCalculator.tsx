import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Calculator } from '@/shared/components/animated-icons';
import { Input } from '@/shared/components/ui/input';
import {
  REFERRAL_VOLUME_RANGES,
  REFERRAL_OFF_RAMP_RATES,
  REFERRAL_ON_RAMP_RATES,
  REFERRAL_COMEX_RATES,
  REFERRAL_TESORERIA_RATES,
  REFERRAL_COMPANIES_OFF_RAMP,
  REFERRAL_COMPANIES_TESORERIA,
} from '../data/referral.data';

function formatUsd(num: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function formatCop(num: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function ReferralCalculator() {
  const [customVolume, setCustomVolume] = useState(2_000_000);
  const [customRate, setCustomRate] = useState(0.70);
  const [customCommission, setCustomCommission] = useState(4.0);

  const customResult = useMemo(() => {
    const earnedUsd = customVolume * (customRate / 100) * (customCommission / 100);
    const earnedCop = earnedUsd * 3750;
    return { earnedUsd, earnedCop };
  }, [customVolume, customRate, customCommission]);

  const productRates = [
    { label: 'Off Ramp', data: REFERRAL_OFF_RAMP_RATES },
    { label: 'On Ramp', data: REFERRAL_ON_RAMP_RATES },
    { label: 'COMEX', data: REFERRAL_COMEX_RATES },
    { label: 'Tesorería Digital', data: REFERRAL_TESORERIA_RATES },
  ];

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Calculadora de Referidos
            </h1>
            <p className="text-sm text-muted-foreground">
              Comisiones por volumen, tasas por producto y empresas reales
            </p>
          </div>
        </div>
      </header>

      {/* Custom calculator */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          <h2 className="font-heading text-sm font-semibold text-foreground">
            Simulador personalizado
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Volumen mensual (USD)
            </label>
            <Input
              type="number"
              value={customVolume}
              onChange={(e) => setCustomVolume(Number(e.target.value))}
              className="font-mono tabular-nums"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Tasa cobrada (%)</label>
            <Input
              type="number"
              step="0.01"
              value={customRate}
              onChange={(e) => setCustomRate(Number(e.target.value))}
              className="font-mono tabular-nums"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Comisión referidor (%)
            </label>
            <Input
              type="number"
              step="0.01"
              value={customCommission}
              onChange={(e) => setCustomCommission(Number(e.target.value))}
              className="font-mono tabular-nums"
            />
          </div>
        </div>
        <motion.div className="mt-4 flex gap-4 rounded-xl bg-primary/5 p-4 ring-1 ring-primary/20" layout>
          <div>
            <p className="text-xs text-muted-foreground">Ganancia USD</p>
            <p className="font-heading text-lg font-bold font-mono tabular-nums text-foreground">
              {formatUsd(customResult.earnedUsd)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ganancia COP</p>
            <p className="font-heading text-lg font-bold font-mono tabular-nums text-foreground">
              {formatCop(customResult.earnedCop)}
            </p>
          </div>
        </motion.div>
      </section>

      {/* Volume ranges table */}
      <section className="space-y-3">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Tabla de rangos de volumen
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Vol. mensual</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Tasa cobrada</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Comisión referidor</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Ganado USD</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Ganado COP</th>
              </tr>
            </thead>
            <tbody>
              {REFERRAL_VOLUME_RANGES.map((row, idx) => (
                <tr key={idx} className="border-t border-border/30 transition-colors hover:bg-muted/20">
                  <td className="px-4 py-2 font-medium text-foreground">{row.volumeFormatted}</td>
                  <td className="px-4 py-2 text-right font-mono tabular-nums text-muted-foreground">
                    {(row.rate * 100).toFixed(2)}%
                  </td>
                  <td className="px-4 py-2 text-right font-mono tabular-nums text-muted-foreground">
                    {(row.commission * 100).toFixed(2)}%
                  </td>
                  <td className="px-4 py-2 text-right font-mono tabular-nums text-success">
                    {formatUsd(row.earnedUsd)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono tabular-nums text-foreground">
                    {formatCop(row.earnedCop)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Product rates */}
      <section className="space-y-4">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Tasas por producto
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {productRates.map(({ label, data }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 font-heading text-sm font-semibold text-foreground">{label}</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="pb-1.5 text-left font-medium text-muted-foreground">Tasa Full</th>
                    <th className="pb-1.5 text-right font-medium text-muted-foreground">Com. Referidor</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((rate, idx) => (
                    <tr key={idx} className="border-t border-border/20">
                      <td className="py-1.5 font-mono tabular-nums text-foreground">
                        {(rate.fullRate * 100).toFixed(2)}%
                      </td>
                      <td className="py-1.5 text-right font-mono tabular-nums text-primary">
                        {(rate.referrerCommission * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      {/* Real companies */}
      <section className="space-y-4">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Empresas — Off Ramp
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Empresa</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Movilizado</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Tasa</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Comisión</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Ganado USD</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Ganado COP</th>
              </tr>
            </thead>
            <tbody>
              {REFERRAL_COMPANIES_OFF_RAMP.map((company) => (
                <tr key={company.name} className="border-t border-border/30 transition-colors hover:bg-muted/20">
                  <td className="px-3 py-2 font-medium text-foreground">{company.name}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">{company.volume}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">{company.rate}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">{company.commission}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-success">{company.earnedUsd}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">{company.earnedCop}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Empresas — Tesorería Digital
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Empresa</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Movilizado</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Tasa</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Comisión</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Ganado COP</th>
              </tr>
            </thead>
            <tbody>
              {REFERRAL_COMPANIES_TESORERIA.map((company) => (
                <tr key={company.name} className="border-t border-border/30 transition-colors hover:bg-muted/20">
                  <td className="px-3 py-2 font-medium text-foreground">{company.name}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">{company.volume}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">{company.rate}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">{company.commission}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">{company.earnedCop}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
