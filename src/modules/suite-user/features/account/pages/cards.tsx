import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/shared/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Badge } from "@/shared/components/ui/badge";
import { AgenticTile } from "@/shared/components/common/AgenticTile";
import { PageTransition, StaggerList, StaggerItem } from "@/shared/components/motion/PageTransition";
import { getPresetsByCategory, getPresetById, type AgenticPreset } from "@/shared/lib/agentic-presets";
import { CreditCard, CheckCircle2, Settings, Copy, Eye, EyeOff, Sparkles, TrendingUp, Lock, ArrowRight } from "@/shared/components/animated-icons";
import { toast } from "sonner";
import { Trans, useLingui } from "@lingui/react/macro";
import { motion } from "framer-motion";
import { PageHeader } from "@/shared/components/common/PageHeader";
import { useMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/components/ui/input";

const inputFieldClass = "flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

const PANEL_CLASS =
  "relative overflow-hidden rounded-xl border border-border bg-background/30 backdrop-blur-2xl shadow-sm";


export default function AccountCards() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const isMobile = useMobile();
  const [selectedPreset, setSelectedPreset] = useState<AgenticPreset | null>(null);
  const [showIssue, setShowIssue] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [cardData, setCardData] = useState({
    number: "4532 1234 5678 9012",
    cvv: "***",
    expiry: "12/28",
  });
  const [formData, setFormData] = useState<Record<string, string>>({});

  const cardPresets = getPresetsByCategory("card");

  const cardMetrics = [
    { id: 'active' as const, label: t`Tarjetas activas`, value: '32', helper: t`8 equipos operando` },
    { id: 'spend' as const, label: t`Gasto mes`, value: '$182K', helper: t`-6% vs presupuesto` },
    { id: 'savings' as const, label: t`Ahorro Loopay`, value: '$12.4K', helper: t`cashback optimizado` },
  ];
  const controlToggles = [
    { id: 'intl' as const, label: t`Transacciones internacionales`, defaultChecked: true },
    { id: 'atm' as const, label: t`Retiros ATM`, defaultChecked: false },
    { id: 'online' as const, label: t`Compras online`, defaultChecked: true },
  ];

  const handleTileClick = (presetId: string) => {
    const preset = getPresetById(presetId);
    if (preset) {
      setSelectedPreset(preset);
      setFormData({});
      setShowIssue(true);
    }
  };

  const handleIssueCard = () => {
    setTimeout(() => {
      setShowIssue(false);
      setShowSuccess(true);
      toast.success(t`Tarjeta emitida`);
    }, 1500);
  };

  const toggleCVV = () => {
    setCardData((prev) => ({
      ...prev,
      cvv: prev.cvv === "***" ? "123" : "***",
    }));
  };

  return (
    <PageTransition className={isMobile ? "space-y-4 p-4" : "space-y-6 p-6"}>
      {!isMobile && (
        <PageHeader 
          title={t`Tarjetas`}
          subtitle={t`Crea y gestiona tarjetas virtuales.`}
        />
      )}

      {/* Loopay Card PRO Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <Card
          className={`${PANEL_CLASS} relative overflow-hidden cursor-pointer transition-colors group`}
          onClick={() => navigate("/suite/account/card-pro")}
        >
          <div className={isMobile ? "relative space-y-4 p-4" : "relative flex items-center justify-between p-6"}>
            <div className={isMobile ? "flex flex-col gap-3" : "flex items-center gap-4"}>
              <div
                className={
                  isMobile
                    ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary"
                    : "flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary"
                }
              >
                <Sparkles className={isMobile ? "h-6 w-6 text-foreground" : "h-8 w-8 text-foreground"} />
              </div>
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <h3 className={isMobile ? "text-lg font-semibold" : "text-xl font-semibold"}>Loopay Card PRO</h3>
                  <Badge variant="secondary" className="text-xs uppercase tracking-wide">
                    PRO
                  </Badge>
                </div>
                <p className={isMobile ? "mb-2 text-xs text-muted-foreground" : "mb-3 text-sm text-muted-foreground"}>
                  {isMobile
                    ? t`Gasta desde tus Vaults con rendimientos y crédito colateralizado`
                    : t`Rendimientos mientras gastas • Crédito colateralizado • Route Optimizer`}
                </p>
                <div className={isMobile ? "flex flex-col gap-2 text-xs" : "flex items-center gap-4 text-sm"}>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-primary">+5.1% APR</span>
                    <span className="text-muted-foreground">{t`en gasto activo`}</span>
                  </div>
                  {!isMobile && <div className="h-4 w-px bg-border/40" />}
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-primary">50% LTV</span>
                    <span className="text-muted-foreground">{t`línea de crédito`}</span>
                  </div>
                </div>
              </div>
            </div>
            <Button
              onClick={() => navigate("/suite/account/card-pro")}
              variant="gradient"
              className={isMobile ? "w-full justify-center" : ""}
            >
              <Trans>Ver Loopay Card PRO</Trans>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </motion.div>

      <div className={isMobile ? "grid grid-cols-1 gap-3" : "grid grid-cols-3 gap-4"}>
        {cardMetrics.map((metric) => (
          <Card key={metric.id} className={`${PANEL_CLASS} p-4`}>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.label}</p>
              <p className="text-2xl font-semibold text-foreground font-mono tabular-nums">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.helper}</p>
            </div>
          </Card>
        ))}
      </div>

      <StaggerList className={isMobile ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
        {cardPresets.map((preset) => (
          <StaggerItem key={preset.id}>
            <AgenticTile
              icon={CreditCard}
              title={preset.title}
              subtitle={preset.subtitle}
              badges={preset.badges}
              onClick={() => handleTileClick(preset.id)}
            />
          </StaggerItem>
        ))}
      </StaggerList>

      {/* Issue Card Sheet */}
      <Sheet open={showIssue} onOpenChange={setShowIssue}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={cn(
            "border-0 bg-transparent p-0 text-foreground",
            isMobile ? "h-dvh w-full rounded-none" : "sm:max-w-md",
          )}
        >
          <Card
            className={cn("mx-auto h-full", isMobile ? "rounded-none" : "rounded-l-[32px]")}
          ><div className={cn("flex flex-col gap-8 p-6", isMobile ? "h-full overflow-y-auto" : undefined)}>
            <SheetHeader className="flex flex-col gap-3 text-left">
              <SheetTitle className="text-2xl font-semibold text-foreground">
                {selectedPreset?.title}
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                {selectedPreset?.subtitle}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              {selectedPreset?.flow.inputs.map((input, i) => (
                <div key={i} className="space-y-2">
                  <Label
                    htmlFor={`input-${i}`}
                    className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground"
                  >
                    {input.label}
                  </Label>
                  {input.type === "multi-select" ? (
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
                        <SelectValue placeholder={t`Elige categorías...`} />
                      </SelectTrigger>
                      <SelectContent className="border border-border bg-card text-foreground backdrop-blur-xl">
                        <SelectItem value="software"><Trans>5734 - Software/SaaS</Trans></SelectItem>
                        <SelectItem value="marketing"><Trans>7311 - Marketing/Ads</Trans></SelectItem>
                        <SelectItem value="travel"><Trans>4722 - Viajes/Hoteles</Trans></SelectItem>
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
                <div className="text-sm font-semibold text-foreground"><Trans>Controles avanzados</Trans></div>

                <div className="space-y-3">
                  {controlToggles.map((toggle) => (
                    <div key={toggle.id} className="flex items-center justify-between text-sm text-foreground/80">
                      <Label htmlFor={toggle.id}>{toggle.label}</Label>
                      <Switch id={toggle.id} defaultChecked={toggle.defaultChecked} />
                    </div>
                  ))}
                </div>
              </div></Card>

              <Card className="bg-card p-6"><div className="text-xs text-muted-foreground">
                <span className="text-primary font-semibold"><Trans>Seguridad:</Trans></span> {selectedPreset?.flow.whyExplanation}
              </div></Card>
            </div>

            <SheetFooter className="flex flex-col gap-3 border-t border-border/50 pt-6 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => setShowIssue(false)} className="w-full sm:w-auto">
                <Trans>Cancelar</Trans>
              </Button>
              <Button variant="default" onClick={handleIssueCard} className="w-full sm:w-auto">
                <CreditCard className="h-4 w-4" />
                <Trans>Emitir tarjeta</Trans>
              </Button>
            </SheetFooter>
          </div></Card>
        </SheetContent>
      </Sheet>

      {/* Success Dialog with Card Details */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent
          className={cn(
            "space-y-6 border border-border bg-card text-primary-foreground shadow-sm",
            isMobile ? "h-dvh max-w-none rounded-none p-6" : "sm:max-w-md",
          )}
        >
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-6 w-6" />
              <DialogTitle className="text-xl font-semibold text-foreground"><Trans>Tarjeta emitida</Trans></DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              <Trans>Tu tarjeta virtual está lista para usar.</Trans>
            </DialogDescription>
          </DialogHeader>

          <Card className="bg-primary p-6"><div className="relative space-y-6 text-foreground">
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top,oklch(1_0_0/0.4),transparent_70%)]" aria-hidden="true" />
            <div className="relative space-y-6">
              <CreditCard className="h-8 w-8" />
              <div className="space-y-1">
                <p className="text-xs opacity-80"><Trans>Número de tarjeta</Trans></p>
                <p className="text-xl font-mono tracking-wider">{cardData.number}</p>
              </div>
              <div className="flex gap-6">
                <div className="space-y-1">
                  <p className="text-xs opacity-80"><Trans>Vencimiento</Trans></p>
                  <p className="font-mono">{cardData.expiry}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs opacity-80"><Trans>CVV</Trans></p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono">{cardData.cvv}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t`Mostrar CVV`}
                      onClick={toggleCVV}
                      className="h-8 w-8 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25"
                    >
                      {cardData.cvv === "***" ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div></Card>

          <DialogFooter className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                navigator.clipboard.writeText(cardData.number.replace(/\s/g, ""));
                    toast.success(t`Número copiado`);
              }}
            >
              <Copy className="h-4 w-4" />
              <Trans>Copiar número</Trans>
            </Button>
            <Button variant="default" className="w-full sm:w-auto" onClick={() => setShowSuccess(false)}>
              <Settings className="h-4 w-4" />
              <Trans>Configurar controles</Trans>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
