/**
 * HowItWorksDialog Component
 * 
 * Dialog/Modal showing instructions on how Bridge works
 * Triggered by a help button in the page header
 */

import { Trans, useLingui } from '@lingui/react/macro';
import { HelpCircle, Zap, Snowflake, Lock, CheckCircle2 } from '@/shared/components/animated-icons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { TypewriterText } from '@/shared/components/common/TypewriterText';
import { cn } from '@/shared/lib/utils';

interface HowItWorksDialogProps {
  className?: string;
}

export function HowItWorksDialog({ className }: HowItWorksDialogProps) {
  const { t } = useLingui();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'rounded-xl hover:bg-background/40 transition-colors',
            className
          )}
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          <Trans>¿Cómo funciona?</Trans>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl border border-border bg-card backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            <Trans>¿Cómo funciona Bridge?</Trans>
          </DialogTitle>
          <DialogDescription className="text-base">
            <TypewriterText text={t`Conecta tus cuentas fiat y crypto con tasas garantizadas`} speed={25} delay={0} />
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* Step by step */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                1
              </span>
              <Trans>¿Qué monedas quieres cambiar?</Trans>
            </h3>
            <p className="text-sm text-muted-foreground pl-10">
              <Trans>Elige el par USDT con la moneda fiat que deseas operar (COP, USD, MXN, BRL, EUR, ARS). Puedes ver todas las tasas disponibles en tiempo real en el panel lateral.</Trans>
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                2
              </span>
              <Trans>¿Qué tipo de operación?</Trans>
            </h3>
            <div className="pl-10 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-background/40 backdrop-blur-sm border border-border/20">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-sm"><Trans>Instantáneo (X pres)</Trans></p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <Trans>Conversión inmediata con la tasa actual. Ideal para operaciones rápidas.</Trans>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-xl bg-background/40 backdrop-blur-sm border border-border/20">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Snowflake className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm"><Trans>Congelado (X rate)</Trans></p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <Trans>Congela la tasa actual por un tiempo determinado (3-15 min). Perfecto para asegurar un precio antes de transferir.</Trans>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-xl bg-background/40 backdrop-blur-sm border border-border/20">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="font-semibold text-sm"><Trans>Cierre (3x, Pre X)</Trans></p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <Trans>Cierra la tasa con pre-fondeo o múltiples cierres. Para operaciones más complejas con tiempo extendido.</Trans>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                3
              </span>
              <Trans>Confirma y listo</Trans>
            </h3>
            <p className="text-sm text-muted-foreground pl-10">
              <Trans>Ingresa el monto en USDT, selecciona las cuentas origen y destino, y confirma la operación. Verás un resumen con el monto a recibir, comisiones y tiempo estimado.</Trans>
            </p>
          </div>
          
          {/* Important notes */}
          <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-3">
            <h4 className="font-semibold flex items-center gap-2 text-primary">
              <CheckCircle2 className="w-5 h-5" />
              <Trans>Notas importantes</Trans>
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold shrink-0">•</span>
                <span><Trans>Las tasas están en tiempo real y pueden variar según el mercado</Trans></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold shrink-0">•</span>
                <span><Trans>Los productos congelados y de cierre garantizan la tasa por el tiempo indicado</Trans></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold shrink-0">•</span>
                <span><Trans>La comisión es de 0.2% sobre el monto convertido</Trans></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold shrink-0">•</span>
                <span><Trans>Tu historial de operaciones está siempre disponible</Trans></span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

