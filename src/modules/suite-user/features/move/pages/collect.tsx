import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/shared/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { AgenticTile } from "@/shared/components/common/AgenticTile";
import { PageTransition, StaggerList, StaggerItem } from "@/shared/components/motion/PageTransition";
import { getPresetsByCategory, getPresetById, type AgenticPreset } from "@/shared/lib/agentic-presets";
import { ArrowRight, CheckCircle2, AlertCircle, Clock, TrendingDown, Receipt, Copy, Check } from "@/shared/components/animated-icons";
import { toast } from "sonner";
import { TypewriterText } from "@/shared/components/common/TypewriterText";
import { PageHeader } from "@/shared/components/common/PageHeader";
import { useMobile } from '@/shared/hooks/use-mobile';
import { cn } from '@/shared/lib/utils';
import { Trans, useLingui } from '@lingui/react/macro';

interface StepperProps {
  steps: { key: string; title: string; helper: string }[];
  activeIndex: number;
}

function Stepper({ steps, activeIndex }: StepperProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-4">
      {steps.map((step, index) => {
        const isComplete = index < activeIndex;
        const isCurrent = index === activeIndex;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.key} className="relative flex-1 text-center">
            <div
              className={cn(
                "mx-auto flex h-10 w-10 items-center justify-center rounded-full text-xs transition-colors duration-150",
                isComplete && "bg-primary text-primary-foreground",
                isCurrent && "border-2 border-primary bg-background text-foreground font-semibold",
                !isComplete && !isCurrent && "border border-border bg-background text-muted-foreground",
              )}
            >
              {isComplete ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
            </div>
            <div className="mt-2 text-[11px] uppercase tracking-[0.24em]">
              <span
                className={cn(
                  "font-semibold",
                  isComplete || isCurrent ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.title}
              </span>
            </div>
            <p
              className={cn(
                "mt-1 text-[11px]",
                isCurrent ? "text-muted-foreground" : "text-muted-foreground/60",
              )}
            >
              {step.helper}
            </p>
            {!isLast && (
              <span className="pointer-events-none absolute left-[calc(50%+20px)] top-5 hidden h-px w-[calc(100%-40px)] bg-border md:block" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function MoveCollect() {
  const { t } = useLingui();
  const isMobile = useMobile();
  const [selectedPreset, setSelectedPreset] = useState<AgenticPreset | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [receiptId, setReceiptId] = useState("");

  const collectPresets = getPresetsByCategory("collect");

  const previewSteps = [
    { key: "details", title: t`Detalles`, helper: t`Monto y cuenta` },
    { key: "route", title: t`Ruta`, helper: t`Costos y velocidad` },
    { key: "confirm", title: t`Confirmar`, helper: t`Ejecuta y guarda` },
  ];

  const competitorBenchmarks = [
    { name: "dLocal", fee: "0.35%", savings: "$480" },
    { name: "Kushki", fee: "0.29%", savings: "$320" },
  ];

  const handleTileClick = (presetId: string) => {
    const preset = getPresetById(presetId);
    if (preset) {
      setSelectedPreset(preset);
      setFormData({});
      setShowPreview(true);
    }
  };

  const handleConfirm = () => {
    setExecuting(true);
    setTimeout(() => {
      setExecuting(false);
      setShowPreview(false);
      const mockId = `RX-${Date.now().toString(36).toUpperCase()}`;
      setReceiptId(mockId);
      setShowSuccess(true);
      toast.success(t`Cobro procesado`);
    }, 2000);
  };

  const handleCopyReceipt = () => {
    navigator.clipboard.writeText(receiptId);
    toast.success(t`ID copiado al portapapeles`);
  };

  const hasAnyInput = useMemo(
    () => Object.values(formData).some((value) => value !== undefined && value !== ""),
    [formData],
  );

  const allInputsFilled = useMemo(
    () =>
      (selectedPreset?.flow.inputs ?? []).every((input) => {
        const value = formData[input.label];
        return value !== undefined && value !== "";
      }),
    [formData, selectedPreset],
  );

  const activePreviewStep = useMemo(() => {
    if (executing) return 2;
    if (allInputsFilled) return 2;
    if (hasAnyInput) return 1;
    return 0;
  }, [executing, allInputsFilled, hasAnyInput]);

  return (
    <PageTransition className={isMobile ? "space-y-4 p-4" : "space-y-6 p-6"}>
      {!isMobile && (
        <PageHeader 
          title={t`Cobrar`}
          subtitle={t`Crea links y recibe fondos en cualquier moneda.`}
        />
      )}

      <StaggerList className={isMobile ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
        {collectPresets.map((preset) => (
          <StaggerItem key={preset.id}>
            <AgenticTile
              icon={Receipt}
              title={preset.title}
              subtitle={preset.subtitle}
              badges={preset.badges}
              onClick={() => handleTileClick(preset.id)}
            />
          </StaggerItem>
        ))}
      </StaggerList>

      {/* Preview Sheet */}
      <Sheet open={showPreview} onOpenChange={setShowPreview}>
        <SheetContent
          className={cn(
            isMobile ? "h-dvh w-full rounded-none sm:max-w-full" : "sm:max-w-2xl",
            "overflow-y-auto",
          )}
        >
          <div className="flex flex-col gap-8">
            <SheetHeader className="flex flex-col gap-5">
              <div className="space-y-2">
                <SheetTitle className="text-2xl font-semibold text-foreground">
                  {selectedPreset?.title}
                </SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">
                  {selectedPreset?.subtitle}
                </SheetDescription>
                {selectedPreset?.badges?.length ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedPreset.badges.map((badge) => (
                      <Badge
                        key={badge.label}
                        variant={
                          badge.variant === "secondary"
                            ? "secondary"
                            : badge.variant === "outline"
                              ? "outline"
                              : "default"
                        }
                      >
                        {badge.label}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            </SheetHeader>

            <div className="text-center py-2">
              <h2 className="font-heading text-lg font-semibold text-foreground">
                <TypewriterText
                  text={
                    executing
                      ? t`Un momento...`
                      : allInputsFilled
                        ? t`Confirma y ejecuta el cobro`
                        : hasAnyInput
                          ? t`Revisa la ruta optimizada`
                          : t`¿Cuánto quieres cobrar?`
                  }
                  speed={30}
                  delay={0}
                />
              </h2>
            </div>

            <Stepper steps={previewSteps} activeIndex={activePreviewStep} />

            <div className="space-y-7">
              {selectedPreset?.flow.inputs.map((input, i) => (
                <div key={i} className="space-y-2">
                  <Label
                    htmlFor={`input-${i}`}
                    className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground"
                  >
                    {input.label}
                  </Label>
                  {input.type === "select" ? (
                    <Select
                      value={formData[input.label] || ""}
                      onValueChange={(v) => setFormData({ ...formData, [input.label]: v })}
                    >
                      <SelectTrigger
                        id={`input-${i}`}
                        className="bg-background border-border text-sm font-medium text-foreground"
                      >
                        <SelectValue placeholder={t`Elige una opción`} />
                      </SelectTrigger>
                      <SelectContent className="border border-border bg-popover text-foreground">
                        <SelectItem value="wallet1"><Trans>Wallet Principal (USDC)</Trans></SelectItem>
                        <SelectItem value="wallet2"><Trans>Wallet Operaciones (USDC)</Trans></SelectItem>
                        <SelectItem value="account1"><Trans>Cuenta USD Treasury</Trans></SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={`input-${i}`}
                      type={input.type}
                      placeholder={input.placeholder}
                      className="font-mono tabular-nums text-lg bg-background border-border"
                      value={formData[input.label] || ""}
                      onChange={(e) => setFormData({ ...formData, [input.label]: e.target.value })}
                    />
                  )}
                </div>
              ))}

              {/* Ruta optimizada */}
              <div className="rounded-xl border border-border bg-muted/50 p-6 space-y-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <span><Trans>Ruta optimizada</Trans></span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedPreset?.flow.routeLogic}</p>

                <div className="flex items-start gap-3 border-t border-border/50 pt-4 text-sm">
                  <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
                      <Trans>¿Por qué esta ruta?</Trans>
                    </span>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {selectedPreset?.flow.whyExplanation}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <TrendingDown className="h-3 w-3" />
                    <Trans>Costo óptimo</Trans>
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <Trans>Confiable</Trans>
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <Trans>FX lock 30s</Trans>
                  </Badge>
                </div>
              </div>

              {/* Ahorro estimado */}
              <div className="rounded-xl border border-dashed border-border bg-card p-6 space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-base font-semibold text-foreground"><Trans>Ahorro estimado</Trans></p>
                  <Badge variant="outline"><Trans>vs. competidores</Trans></Badge>
                </div>
                <div className="space-y-3">
                  {competitorBenchmarks.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{item.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground"><Trans>Fee</Trans> {item.fee}</span>
                        <span className="font-semibold font-mono tabular-nums text-success">{item.savings}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground/60">
                  <Trans>Calculado con base en operaciones similares de la última semana.</Trans>
                </p>
              </div>
            </div>

            <SheetFooter className="flex flex-col gap-3 border-t border-border/50 pt-6 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => setShowPreview(false)} className="w-full sm:w-auto">
                <Trans>Cancelar</Trans>
              </Button>
              <Button variant="gradient" onClick={handleConfirm} disabled={executing} className="w-full sm:w-auto gap-2">
                {executing ? t`Un momento...` : t`Confirmar`}
              </Button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent
          className={cn(
            "space-y-6 border border-border bg-card text-card-foreground shadow-sm",
            isMobile ? "h-dvh max-w-none rounded-none p-6" : "sm:max-w-md",
          )}
        >
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3 text-success">
              <CheckCircle2 className="h-6 w-6" />
              <DialogTitle className="text-xl font-semibold text-foreground"><Trans>Cobro procesado</Trans></DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              <Trans>Tu cobro se liquidó en minutos y ahorraste comisiones frente a la banca tradicional.</Trans>
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span><Trans>ID de transacción</Trans></span>
              <div className="flex items-center gap-2">
                <code className="rounded-lg bg-muted px-3 py-1 text-xs font-mono tabular-nums text-foreground">{receiptId}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t`Copiar ID`}
                  onClick={handleCopyReceipt}
                  className="h-8 w-8"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-success/10 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-success"><Trans>Ahorro Loopay</Trans></p>
            <p className="text-sm font-semibold text-foreground">
              <Trans>Evitaste aproximadamente <span className="font-mono tabular-nums">$480 USD</span> en comisiones comparado con proveedores tradicionales.</Trans>
            </p>
          </div>

          <DialogFooter className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button
              variant="outline"
              className="w-full sm:w-auto gap-2"
              onClick={() => setShowSuccess(false)}
            >
              <Receipt className="h-4 w-4" />
              <Trans>Ver en historial</Trans>
            </Button>
            <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setShowSuccess(false)}>
              <Trans>Crear otro cobro</Trans>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
