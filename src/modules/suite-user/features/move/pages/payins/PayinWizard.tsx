/**
 * Payin Wizard Component
 * 
 * Clean, minimalist wizard for creating Breb keys (incoming payment identifiers).
 * Flow: Select payment method → Create your Breb key
 */

import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';
import {
  CheckCircle2,
  Key,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Wallet,
  Phone,
  Copy,
  Building2,
  CreditCard,
  Loader2,
  ChevronLeft,
} from '@/shared/components/animated-icons';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Trans, useLingui } from '@lingui/react/macro';
import { DynamicIsland } from '@/shared/components/DynamicIsland';
import { TypewriterText } from '@/shared/components/common/TypewriterText';
import { useDynamicIslandStore } from '@/shared/stores/useDynamicIslandStore';
import { Button } from '@/shared/components/ui/button';
import { useCreateBrebKey, useBridgeVirtualAccounts, type BridgeVirtualAccount } from './hooks';
import { useAuthStore } from '@/shared/stores/auth-store';

interface PayinWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (brebKey: string) => void;
}

type PaymentMethod = 'select' | 'breb';
type WizardStep = 'input' | 'review' | 'success';

export function PayinWizard({ open, onOpenChange, onSuccess }: PayinWizardProps) {
  const { t } = useLingui();
  // Payment method and step control
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('select');
  const [step, setStep] = useState<WizardStep>('input');
  const [executing, setExecuting] = useState(false);
  const [createdBrebKey, setCreatedBrebKey] = useState<string | null>(null);

  // Bridge Virtual Accounts state
  const [selectedAccount, setSelectedAccount] = useState<BridgeVirtualAccount | null>(null);

  // Dynamic Island store
  const { setStep: setIslandStep, hide: hideIsland, reset: resetIsland } = useDynamicIslandStore();

  // Form state
  const [brebKey, setBrebKey] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Hooks
  const { createBrebKey } = useCreateBrebKey();
  const { virtualAccounts, isLoading: isLoadingAccounts } = useBridgeVirtualAccounts();

  // Get existing Breb key from auth store
  const user = useAuthStore((state) => state.user);
  const existingBrebKey = useMemo(() => {
    const metadata = user?.company_user?.[0]?.company?.CompanyProduct?.[0]?.metaData as
      | { brebKey?: string }
      | null
      | undefined;
    return metadata?.brebKey || null;
  }, [user]);

  // Reset wizard on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setPaymentMethod('select');
        setStep('input');
        setBrebKey('');
        setPhoneNumber('');
        setCreatedBrebKey(null);
        setSelectedAccount(null);
        resetIsland();
      }, 200);
    }
  }, [open, resetIsland]);

  // Update Dynamic Island based on payment method, step and if breb key exists
  useEffect(() => {
    if (!open) return;

    if (paymentMethod === 'select') {
      hideIsland();
      return;
    }

    if (existingBrebKey || createdBrebKey || step === 'success') {
      hideIsland();
      return;
    }

    const totalSteps = 2;
    let currentStep = 0;
    let stepName = '';

    if (step === 'input') {
      currentStep = 0;
      stepName = t`Configurar llave Breb`;
    } else if (step === 'review') {
      currentStep = 1;
      stepName = t`Confirmar y crear`;
    }

    setIslandStep(currentStep, totalSteps, stepName);
  }, [open, paymentMethod, step, existingBrebKey, createdBrebKey, setIslandStep, hideIsland]);

  // Handle validation
  const handleValidate = () => {
    if (!brebKey.trim()) {
      toast.error(t`Ingresa una llave Breb`);
      return;
    }

    if (!brebKey.startsWith('@')) {
      toast.error(t`La llave Breb debe comenzar con @`);
      return;
    }

    if (brebKey.length < 3) {
      toast.error(t`La llave Breb debe tener al menos 3 caracteres`);
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error(t`Ingresa un número de teléfono`);
      return;
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      toast.error(t`El teléfono debe tener exactamente 10 dígitos numéricos`);
      return;
    }

    setStep('review');
    toast.success(t`Todo en orden`);
  };

  // Handle confirm and execute
  const handleConfirm = async () => {
    setExecuting(true);

    try {
      const response = await createBrebKey({
        partyIdentifier: brebKey,
        phoneNumber: phoneNumber,
      });

      if (response && response.success) {
        toast.success(response.message);
        setCreatedBrebKey(response.brebKey);
        setStep('success');
        onSuccess?.(response.brebKey);
      } else {
        const errorMessage = response?.message || t`No pudimos crear la llave Breb`;
        toast.error(errorMessage, {
          duration: 6000,
          description: t`Verifica los datos e intenta de nuevo.`,
        });
      }
    } catch (error) {
      console.error('Error en handleConfirm:', error);
      toast.error(t`Algo salió mal al crear la llave Breb`, {
        duration: 5000,
      });
    } finally {
      setExecuting(false);
    }
  };

  // Handle copy address to clipboard
  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success(t`Dirección copiada al portapapeles`);
    } catch (err) {
      toast.error(t`No pudimos copiar la dirección`);
    }
  };

  // Check if form is complete
  const isFormComplete = useMemo(() => {
    return (
      brebKey.trim() !== '' && 
      brebKey.startsWith('@') && 
      brebKey.length >= 3 &&
      phoneNumber.trim() !== '' &&
      /^\d{10}$/.test(phoneNumber)
    );
  }, [brebKey, phoneNumber]);

  const displayBrebKey = existingBrebKey || createdBrebKey;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'fixed! left-[50%]! top-[50%]! translate-x-[-50%]! translate-y-[-50%]!',
          'border border-border bg-card text-foreground',
          'shadow-lg',
          'sm:max-w-2xl max-h-[90vh] overflow-hidden'
        )}
      >

        {/* Dynamic Island */}
        {paymentMethod !== 'select' && !displayBrebKey && step !== 'success' && <DynamicIsland showBalance={false} />}

        {paymentMethod !== 'select' && !displayBrebKey && step !== 'success' && (
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center mt-4 mb-6"
            >
              <h2 className="font-heading text-lg font-semibold text-foreground">
                <TypewriterText
                  text={step === 'input' ? t`Configura tu identificador de pago` : t`Revisa y confirma los datos`}
                  speed={30}
                  delay={0}
                />
              </h2>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Payment Method Selection - Bridge Virtual Accounts List */}
        {paymentMethod === 'select' && (
          <>
            <DialogHeader className="pt-2 pb-4">
              <DialogTitle className="text-2xl font-semibold text-foreground">
                {selectedAccount ? t`Detalles de la cuenta` : t`Opciones de recaudo`}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-2">
                {selectedAccount 
                  ? t`Información de depósito para esta cuenta virtual`
                  : t`Selecciona una cuenta virtual para ver los detalles de depósito`}
              </DialogDescription>
            </DialogHeader>

            {/* Show selected account details */}
            {selectedAccount ? (
              <div className="space-y-4 py-6 px-4 max-h-[60vh] overflow-y-auto">
                <Card className="bg-success/10 border border-success/30 p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-success/20 border border-success/40">
                        <CheckCircle2 className="h-6 w-6 text-success" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-success mb-1">
                          <Trans>Cuenta Virtual Activa</Trans>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {selectedAccount.virtualAccountId}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Deposit Instructions - MAIN SECTION */}
                <Card className="border border-border bg-muted/30 p-6">
                  <div className="space-y-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/30 border border-primary/50">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <span className="text-base font-bold text-primary">
                          <Trans>Instrucciones de depósito</Trans>
                        </span>
                        <p className="text-xs text-primary/70"><Trans>Usa estos datos para transferir fondos</Trans></p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium border border-border">
                      ★ <Trans>Importante</Trans>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground block mb-1">Moneda</Label>
                      <span className="text-foreground uppercase">{selectedAccount.depositInstructions.currency}</span>
                    </div>

                    <div className="col-span-2">
                      <Label className="text-muted-foreground block mb-1">Payment Rails</Label>
                      <div className="flex gap-2 flex-wrap">
                        {selectedAccount.depositInstructions.payment_rails.map((rail) => (
                          <span key={rail} className="px-2 py-1 rounded bg-primary/20 text-primary text-xs">
                            {rail}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* USD Fields */}
                    {selectedAccount.depositInstructions.currency.toLowerCase() === 'usd' && (
                      <>
                        {selectedAccount.depositInstructions.bank_name && (
                          <div className="col-span-2">
                            <Label className="text-muted-foreground block mb-1">Banco</Label>
                            <span className="text-foreground">{selectedAccount.depositInstructions.bank_name}</span>
                          </div>
                        )}
                        {selectedAccount.depositInstructions.bank_routing_number && (
                          <div>
                            <Label className="text-muted-foreground block mb-1">Routing Number</Label>
                            <span className="text-foreground font-mono">{selectedAccount.depositInstructions.bank_routing_number}</span>
                          </div>
                        )}
                        {selectedAccount.depositInstructions.bank_account_number && (
                          <div>
                            <Label className="text-muted-foreground block mb-1">Account Number</Label>
                            <span className="text-foreground font-mono">{selectedAccount.depositInstructions.bank_account_number}</span>
                          </div>
                        )}
                        {selectedAccount.depositInstructions.bank_address && (
                          <div className="col-span-2">
                            <Label className="text-muted-foreground block mb-1">Dirección del Banco</Label>
                            <span className="text-foreground">{selectedAccount.depositInstructions.bank_address}</span>
                          </div>
                        )}
                        {selectedAccount.depositInstructions.bank_beneficiary_address && (
                          <div className="col-span-2">
                            <Label className="text-muted-foreground block mb-1">Dirección del Beneficiario</Label>
                            <span className="text-foreground">{selectedAccount.depositInstructions.bank_beneficiary_address}</span>
                          </div>
                        )}
                      </>
                    )}

                    {/* MXN Fields */}
                    {selectedAccount.depositInstructions.currency.toLowerCase() === 'mxn' && (
                      <>
                        {selectedAccount.depositInstructions.bank_beneficiary_name && (
                          <div className="col-span-2">
                            <Label className="text-muted-foreground block mb-1">Beneficiario</Label>
                            <span className="text-foreground">{selectedAccount.depositInstructions.bank_beneficiary_name}</span>
                          </div>
                        )}
                        {selectedAccount.depositInstructions.clabe && (
                          <div className="col-span-2">
                            <Label className="text-muted-foreground block mb-1">CLABE</Label>
                            <span className="text-foreground font-mono">{selectedAccount.depositInstructions.clabe}</span>
                          </div>
                        )}
                      </>
                    )}

                    {/* EUR Fields */}
                    {selectedAccount.depositInstructions.currency.toLowerCase() === 'eur' && (
                      <>
                        {selectedAccount.depositInstructions.bank_name && (
                          <div className="col-span-2">
                            <Label className="text-muted-foreground block mb-1">Banco</Label>
                            <span className="text-foreground">{selectedAccount.depositInstructions.bank_name}</span>
                          </div>
                        )}
                        {selectedAccount.depositInstructions.bank_beneficiary_name && (
                          <div className="col-span-2">
                            <Label className="text-muted-foreground block mb-1">Beneficiario</Label>
                            <span className="text-foreground">{selectedAccount.depositInstructions.bank_beneficiary_name}</span>
                          </div>
                        )}
                        {selectedAccount.depositInstructions.iban && (
                          <div className="col-span-2">
                            <Label className="text-muted-foreground block mb-1">IBAN</Label>
                            <span className="text-foreground font-mono">{selectedAccount.depositInstructions.iban}</span>
                          </div>
                        )}
                        {selectedAccount.depositInstructions.bic && (
                          <div>
                            <Label className="text-muted-foreground block mb-1">BIC</Label>
                            <span className="text-foreground font-mono">{selectedAccount.depositInstructions.bic}</span>
                          </div>
                        )}
                        {/* Sepa Reference - siempre visible para EUR */}
                        <div>
                          <Label className="text-muted-foreground block mb-1">Sepa Reference</Label>
                          <span className="text-foreground font-mono">{"BRGUZK5EFZVSP5EEHMYY"}</span>
                        </div>
                      </>
                    )}

                    {/* BRL Fields */}
                    {selectedAccount.depositInstructions.currency.toLowerCase() === 'brl' && (
                      <>
                        {selectedAccount.depositInstructions.pix_key && (
                          <div className="col-span-2">
                            <Label className="text-muted-foreground block mb-1">PIX Key</Label>
                            <span className="text-foreground font-mono">{selectedAccount.depositInstructions.pix_key}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  </div>
                </Card>

                {/* Destination - Secondary section */}
                <Card className="bg-foreground/5 border border-border/50 p-6">
                  <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Destino de los fondos
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Recibirás:</span>
                        <span className="text-foreground/80 uppercase font-medium">{selectedAccount.destination.currency}</span>
                        <span className="text-muted-foreground">en</span>
                        <span className="text-muted-foreground">{selectedAccount.destination.payment_rail}</span>
                      </div>
                    </div>
                    
                    <div 
                      onClick={() => handleCopyAddress(selectedAccount.destination.address)}
                      className="flex items-center gap-2 p-2 rounded-lg bg-background/40 border border-border/30 cursor-pointer hover:bg-foreground/5 transition-colors group"
                    >
                      <span className="text-xs font-mono text-muted-foreground break-all flex-1">
                        {selectedAccount.destination.address}
                      </span>
                      <Copy className="h-3.5 w-3.5 text-muted-foreground group-hover:text-muted-foreground transition-colors shrink-0" />
                    </div>
                  </div>
                  </div>
                </Card>
              </div>
            ) : (
              /* Virtual Accounts List */
              <div className="space-y-3 py-4 px-1 max-h-[60vh] overflow-y-auto">
                {isLoadingAccounts ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                  </div>
                ) : virtualAccounts.length === 0 ? (
                  <div className="text-center py-12">
                    <Wallet className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground"><Trans>Aún no tienes cuentas virtuales configuradas</Trans></p>
                  </div>
                ) : (
                  virtualAccounts.map((account) => (
                    <Button
                      key={account.virtualAccountId}
                      variant="ghost"
                      onClick={() => setSelectedAccount(account)}
                      className={cn(
                        'w-full p-4 h-auto rounded-xl border border-border/50 bg-foreground/5',
                        'hover:bg-foreground/10 hover:border-border transition-colors duration-150',
                        'text-left group justify-start'
                      )}
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                          <Wallet className="h-5 w-5 text-accent-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-foreground mb-1">
                            Cuenta Virtual {account.depositInstructions.currency.toUpperCase()}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {account.depositInstructions.payment_rails.join(' • ')}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Destino: {account.destination.currency.toUpperCase()} • {account.destination.payment_rail}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Status: <span className={cn(
                              account.status === 'activated' ? 'text-success' : 'text-warning'
                            )}>{account.status}</span>
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground/80 transition-colors" />
                      </div>
                    </Button>
                  ))
                )}
              </div>
            )}

            {/* Footer buttons */}
            <div className="flex gap-3 pt-6 mt-2 border-t border-border/50">
              {selectedAccount ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedAccount(null)}
                    className="flex-1"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    <Trans>Volver</Trans>
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => handleCopyAddress(selectedAccount.destination.address)}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    <Trans>Copiar dirección</Trans>
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  <Trans>Cerrar</Trans>
                </Button>
              )}
            </div>
          </>
        )}

        {/* Breb Flow - Input/Success Step */}
        {paymentMethod === 'breb' && (step === 'input' || step === 'success') && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-foreground">
                {displayBrebKey ? (step === 'success' ? t`Llave Breb creada` : t`Llave Breb configurada`) : t`Crear llave Breb`}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {displayBrebKey
                  ? t`Tu llave Breb ya está configurada y lista para recibir pagos`
                  : t`Configura tu identificador único para recibir pagos mediante Breb`}
              </DialogDescription>
            </DialogHeader>

            {displayBrebKey ? (
              <div className="space-y-4 py-6 px-4">
                <Card className="bg-success/10 border border-success/30 p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-success/20 border border-success/40">
                        <CheckCircle2 className="h-6 w-6 text-success" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-success mb-1">
                          {step === 'success' ? 'Llave Breb creada y activa' : 'Llave Breb activa'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {step === 'success' 
                            ? 'Identificador configurado'
                            : 'Tu identificador está configurado y operativo'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-success/20">
                      <Label className="text-xs text-muted-foreground mb-2 block">Tu llave Breb</Label>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-success/20">
                        <Key className="h-5 w-5 text-success" />
                        <span className="text-lg font-mono font-semibold text-success">
                          {displayBrebKey}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                      <p className="text-xs text-primary">
                        Comparte esta llave con tus clientes para que puedan enviarte pagos fácilmente
                      </p>
                    </div>

                    {step === 'success' && (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                        <p className="text-xs text-success">
                          Tu llave Breb ha sido guardada en nuestro sistema. Ya puedes comenzar a recibir pagos.
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            ) : (
              <div className="space-y-4 py-6 px-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Llave Breb (Party Identifier)</Label>
                  <Input
                    placeholder="Ej: @minegocios2024"
                    value={brebKey}
                    onChange={(e) => setBrebKey(e.target.value)}
                    className={cn(
                      brebKey && !brebKey.startsWith('@') && 'border-destructive/50'
                    )}
                  />
                  
                  {!brebKey && (
                    <div className="flex items-center gap-2 text-xs">
                      <AlertCircle className="h-3.5 w-3.5 text-primary" />
                      <span className="text-primary">
                        La llave debe comenzar con @ y ser única
                      </span>
                    </div>
                  )}
                  
                  {brebKey && !brebKey.startsWith('@') && (
                    <div className="flex items-center gap-2 text-xs">
                      <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                      <span className="text-destructive">
                        La llave debe comenzar con @
                      </span>
                    </div>
                  )}
                  
                  {brebKey && brebKey.startsWith('@') && brebKey.length < 3 && (
                    <div className="flex items-center gap-2 text-xs">
                      <AlertCircle className="h-3.5 w-3.5 text-warning" />
                      <span className="text-warning">
                        La llave es muy corta (mínimo 3 caracteres)
                      </span>
                    </div>
                  )}
                  
                  {brebKey && brebKey.startsWith('@') && brebKey.length >= 3 && (
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      <span className="text-success">
                        Llave válida ✓
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Número de teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Ej: 3001234567"
                      value={phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 10) {
                          setPhoneNumber(value);
                        }
                      }}
                      className={cn(
                        'pl-10',
                        phoneNumber && phoneNumber.length !== 10 && 'border-destructive/50'
                      )}
                      maxLength={10}
                    />
                  </div>
                  
                  {!phoneNumber && (
                    <div className="flex items-center gap-2 text-xs">
                      <AlertCircle className="h-3.5 w-3.5 text-primary" />
                      <span className="text-primary">
                        Ingresa un número de 10 dígitos
                      </span>
                    </div>
                  )}
                  
                  {phoneNumber && phoneNumber.length > 0 && phoneNumber.length < 10 && (
                    <div className="flex items-center gap-2 text-xs">
                      <AlertCircle className="h-3.5 w-3.5 text-warning" />
                      <span className="text-warning">
                        Faltan {10 - phoneNumber.length} dígitos
                      </span>
                    </div>
                  )}
                  
                  {phoneNumber && phoneNumber.length === 10 && (
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      <span className="text-success">
                        Teléfono válido ✓
                      </span>
                    </div>
                  )}
                </div>

                <Card className="bg-primary/10 border border-primary/30 p-6">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <p className="text-xs font-semibold text-primary">
                          ¿Qué es una llave Breb?
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Es tu identificador único en la red Breb. Con ella, tus clientes pueden 
                          enviarte pagos de forma simple y segura, similar a como funciona una cuenta 
                          de redes sociales.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-border/50">
              {displayBrebKey ? (
                <Button
                  variant="default"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cerrar
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setPaymentMethod('select')}
                    className="flex-1"
                  >
                    Volver
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleValidate}
                    disabled={!isFormComplete}
                    className="flex-1"
                  >
                    <Trans>Continuar</Trans>
                  </Button>
                </>
              )}
            </div>
          </>
        )}

        {/* Breb Flow - Review Step */}
        {paymentMethod === 'breb' && step === 'review' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-foreground">
                <Trans>Confirmar llave Breb</Trans>
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                <Trans>Revisa tu información antes de confirmar</Trans>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-6 px-4">
              <Card className="bg-success/10 border border-success/30 p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="text-sm font-semibold text-success">
                      Datos validados
                    </span>
                  </div>
                  
                  <div className="space-y-4 pt-2">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Tu llave Breb será</Label>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-success/20">
                        <Key className="h-5 w-5 text-success" />
                        <span className="text-xl font-mono font-semibold text-success">
                          {brebKey}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Teléfono asociado</Label>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-success/20">
                        <Phone className="h-5 w-5 text-success" />
                        <span className="text-xl font-mono font-semibold text-success">
                          {phoneNumber}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
                    <p className="text-xs text-warning">
                      Una vez creada, esta información no se podrá modificar. Asegúrate de que sea correcta.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border/50">
              <Button
                variant="ghost"
                onClick={() => setStep('input')}
                disabled={executing}
                className="flex-1"
              >
                Volver
              </Button>
              <Button
                variant="default"
                onClick={handleConfirm}
                disabled={executing}
                className="flex-1"
              >
                {executing ? t`Un momento...` : t`Confirmar`}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
