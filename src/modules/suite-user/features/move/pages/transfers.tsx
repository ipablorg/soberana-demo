import { Button } from '@/shared/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from '@/shared/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { cn } from '@/shared/lib/utils';
import { mockAccounts } from '@/shared/lib/mock-data';
import { toast } from 'sonner';
import { useMemo, useState, useEffect } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { CheckCircle2, AlertCircle, ArrowRight, Receipt, History, RefreshCw, AlertTriangle } from '@/shared/components/animated-icons';
import { motion } from 'framer-motion';
import { fadeInUp, scaleIn } from '@/shared/lib/motion';
import { useTransferFlow } from '@/shared/stores/useTransferFlow';
import { TransferPreview } from "@/shared/components/common/TransferPreview";
import { PageTransition } from '@/shared/components/motion/PageTransition';
import { PageHeader } from "@/shared/components/common/PageHeader";
import { useMobile } from '@/shared/hooks/use-mobile';
import { DisabledWrapper } from '@/shared/components/DisabledWrapper';

export default function MoveTransfers() {
  const { t } = useLingui();
  const isMobile = useMobile();
  // Form state
  const [amount, setAmount] = useState('');
  const [fromId, setFromId] = useState<string | undefined>();
  const [toId, setToId] = useState<string | undefined>();
  
  // Flow state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Result state
  const [transferId, setTransferId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [timestamp, setTimestamp] = useState('');
  
  const { previewData } = useTransferFlow();

  const fromAccount = mockAccounts.find((a) => a.id === fromId);
  const toAccount = mockAccounts.find((a) => a.id === toId);

  // Validation
  const amountNum = parseFloat(amount || '0');
  const isValidAmount = amountNum > 0 && (!fromAccount || amountNum <= fromAccount.balance);
  const isSameAccount = fromId === toId;
  const canPreview = fromId && toId && !isSameAccount && isValidAmount;

  // Summary calculation
  const summary = useMemo(() => {
    const fee = 0; // Internal transfers are free
    const eta = t`Instantáneo`;
    const railLabel = t`Libro Contable Interno`;
    return { fee, eta, railLabel };
  }, []);

  const previewSteps = [
    { key: 'accounts', title: t`Cuentas`, helper: t`Origen y destino` },
    { key: 'amount', title: t`Monto`, helper: t`Valida saldo` },
    { key: 'confirm', title: t`Confirmar`, helper: t`Sin costos` },
  ];

  const transferHighlights = [
    { label: t`Tiempo estimado`, value: summary.eta, isFinancial: false },
    { label: t`Costo`, value: summary.fee === 0 ? '$0' : `$${summary.fee.toFixed(2)}`, isFinancial: true },
    { label: t`Rail`, value: summary.railLabel, isFinancial: false },
  ];

  // Handle preview
  const handlePreview = () => {
    if (!canPreview) {
      toast.error(t`Revisa los campos marcados`);
      return;
    }
    setSheetOpen(true);
  };

  // Handle confirmation and execution
  const handleConfirm = () => {
    setSheetOpen(false);
    setIsProcessing(true);
    
    // Show processing toast
    const toastId = toast.loading(t`Un momento...`);
    
    // Simulate API call
    setTimeout(() => {
      toast.dismiss(toastId);
      setIsProcessing(false);
      
      // 90% success rate
      if (Math.random() > 0.1) {
        // Success
        const txId = `TXN-${Date.now().toString().slice(-8)}`;
        setTransferId(txId);
        setTimestamp(new Date().toLocaleString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }));
        setSuccessOpen(true);
        toast.success(t`Transferencia completada`);
      } else {
        // Failure
        const errors = [
          t`Saldo insuficiente en cuenta origen`,
          t`La cuenta destino no está disponible en este momento`,
          t`Límite diario excedido`,
        ];
        setErrorMessage(errors[Math.floor(Math.random() * errors.length)]);
        setErrorOpen(true);
        toast.error(t`No pudimos completar la transferencia`);
      }
    }, 2000);
  };

  // Reset form
  const handleNewTransfer = () => {
    setAmount('');
    setFromId(undefined);
    setToId(undefined);
    setSuccessOpen(false);
  };

  // Retry with same data
  const handleRetry = () => {
    setErrorOpen(false);
    setTimeout(() => setSheetOpen(true), 300);
  };

  // Listen for chat-triggered preview open
  useEffect(() => {
    const handler = () => {
      if (previewData) {
        setFromId(previewData.fromId);
        setToId(previewData.toId);
        setAmount(previewData.amount.toString());
        setSheetOpen(true);
      }
    };
    document.addEventListener('open-transfer-preview', handler);
    return () => document.removeEventListener('open-transfer-preview', handler);
  }, [previewData]);

  return (
    <PageTransition>
      <DisabledWrapper feature="transfers">
        <div className={isMobile ? "p-4 space-y-4" : "p-6 space-y-6 max-w-4xl mx-auto"}>
        {/* Header */}
        {!isMobile && (
          <PageHeader 
            title={t`Transferencias`}
            subtitle={t`Liquidez inmediata entre tus cuentas.`}
          />
        )}

        {/* Transfer Form */}
        <Card className="rounded-xl border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl"><Trans>Nueva Transferencia</Trans></CardTitle>
            <CardDescription><Trans>Mueve fondos entre tus cuentas al instante</Trans></CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* From Account */}
            <div className="space-y-2">
              <Label htmlFor="from-account"><Trans>Cuenta Origen</Trans></Label>
              <Select value={fromId} onValueChange={setFromId}>
                <SelectTrigger id="from-account" className="rounded-lg h-12">
                  <SelectValue placeholder={t`Elige cuenta origen`} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {mockAccounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id} className="rounded-xl">
                      <div className="flex items-center justify-between w-full gap-4">
                        <span className="font-medium">{acc.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {acc.currency || acc.asset}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-mono tabular-nums">
                            ${acc.balance.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fromAccount && (
                <p className="text-xs text-muted-foreground">
                  <Trans>Saldo disponible:</Trans> <span className="font-mono tabular-nums">${fromAccount.balance.toLocaleString()}</span> {fromAccount.currency || fromAccount.asset}
                </p>
              )}
            </div>

            {/* To Account */}
            <div className="space-y-2">
              <Label htmlFor="to-account"><Trans>Cuenta Destino</Trans></Label>
              <Select value={toId} onValueChange={setToId}>
                <SelectTrigger id="to-account" className="rounded-lg h-12">
                  <SelectValue placeholder={t`Elige cuenta destino`} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {mockAccounts
                    .filter((acc) => acc.id !== fromId)
                    .map((acc) => (
                      <SelectItem key={acc.id} value={acc.id} className="rounded-xl">
                        <div className="flex items-center justify-between w-full gap-4">
                          <span className="font-medium">{acc.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {acc.currency || acc.asset}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Validation Warning */}
            {isSameAccount && fromId && toId && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <Trans>Elige una cuenta destino diferente</Trans>
                </AlertDescription>
              </Alert>
            )}

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount"><Trans>Monto</Trans></Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="rounded-lg h-12 pl-8"
                  min="0"
                  step="0.01"
                />
              </div>
              {fromAccount && amountNum > fromAccount.balance && (
                <Alert variant="destructive" className="rounded-xl">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <Trans>El monto excede el saldo disponible</Trans> (${fromAccount.balance.toLocaleString()})
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handlePreview} 
              variant="gradient"
              className="w-full rounded-lg h-12 text-base"
              size="lg"
              disabled={!canPreview || isProcessing}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              <Trans>Revisar Transferencia</Trans>
            </Button>
          </CardContent>
        </Card>

        {/* Preview Sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="sm:max-w-lg space-y-6 rounded-l-xl border-l border-border">
            <SheetHeader>
              <SheetTitle className="text-xl"><Trans>Resumen de Transferencia</Trans></SheetTitle>
              <SheetDescription><Trans>Revisa los detalles antes de confirmar</Trans></SheetDescription>
            </SheetHeader>

            <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 p-4">
              {previewSteps.map((step, index) => (
                <div key={step.key} className="flex-1 text-center">
                  <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg border border-border text-xs font-semibold text-foreground">
                    {index + 1}
                  </div>
                  <p className="text-sm font-medium text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.helper}</p>
                </div>
              ))}
            </div>

            <motion.div {...fadeInUp}>
              <TransferPreview
                fromLabel={fromAccount?.name || ''}
                toLabel={toAccount?.name || ''}
                amount={amountNum}
                fee={summary.fee}
                eta={summary.eta}
                railLabel={summary.railLabel}
              />
            </motion.div>

            <Card className="border border-dashed border-primary/30 bg-background">
              <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {transferHighlights.map((item) => (
                  <div key={item.label} className="rounded-lg bg-muted/40 p-3 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                    <p className={cn("text-sm font-semibold text-foreground", item.isFinancial && "font-mono tabular-nums")}>{item.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <SheetFooter className="mt-6 gap-3 sm:gap-3">
              <Button 
                variant="outline" 
                className="rounded-lg flex-1" 
                onClick={() => setSheetOpen(false)}
                disabled={isProcessing}
              >
                <Trans>Cancelar</Trans>
              </Button>
              <Button 
                variant="gradient"
                className="rounded-lg flex-1" 
                onClick={handleConfirm}
                disabled={isProcessing}
              >
                <Trans>Confirmar</Trans>
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Success Dialog */}
        <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
          <DialogContent className="sm:max-w-[480px] rounded-xl border border-border bg-card">
            <motion.div {...scaleIn}>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl"><Trans>Transferencia completada</Trans></DialogTitle>
                    <DialogDescription><Trans>Se procesó al instante y sin comisiones.</Trans></DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Receipt Card */}
              <Card className="rounded-xl border border-border bg-muted/50 mt-4">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-semibold"><Trans>Comprobante</Trans></CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground"><Trans>ID de Transferencia</Trans></span>
                    <span className="font-mono font-medium">{transferId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground"><Trans>Monto</Trans></span>
                    <span className="font-mono tabular-nums font-semibold">${amountNum.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground"><Trans>Desde</Trans></span>
                    <span className="font-medium">{fromAccount?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground"><Trans>Hacia</Trans></span>
                    <span className="font-medium">{toAccount?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground"><Trans>Fecha y Hora</Trans></span>
                    <span className="font-medium text-xs">{timestamp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground"><Trans>Estado</Trans></span>
                    <Badge className="bg-success/10 text-success border-success/20">
                      <Trans>Completada</Trans>
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4 rounded-xl border border-border bg-success/5 p-4 text-sm text-success">
                <p className="font-semibold"><Trans>Beneficio Loopay</Trans></p>
                <p className="text-success/90"><Trans>Sin comisiones y liquidez inmediata entre tus cuentas internas.</Trans></p>
              </Card>

              {/* NBAs (Next Best Actions) */}
              <DialogFooter className="mt-6 flex-col sm:flex-col gap-2">
                <Button 
                  variant="gradient"
                  className="w-full rounded-lg" 
                  onClick={handleNewTransfer}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  <Trans>Realizar otra transferencia</Trans>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full rounded-lg"
                  onClick={() => setSuccessOpen(false)}
                >
                  <History className="w-4 h-4 mr-2" />
                  <Trans>Ver en historial</Trans>
                </Button>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        </Dialog>

        {/* Error Dialog */}
        <Dialog open={errorOpen} onOpenChange={setErrorOpen}>
          <DialogContent className="sm:max-w-[480px] rounded-xl border border-border bg-card">
            <motion.div {...fadeInUp}>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl"><Trans>No pudimos completar la transferencia</Trans></DialogTitle>
                    <DialogDescription><Trans>Revisa los detalles e intenta de nuevo.</Trans></DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Error Details */}
              <Alert variant="destructive" className="rounded-xl mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2">
                  <strong><Trans>Razón:</Trans></strong> {errorMessage}
                </AlertDescription>
              </Alert>

              {/* NBAs */}
              <DialogFooter className="mt-6 flex-col sm:flex-col gap-2">
                <Button 
                  variant="gradient"
                  className="w-full rounded-lg" 
                  onClick={handleRetry}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  <Trans>Reintentar</Trans>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full rounded-lg"
                  onClick={() => {
                    setErrorOpen(false);
                    setFromId(undefined);
                  }}
                >
                  <Trans>Elegir otra cuenta</Trans>
                </Button>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        </Dialog>
      </div>
      </DisabledWrapper>
    </PageTransition>
  );
}
