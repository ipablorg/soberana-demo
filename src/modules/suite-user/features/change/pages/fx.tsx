import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/shared/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { DisabledWrapper } from '@/shared/components/DisabledWrapper';
import { AgenticTile } from "@/shared/components/common/AgenticTile";
import { PageTransition, StaggerList, StaggerItem } from "@/shared/components/motion/PageTransition";
import { getPresetsByCategory, getPresetById, type AgenticPreset } from "@/shared/lib/agentic-presets";
import { ArrowRight, CheckCircle2, Clock, TrendingDown, Receipt, Copy, Lock, RefreshCw } from "@/shared/components/animated-icons";
import { toast } from "sonner";
import { Trans, useLingui } from "@lingui/react/macro";
import { TypewriterText } from "@/shared/components/common/TypewriterText";
import { PageHeader } from "@/shared/components/common/PageHeader";
import { useMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/lib/utils";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Stepper } from '@/shared/components/ui/stepper';

const inputFieldClass = "flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

export default function ConvertFX() {
  const { t } = useLingui();
  const isMobile = useMobile();
  const [selectedPreset, setSelectedPreset] = useState<AgenticPreset | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [receiptId, setReceiptId] = useState("");
  const [rateLocked, setRateLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(30);

  const convertPresets = getPresetsByCategory("convert");

  useEffect(() => {
    if (rateLocked && lockCountdown > 0) {
      const timer = setTimeout(() => setLockCountdown(lockCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (lockCountdown === 0) {
      setRateLocked(false);
      toast.error(t`La tasa expiró — solicita una nueva`);
    }
  }, [rateLocked, lockCountdown]);

  const handleTileClick = (presetId: string) => {
    const preset = getPresetById(presetId);
    if (preset) {
      setSelectedPreset(preset);
      setFormData({});
      setRateLocked(false);
      setShowPreview(true);
    }
  };

  const handleLockRate = () => {
    setRateLocked(true);
    setLockCountdown(30);
    toast.success(t`Tasa bloqueada por 30 segundos`);
  };

  const handleConfirm = () => {
    if (!rateLocked) {
      toast.error(t`Bloquea la tasa primero para continuar`);
      return;
    }
    setExecuting(true);
    setTimeout(() => {
      setExecuting(false);
      setShowPreview(false);
      const mockId = `FX-${Date.now().toString(36).toUpperCase()}`;
      setReceiptId(mockId);
      setShowSuccess(true);
      toast.success(t`Conversión completada`);
    }, 1500);
  };

  return (
    <PageTransition className={isMobile ? "space-y-4 p-4" : "space-y-6 p-6"}>
      <DisabledWrapper feature="fx-conversion">
        {!isMobile && (
          <PageHeader 
            title={t`Conversión FX`}
            subtitle={t`Convierte entre monedas con tasa bloqueada.`}
          />
        )}

      <StaggerList className={isMobile ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
        {convertPresets.map((preset) => (
          <StaggerItem key={preset.id}>
            <AgenticTile
              icon={RefreshCw}
              title={preset.title}
              subtitle={preset.subtitle}
              badges={preset.badges}
              onClick={() => handleTileClick(preset.id)}
            />
          </StaggerItem>
        ))}
      </StaggerList>

      <Sheet open={showPreview} onOpenChange={setShowPreview}>
        <SheetContent
          className={cn(
            "border-0 bg-transparent p-0 text-foreground",
            isMobile ? "h-dvh w-full rounded-none" : "sm:max-w-2xl",
          )}
        >
          <Card
            className="mx-auto h-full"
          ><div className={cn("flex flex-col gap-8 p-6", isMobile ? "h-full overflow-y-auto" : undefined)}>
            <SheetHeader className="flex flex-col gap-5">
              <div className="space-y-2">
                <SheetTitle className="text-2xl font-semibold text-foreground">
                  {selectedPreset?.title}
                </SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">
                  {selectedPreset?.subtitle}
                </SheetDescription>
              </div>
            </SheetHeader>

            <div className="text-center py-2">
              <h2 className="font-heading text-lg font-semibold text-foreground">
                <TypewriterText
                  text={
                    rateLocked
                      ? t`Confirma la conversión`
                      : Object.values(formData).some(Boolean)
                        ? t`Bloquea la tasa de cambio`
                        : t`¿Qué montos quieres convertir?`
                  }
                  speed={30}
                  delay={0}
                />
              </h2>
            </div>

            <Stepper
              activeIndex={rateLocked ? 2 : Object.values(formData).some(Boolean) ? 1 : 0}
              steps={[
                { title: t`Detalles`, helper: t`Montos y cuentas` },
                { title: t`Ruta`, helper: t`Bloquea la tasa` },
                { title: t`Confirmar`, helper: t`Ejecuta y guarda` },
              ]}
            />

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
                        className={cn(
                          inputFieldClass,
                          "flex items-center justify-between gap-3 text-sm font-medium text-foreground/85",
                        )}
                      >
                        <SelectValue placeholder={t`Elige una opción`} />
                      </SelectTrigger>
                      <SelectContent className="border border-border bg-card text-foreground backdrop-blur-xl">
                        <SelectItem value="account1"><Trans>Cuenta USD Principal</Trans></SelectItem>
                        <SelectItem value="account2"><Trans>Cuenta COP Local</Trans></SelectItem>
                        <SelectItem value="account3"><Trans>Cuenta BRL Brasil</Trans></SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={`input-${i}`}
                      type={input.type}
                      placeholder={input.placeholder}
                      value={formData[input.label] || ""}
                      onChange={(e) => setFormData({ ...formData, [input.label]: e.target.value })}
                    />
                  )}
                </div>
              ))}

              <Card className="bg-muted p-6"><div className="space-y-4">
                <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span><Trans>Tasa de cambio</Trans></span>
                  </div>
                  {rateLocked && (
                    <Badge variant="secondary" className="gap-1"><Lock className="h-3 w-3" />{lockCountdown}s</Badge>
                  )}
                </div>
                <p className="text-3xl font-semibold font-mono tabular-nums text-foreground">1 USD = 4,250.00 COP</p>
                <p className="text-xs text-muted-foreground"><Trans>Tasa indicativa · Actualizada hace 2 min</Trans></p>

                {!rateLocked && (
                  <Button variant="default" className="w-full" onClick={handleLockRate}>
                    <Lock className="h-4 w-4" />
                    <Trans>Bloquear tasa por 30s</Trans>
                  </Button>
                )}

                <div className="flex items-start gap-3 border-t border-border/50 pt-4 text-sm">
                  <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1 text-muted-foreground">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      <Trans>¿Por qué esta ruta?</Trans>
                    </span>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {selectedPreset?.flow.whyExplanation}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Badge variant="secondary" className="gap-1"><TrendingDown className="h-3 w-3" /><Trans>Mejor tasa</Trans></Badge>
                  <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" /><Trans>Sin slippage</Trans></Badge>
                </div>
              </div></Card>
            </div>

            <SheetFooter className="flex flex-col gap-3 border-t border-border/50 pt-6 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => setShowPreview(false)} className="w-full sm:w-auto">
                <Trans>Cancelar</Trans>
              </Button>
              <Button
                variant="default"
                onClick={handleConfirm}
                disabled={executing || !rateLocked}
                className="w-full sm:w-auto"
              >
                {executing ? t`Un momento...` : t`Confirmar conversión`}
              </Button>
            </SheetFooter>
          </div></Card>
        </SheetContent>
      </Sheet>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent
          className={cn(
            "space-y-6 border border-border bg-background shadow-sm",
            isMobile ? "h-dvh max-w-none rounded-none p-6" : "sm:max-w-md",
          )}
        >
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-6 w-6" />
              <DialogTitle className="text-xl font-semibold text-foreground"><Trans>Conversión completada</Trans></DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              <Trans>Se ejecutó con la tasa que bloqueaste.</Trans>
            </DialogDescription>
          </DialogHeader>

          <Card className="bg-muted/50 p-6"><div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span><Trans>ID de conversión</Trans></span>
              <div className="flex items-center gap-2">
                <code className="rounded-lg bg-muted px-3 py-1 text-xs font-mono tabular-nums text-foreground">{receiptId}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Copiar ID"
                  onClick={() => {
                    navigator.clipboard.writeText(receiptId);
                    toast.success(t`ID copiado`);
                  }}
                  className="h-8 w-8"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span><Trans>Tasa ejecutada</Trans></span>
              <span className="font-mono tabular-nums">1 USD = 4,250.00 COP</span>
            </div>
          </div></Card>

          <DialogFooter className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setShowSuccess(false)}>
              <Receipt className="h-4 w-4" />
              <Trans>Ver en historial</Trans>
            </Button>
            <Button variant="default" className="w-full sm:w-auto" onClick={() => setShowSuccess(false)}>
              <Trans>Nueva conversión</Trans>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </DisabledWrapper>
    </PageTransition>
  );
}
