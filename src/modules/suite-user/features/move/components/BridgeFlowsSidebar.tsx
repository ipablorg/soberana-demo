/**
 * Bridge Flows Sidebar Component (GlobalConnectors Integration)
 * 
 * Sidebar para pagos internacionales con GlobalConnectors
 * Flujo de 3 pasos: Corredor → Formulario → Instrucciones
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe2, ArrowLeftRight, ArrowLeft } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { TypewriterText } from '@/shared/components/common/TypewriterText';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import { CorridorSelector } from '@/modules/common/components/globalconnectors/CorridorSelector';
import { PaymentForm } from '@/modules/common/components/globalconnectors/PaymentForm';
import { DepositInstructions } from '@/modules/common/components/globalconnectors/DepositInstructions';
import { useGlobalConnectors } from '@/modules/common/hooks/useGlobalConnectors';
import { cn } from '@/shared/lib/utils';
import { Trans, useLingui } from '@lingui/react/macro';

interface BridgeFlowsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3;

export function BridgeFlowsSidebar({ isOpen, onClose }: BridgeFlowsSidebarProps) {
  const { t } = useLingui();

  const stepTitles: Record<Step, string> = {
    1: t`Seleccionar corredor`,
    2: t`Datos del beneficiario`,
    3: t`Instrucciones de pago`,
  };

  const stepMessages: Record<Step, string> = {
    1: t`¿A qué país quieres enviar?`,
    2: t`Ingresa los datos del beneficiario`,
    3: t`Sigue las instrucciones de depósito`,
  };
  const [step, setStep] = useState<Step>(1);
  const {
    selectedCorridor,
    paymentResult,
    setSelectedCorridor,
    setPaymentResult,
    reset,
  } = useGlobalConnectors();

  const handleCorridorSelect = (corridor: typeof selectedCorridor) => {
    setSelectedCorridor(corridor);
    setStep(2);
  };

  const handlePaymentSuccess = (result: typeof paymentResult) => {
    setPaymentResult(result);
    setStep(3);
  };

  const handleBack = () => {
    if (step === 2) {
      setSelectedCorridor(null);
      setStep(1);
    } else if (step === 3) {
      setPaymentResult(null);
      setStep(2);
    }
  };

  const handleClose = () => {
    // Reset al cerrar
    setTimeout(() => {
      reset();
      setStep(1);
    }, 300);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: 480 }}
            animate={{ x: 0 }}
            exit={{ x: 480 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={cn(
              'fixed right-0 top-0 w-[520px] h-screen',
              'border-l-[3px] border-border/50',
              'bg-background/95 backdrop-blur-2xl',
              'pt-16 z-50',
              'overflow-y-auto scrollbar-hide'
            )}
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Globe2 className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold font-heading">
                      <Trans>Pagos Globales</Trans>
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <Trans>Transferencias internacionales seguras y rápidas</Trans>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Environment Badge */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                  <span className="text-xs font-medium">Sandbox Mode</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  bridge_xyz
                </span>
              </div>

              {/* Progress Steps */}
              {step > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2"
                >
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center flex-1">
                      <Badge
                        variant={step >= s ? 'default' : 'outline'}
                        className={cn(
                          'text-[10px] px-2 py-0.5',
                          step >= s && 'border border-border'
                        )}
                      >
                        {s}. {stepTitles[s as Step]}
                      </Badge>
                      {s < 3 && (
                        <div
                          className={`flex-1 h-0.5 mx-1 ${
                            step > s ? 'bg-primary' : 'bg-border'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </motion.div>
              )}

              {/* TypewriterText question */}
              <div className="text-center py-2">
                <p className="font-heading text-sm font-semibold text-foreground">
                  <TypewriterText
                    text={stepMessages[step]}
                    speed={30}
                    delay={0}
                  />
                </p>
              </div>

              {/* Content */}
              <Tabs defaultValue="flows" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="flows" className="gap-2">
                    <ArrowLeftRight className="h-4 w-4" />
                    <Trans>Flujos</Trans>
                  </TabsTrigger>
                  <TabsTrigger value="history" className="gap-2">
                    <Trans>Historial</Trans>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="flows" className="space-y-4 mt-4">
                  <AnimatePresence mode="wait">
                    {/* Step 1: Corridor Selector */}
                    {step === 1 && (
                      <motion.div
                        key="step-1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CorridorSelector onSelect={handleCorridorSelect} />
                      </motion.div>
                    )}

                    {/* Step 2: Payment Form */}
                    {step === 2 && selectedCorridor && (
                      <motion.div
                        key="step-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleBack}
                          className="gap-2 -ml-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <Trans>Cambiar corredor</Trans>
                        </Button>
                        <PaymentForm
                          corridor={selectedCorridor}
                          onSuccess={handlePaymentSuccess}
                        />
                      </motion.div>
                    )}

                    {/* Step 3: Deposit Instructions */}
                    {step === 3 && paymentResult && (
                      <motion.div
                        key="step-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <DepositInstructions paymentFlow={paymentResult} />
                        <Button
                          variant="secondary"
                          onClick={() => {
                            reset();
                            setStep(1);
                          }}
                          className="w-full"
                        >
                          <Trans>Crear nuevo pago</Trans>
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsContent>

                <TabsContent value="history" className="space-y-4 mt-4">
                  <div className="text-center py-12">
                    <p className="text-sm text-muted-foreground">
                      <Trans>Aún no hay flujos ejecutados</Trans>
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      <Trans>Los pagos completados aparecerán aquí</Trans>
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Info Footer (Only on Step 1) */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 rounded-lg bg-primary/5 border border-primary/20"
                >
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-primary">💡 Tip:</strong> Los corredores
                    disponibles se obtienen en tiempo real desde globalconnectors.loopay.com. Cada corredor
                    incluye información de monedas soportadas y payment rails disponibles.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
