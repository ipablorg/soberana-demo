import { Card } from '@/shared/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/ui/collapsible';
import { GitBranch, Zap, ArrowRightLeft } from '@/shared/components/animated-icons';

export interface TransferPreviewProps {
  fromLabel: string;
  toLabel: string;
  amount: number;
  fee: number;
  eta: string;
  railLabel: string;
}

export function TransferPreview({ fromLabel, toLabel, amount, fee, eta, railLabel }: TransferPreviewProps) {
  return (
    <div className="space-y-5 mt-5">
      <Card className="rounded-xl border bg-card/70 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Desde</p>
            <p className="font-semibold text-sm">{fromLabel}</p>
          </div>
          <ArrowRightLeft className="w-4 h-4 text-primary" />
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Hacia</p>
            <p className="font-semibold text-sm">{toLabel}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Monto</p>
            <p className="font-bold font-mono tabular-nums">${amount.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Fee</p>
            <p className="font-bold font-mono tabular-nums">${fee.toFixed(2)}</p>
          </div>
          <div className="rounded-xl bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">ETA</p>
            <p className="font-bold">{eta}</p>
          </div>
        </div>
      </Card>

      <Card className="rounded-xl border bg-card/70 p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold">Ruta propuesta</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{railLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="w-3.5 h-3.5" />
          Optimizada por costo y tiempo estimado
        </div>

        <div className="mt-3">
          <Collapsible>
            <CollapsibleTrigger className="text-xs text-primary hover:underline">
              ¿Por qué esta ruta?
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
              Esta recomendación balancea costos (bps) y ETA considerando disponibilidad de rails (Libro interno / SWIFT / Circle CCTP) y compliance.
            </CollapsibleContent>
          </Collapsible>
        </div>
      </Card>
    </div>
  );
}

export default TransferPreview;


