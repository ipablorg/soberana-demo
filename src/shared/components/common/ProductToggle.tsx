import { useState, useEffect } from "react";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { AlertCircle, Check } from "@/shared/components/animated-icons";
import { useToast } from "@/shared/hooks/use-toast";
import { useSuiteStore } from "@/shared/stores/useSuiteStore";
import { ProductKey } from "@/shared/types/suite";
import { useLingui } from '@lingui/react/macro';

interface ProductToggleProps {
  productKey: ProductKey;
  productName: string;
  description: string;
  features: string[];
  warningMessage?: string;
}

export function ProductToggle({
  productKey,
  productName,
  description,
  features,
  warningMessage,
}: ProductToggleProps) {
  const { toast } = useToast();
  const { t } = useLingui();
  const resolvedWarning = warningMessage || t`Los flujos activos que usan este producto dejarán de funcionar`;
  const { isProductEnabled, toggleProduct } = useSuiteStore();
  const [isEnabled, setIsEnabled] = useState(isProductEnabled(productKey));
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"enable" | "disable" | null>(null);

  useEffect(() => {
    setIsEnabled(isProductEnabled(productKey));
  }, [productKey, isProductEnabled]);

  const handleToggleClick = (checked: boolean) => {
    setPendingAction(checked ? "enable" : "disable");
    setConfirmDialogOpen(true);
  };

  const handleConfirm = () => {
    if (!pendingAction) return;

    toggleProduct(productKey, pendingAction === "enable" ? "active" : "inactive");
    setIsEnabled(pendingAction === "enable");
    setConfirmDialogOpen(false);

    toast({
      title: pendingAction === "enable" ? t`Producto activado` : t`Producto desactivado`,
      description:
        pendingAction === "enable"
          ? t`${productName} disponible en tu sidebar`
          : t`${productName} desactivado`,
      duration: 3000,
    });

    setPendingAction(null);
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-3">
            <Switch
              id={`product-${productKey}`}
              checked={isEnabled}
              onCheckedChange={handleToggleClick}
            />
            <Label
              htmlFor={`product-${productKey}`}
              className="text-sm font-semibold cursor-pointer"
            >
              {productName}
            </Label>
          </div>
          <Badge variant={isEnabled ? "default" : "secondary"} className="text-xs">
            {isEnabled ? t`Activo` : t`Inactivo`}
          </Badge>
        </div>
      </div>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[480px] bg-card border">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  pendingAction === "enable"
                    ? "bg-primary/10"
                    : "bg-destructive/10"
                }`}
              >
                {pendingAction === "enable" ? (
                  <Check className="w-6 h-6 text-primary" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-destructive" />
                )}
              </div>
              <div>
                <DialogTitle>
                  {pendingAction === "enable" ? t`¿Activar ${productName}?` : t`¿Desactivar ${productName}?`}
                </DialogTitle>
                <DialogDescription>{description}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {pendingAction === "enable" && features.length > 0 && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  {t`FUNCIONALIDADES`}
                </p>
                <ul className="space-y-1.5">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {pendingAction === "disable" && (
              <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">{resolvedWarning}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDialogOpen(false);
                setPendingAction(null);
              }}
            >
              {t`Cancelar`}
            </Button>
            <Button
              onClick={handleConfirm}
              variant={pendingAction === "enable" ? "default" : "destructive"}
            >
              {pendingAction === "enable" ? t`Activar` : t`Desactivar`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
