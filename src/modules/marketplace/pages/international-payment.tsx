/**
 * InternationalPayment Page
 * 
 * Complete flow for international payments via GlobalConnectors
 * 3 Steps: Corridor Selection → Payment Form → Deposit Instructions
 */

import { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Globe } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { CorridorSelector } from '../components/globalconnectors/CorridorSelector';
import { PaymentForm } from '../components/globalconnectors/PaymentForm';
import { DepositInstructions } from '../components/globalconnectors/DepositInstructions';
import { DebugPanel } from '../components/globalconnectors/DebugPanel';
import { useGlobalConnectors } from '../hooks/useGlobalConnectors';

type Step = 1 | 2 | 3;

export default function InternationalPayment() {
  const { t } = useLingui();

  const stepTitles: Record<Step, string> = {
    1: t`Elige corredor`,
    2: t`Datos del beneficiario`,
    3: t`Instrucciones de pago`,
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

  const handleStartOver = () => {
    reset();
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-heading text-foreground">
                {t`Pago internacional`}
              </h1>
              <p className="text-muted-foreground">
                {t`Envía dinero a cualquier parte del mundo de forma rápida y segura`}
              </p>
            </div>
          </div>

          {/* Debug Panel - REMOVE IN PRODUCTION */}
          {import.meta.env.DEV && (
            <div className="mt-6">
              <DebugPanel />
            </div>
          )}

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <Badge
                  variant={step >= s ? 'default' : 'outline'}
                  className={step >= s ? 'border border-border' : ''}
                >
                  {s}. {stepTitles[s as Step]}
                </Badge>
                {s < 3 && (
                  <div className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <CorridorSelector onSelect={handleCorridorSelect} />
            </motion.div>
          )}

          {step === 2 && selectedCorridor && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <PaymentForm
                corridor={selectedCorridor}
                onSuccess={handlePaymentSuccess}
              />
            </motion.div>
          )}

          {step === 3 && paymentResult && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <DepositInstructions paymentFlow={paymentResult} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3"
        >
          {step > 1 && step < 3 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t`Volver`}
            </Button>
          )}
          {step === 3 && (
            <Button
              variant="secondary"
              onClick={handleStartOver}
              className="gap-2"
            >
              {t`Crear pago`}
            </Button>
          )}
        </motion.div>

        {/* Info Footer */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
          >
            <div className="p-4 bg-card rounded-lg border border-border/50">
              <h3 className="font-semibold text-foreground mb-2">{t`Seguro`}</h3>
              <p className="text-sm text-muted-foreground">
                {t`Todas las transacciones están protegidas y encriptadas`}
              </p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/50">
              <h3 className="font-semibold text-foreground mb-2">{t`Rápido`}</h3>
              <p className="text-sm text-muted-foreground">
                {t`Transferencias procesadas de forma eficiente`}
              </p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/50">
              <h3 className="font-semibold text-foreground mb-2">{t`Competitivo`}</h3>
              <p className="text-sm text-muted-foreground">
                {t`Tasas de cambio transparentes y competitivas`}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

