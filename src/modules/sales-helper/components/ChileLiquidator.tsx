import { Flag } from '@/shared/components/animated-icons';
import { CHILE_COST_ITEMS, CHILE_TOTAL_COST, CHILE_MIN_OPERATION, CHILE_MIN_RATE } from '../data/chile-costs.data';

export function ChileLiquidator() {
  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
            <Flag className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Liquidador Chile — USDT/CHL
            </h1>
            <p className="text-sm text-muted-foreground">
              Costos operativos por operación en Chile
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-xl space-y-4">
        {/* Header info */}
        <div className="flex gap-4">
          <div className="flex-1 rounded-xl bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Operación mínima</p>
            <p className="font-heading text-lg font-bold font-mono tabular-nums text-foreground">
              ${CHILE_MIN_OPERATION.toLocaleString('en-US')}.00
            </p>
          </div>
          <div className="flex-1 rounded-xl bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Tasa mínima</p>
            <p className="font-heading text-lg font-bold font-mono tabular-nums text-foreground">
              {CHILE_MIN_RATE}
            </p>
          </div>
        </div>

        {/* Cost breakdown */}
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Concepto</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">%</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">USD</th>
              </tr>
            </thead>
            <tbody>
              {CHILE_COST_ITEMS.map((item, idx) => (
                <tr key={idx} className="border-t border-border/30 transition-colors hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-medium text-foreground">{item.concept}</td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                    {item.percentage ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-foreground">
                    ${item.amountUsd.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-primary/5">
                <td className="px-4 py-3 font-heading font-semibold text-foreground">Total costos</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-right font-heading font-bold font-mono tabular-nums text-primary">
                  ${CHILE_TOTAL_COST.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p className="text-xs text-muted-foreground">
          Costos calculados sobre una operación de referencia de ${CHILE_MIN_OPERATION.toLocaleString('en-US')} USD.
        </p>
      </div>
    </div>
  );
}
