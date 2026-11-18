import { FileText } from '@/shared/components/animated-icons';
import { CASE_EXAMPLE } from '../data/case-example.data';

export function CaseSimulator() {
  const data = CASE_EXAMPLE;

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
            <FileText className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Caso de Ejemplo
            </h1>
            <p className="text-sm text-muted-foreground">
              Simulación con tasas de referencia, cálculos USDT, pricing Colombia
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Reference rates */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 font-heading text-sm font-semibold text-foreground">
            Tasas de Referencia
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">TRM Referencia</p>
              <p className="font-heading text-lg font-bold font-mono tabular-nums text-foreground">
                {data.referenceTrm.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Spread</p>
              <p className="font-heading text-lg font-bold font-mono tabular-nums text-foreground">
                {data.spread}
              </p>
            </div>
          </div>
        </div>

        {/* Main calculations */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 font-heading text-sm font-semibold text-foreground">
            Cálculos Principales
          </h2>
          <div className="space-y-2">
            {data.calculations.map((calc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-muted/30"
              >
                <span className="text-sm text-muted-foreground">{calc.label}</span>
                <span className="font-mono text-sm font-medium tabular-nums text-foreground">
                  {calc.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* USDT */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 font-heading text-sm font-semibold text-foreground">
            Operación USDT
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between rounded-lg bg-muted/30 px-3 py-2">
              <span className="text-sm text-muted-foreground">USDT</span>
              <span className="font-mono text-sm tabular-nums text-foreground">
                {data.usdt.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between px-3 py-2">
              <span className="text-sm text-muted-foreground">Fee Rate</span>
              <span className="font-mono text-sm tabular-nums text-foreground">{data.usdt.feeRate}</span>
            </div>
            <div className="flex justify-between px-3 py-2">
              <span className="text-sm text-muted-foreground">Fee USDT</span>
              <span className="font-mono text-sm tabular-nums text-foreground">{data.usdt.feeUsdt}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-primary/5 px-3 py-2 ring-1 ring-primary/10">
              <span className="text-sm font-medium text-primary">Total USDT</span>
              <span className="font-mono text-sm font-bold tabular-nums text-foreground">
                {data.usdt.totalUsdt}
              </span>
            </div>
          </div>
        </div>

        {/* Colombia pricing */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 font-heading text-sm font-semibold text-foreground">
            Pricing Colombia
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between rounded-lg bg-muted/30 px-3 py-2">
              <span className="text-sm text-muted-foreground">USDT</span>
              <span className="font-mono text-sm tabular-nums text-foreground">
                {data.colombiaPricing.usdt}
              </span>
            </div>
            <div className="flex justify-between px-3 py-2">
              <span className="text-sm text-muted-foreground">COP</span>
              <span className="font-mono text-sm tabular-nums text-foreground">
                {data.colombiaPricing.cop}
              </span>
            </div>
            <div className="flex justify-between px-3 py-2">
              <span className="text-sm text-muted-foreground">Unidades</span>
              <span className="font-mono text-sm tabular-nums text-foreground">
                {data.colombiaPricing.units.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between px-3 py-2">
              <span className="text-sm text-muted-foreground">Spread COP</span>
              <span className="font-mono text-sm tabular-nums text-foreground">
                {data.colombiaPricing.spreadCop}
              </span>
            </div>
          </div>
        </div>

        {/* Recaudo */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 font-heading text-sm font-semibold text-foreground">
            Recaudo
          </h2>
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-muted/50 px-4 py-3">
              <p className="text-xs text-muted-foreground">Tasa</p>
              <p className="font-heading text-lg font-bold font-mono tabular-nums text-foreground">
                {data.recaudo.rate}
              </p>
            </div>
            <div className="rounded-xl bg-muted/50 px-4 py-3">
              <p className="text-xs text-muted-foreground">Bips</p>
              <p className="font-heading text-lg font-bold font-mono tabular-nums text-foreground">
                {data.recaudo.bips}
              </p>
            </div>
          </div>
        </div>

        {/* Container payments */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 font-heading text-sm font-semibold text-foreground">
            Pagos de Contenedores
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between rounded-lg bg-muted/30 px-3 py-2">
              <span className="text-sm text-muted-foreground">Total COP</span>
              <span className="font-mono text-sm tabular-nums text-foreground">
                {data.containerPayments.totalCop}
              </span>
            </div>
            <div className="flex justify-between px-3 py-2">
              <span className="text-sm text-muted-foreground">Fee COP</span>
              <span className="font-mono text-sm tabular-nums text-foreground">
                {data.containerPayments.feeCop}
              </span>
            </div>
            <div className="flex justify-between px-3 py-2">
              <span className="text-sm text-muted-foreground">Fee Rate</span>
              <span className="font-mono text-sm tabular-nums text-foreground">
                {data.containerPayments.feeRate}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">TRM secundaria:</strong> {data.secondaryTrm} — Valor COP: {data.secondaryValueCop}
        </p>
      </div>
    </div>
  );
}
