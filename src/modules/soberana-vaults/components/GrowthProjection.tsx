/**
 * Section 9 — Proyección de Crecimiento
 * 3 scenarios (conservative 30%, moderate 70%, aggressive 117%)
 * Recharts area chart + data table
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { GROWTH_SCENARIOS, computeGrowthTable } from '../data/static-data';

const INITIAL_CAPITAL = 1409;

function formatUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function GrowthProjection() {
  const [capital, setCapital] = useState(INITIAL_CAPITAL);
  const tableData = computeGrowthTable(capital, GROWTH_SCENARIOS, 5, 2026);

  return (
    <section id="growth-projection" className="scroll-mt-20 space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Proyección
        </p>
        <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Crecimiento Compuesto
        </h2>
        <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Basado en resultados reales de backtesting. El auto-compound reinvierte fees
          diariamente, acelerando el crecimiento exponencial.
        </p>
      </motion.div>

      {/* Scenario legend */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="grid gap-3 sm:grid-cols-3"
      >
        {GROWTH_SCENARIOS.map((s) => (
          <div
            key={s.id}
            className="rounded-xl border border-border bg-card p-4 space-y-1"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ background: s.color }}
              />
              <p className="text-sm font-semibold text-foreground">{s.name}</p>
              <span className="ml-auto font-mono text-sm font-bold tabular-nums text-foreground">
                {s.apr}% APR
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{s.description}</p>
            <p className="text-[10px] text-muted-foreground/70">{s.basis}</p>
          </div>
        ))}
      </motion.div>

      {/* Capital input */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/40 p-4"
      >
        <p className="text-sm text-muted-foreground">Capital inicial simulado:</p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">$</span>
          <input
            type="number"
            value={capital}
            onChange={(e) => setCapital(Math.max(1, Number(e.target.value)))}
            className="w-28 rounded-lg border border-input bg-transparent px-3 py-1.5 font-mono text-sm tabular-nums text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            min={1}
            step={100}
          />
        </div>
        <p className="text-xs text-muted-foreground/60">
          Ajusta para simular tu capital
        </p>
      </motion.div>

      {/* Area chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="rounded-xl border border-border bg-card p-5 space-y-4"
      >
        <p className="text-sm font-semibold text-foreground">
          Proyección a 5 años — Capital: {formatUSD(capital)}
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={tableData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <defs>
              {GROWTH_SCENARIOS.map((s) => (
                <linearGradient key={s.id} id={`grad-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0.0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatUSD}
              width={56}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                fontSize: 12,
                color: 'var(--foreground)',
              }}
              formatter={(value: number, name: string) => {
                const scenario = GROWTH_SCENARIOS.find((s) => s.id === name);
                return [formatUSD(value), scenario?.name ?? name];
              }}
            />
            <Legend
              formatter={(value) => {
                const s = GROWTH_SCENARIOS.find((sc) => sc.id === value);
                return s ? `${s.name} (${s.apr}% APR)` : value;
              }}
              wrapperStyle={{ fontSize: 11, color: 'var(--muted-foreground)' }}
            />
            {GROWTH_SCENARIOS.map((s) => (
              <Area
                key={s.id}
                type="monotone"
                dataKey={s.id}
                stroke={s.color}
                fill={`url(#grad-${s.id})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Data table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="rounded-xl border border-border bg-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Año
                </th>
                {GROWTH_SCENARIOS.map((s) => (
                  <th
                    key={s.id}
                    className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    {s.name} ({s.apr}%)
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => (
                <tr
                  key={row.year}
                  className={`border-b border-border/50 ${
                    i % 2 === 0 ? '' : 'bg-muted/20'
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-foreground">
                    {row.year}
                  </td>
                  {GROWTH_SCENARIOS.map((s) => (
                    <td
                      key={s.id}
                      className="px-4 py-3 text-right font-mono text-sm tabular-nums text-foreground"
                    >
                      {formatUSD(row[s.id] as number)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="rounded-md border border-border bg-muted/40 px-4 py-3"
      >
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Advertencia:</span> Las
          proyecciones son estimaciones basadas en backtesting histórico. Los resultados
          pasados no garantizan rendimientos futuros. Las condiciones de mercado,
          la volatilidad de SOL y las comisiones reales pueden variar significativamente.
          Las proyecciones asumen reinversión diaria y no incluyen impuestos.
        </p>
      </motion.div>
    </section>
  );
}
