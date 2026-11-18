/**
 * Bridge Flow Executor Component
 * 
 * Componente para ejecutar un flujo transnacional paso a paso
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, XCircle } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Progress } from '@/shared/components/ui/progress';
import { Separator } from '@/shared/components/ui/separator';
import type { BridgeTransnationalFlow, BridgeTransferRequest } from '../types/bridge-flows.types';
import { REGION_CONFIG, ACTION_CONFIG, RAIL_ICONS } from '../data/bridge-flows.data';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { Trans, useLingui } from '@lingui/react/macro';
import { createBridgeTransfer, generateIdempotencyKey, getBridgeQuote } from '../api/bridge-transfers.api';
import { useAuthStore } from '@/shared/stores/auth-store';

interface BridgeFlowExecutorProps {
  flow: BridgeTransnationalFlow;
  onBack: () => void;
  onComplete: () => void;
}

export function BridgeFlowExecutor({ flow, onBack, onComplete }: BridgeFlowExecutorProps) {
  const { t } = useLingui();
  const [currentStep, setCurrentStep] = useState(0);
  const [amount, setAmount] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executedSteps, setExecutedSteps] = useState<number[]>([]);
  const [failedStep, setFailedStep] = useState<number | null>(null);
  const [_transferIds, setTransferIds] = useState<Record<number, string>>({});
  const { user } = useAuthStore();

  const currentLeg = flow.legs[currentStep];
  const progress = ((executedSteps.length) / flow.legs.length) * 100;

  // Get customer ID from user (adjust based on your user structure)
  const customerId = user?.company_user?.[0]?.company?.externalId || 'demo_customer';

  const handleExecuteStep = async () => {
    if (currentStep === 0 && (!amount || parseFloat(amount) <= 0)) {
      toast.error(t`Ingresa un monto válido`);
      return;
    }

    setIsExecuting(true);

    try {
      const currentAmount = currentStep === 0 ? parseFloat(amount) : flow.legs[currentStep].amount || 0;
      
      if (currentStep > 0) {
        const prevLeg = flow.legs[currentStep - 1];
        if (prevLeg.currency !== currentLeg.currency) {
          toast.info(t`Un momento, obteniendo cotización FX...`, { duration: 2000 });
          await getBridgeQuote(
            prevLeg.currency,
            currentLeg.currency,
            currentAmount
          );
        }
      }

      // Crear el transfer en Bridge API
      const transferRequest: BridgeTransferRequest = {
        source: {
          currency: currentStep === 0 ? currentLeg.currency : flow.legs[currentStep - 1].currency,
          amount: currentAmount,
          // external_account_id se obtendría de las cuentas del usuario
        },
        destination: {
          currency: currentLeg.currency,
          // external_account_id se obtendría de las cuentas del usuario
        },
        customer_id: customerId,
        idempotency_key: generateIdempotencyKey(),
      };

      toast.info(t`Un momento, procesando en ${currentLeg.region}...`, { duration: 3000 });

      // Llamar a Bridge API
      const transferResponse = await createBridgeTransfer(transferRequest);

      // Guardar el transfer ID
      setTransferIds(prev => ({
        ...prev,
        [currentStep]: transferResponse.id
      }));

      // Actualizar el monto del leg
      flow.legs[currentStep].amount = currentAmount;
      flow.legs[currentStep].status = 'completed';
      flow.legs[currentStep].transactionId = transferResponse.id;

      // Marcar paso como ejecutado
      setExecutedSteps(prev => [...prev, currentStep]);

      toast.success(t`Paso ${currentStep + 1} completado`, {
        description: `Transfer ID: ${transferResponse.id.slice(0, 12)}...`
      });

      // Avanzar al siguiente paso o completar
      if (currentStep < flow.legs.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        toast.success(t`Listo`, {
          description: t`${flow.legs.length} transferencias procesadas`
        });
        setTimeout(onComplete, 1000);
      }
    } catch (error: unknown) {
      console.error('Error executing step:', error);
      setFailedStep(currentStep);
      flow.legs[currentStep].status = 'failed';
      
      toast.error(t`No pudimos ejecutar este paso`, {
        description: error instanceof Error ? error.message : t`Revisa la configuración e intenta de nuevo.`
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const isStepCompleted = (stepIndex: number) => executedSteps.includes(stepIndex);
  const isStepFailed = (stepIndex: number) => failedStep === stepIndex;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="text-lg font-semibold">{flow.description}</h3>
          <p className="text-sm text-muted-foreground">
            <Trans>Paso {currentStep + 1} de {flow.legs.length}</Trans>
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground text-right">
          <Trans>{executedSteps.length} de {flow.legs.length} completados</Trans>
        </p>
      </div>

      {/* Steps Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm"><Trans>Flujo de ejecución</Trans></CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {flow.legs.map((leg, index) => {
            const regionConfig = REGION_CONFIG[leg.region];
            const actionConfig = ACTION_CONFIG[leg.action];
            const isCurrent = index === currentStep;
            const isCompleted = isStepCompleted(index);
            const isFailed = isStepFailed(index);
            const isLast = index === flow.legs.length - 1;

            return (
              <div key={leg.step}>
                <div className={cn(
                  'flex items-center gap-3 p-3 rounded-lg transition-colors duration-150',
                  isCurrent && 'bg-primary/5 ring-2 ring-primary/20',
                  isCompleted && 'opacity-60',
                  isFailed && 'bg-destructive/5 ring-2 ring-destructive/20'
                )}>
                  {/* Status icon */}
                  <div className="shrink-0">
                    {isCompleted && (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    )}
                    {isFailed && (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    {!isCompleted && !isFailed && (
                      <div className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold',
                        isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}>
                        {index + 1}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {regionConfig.flag} {leg.region}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {leg.currency} via {leg.rail.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {actionConfig.label}: {leg.notes}
                    </p>
                  </div>

                  {/* Loading indicator */}
                  {isCurrent && isExecuting && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                </div>

                {!isLast && (
                  <div className="ml-8 w-0.5 h-4 bg-border" />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Current Step Details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {REGION_CONFIG[currentLeg.region].flag} Paso {currentStep + 1}: {currentLeg.region}
              </CardTitle>
              <CardDescription>
                {currentLeg.notes}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Amount Input (solo en el primer paso) */}
              {currentStep === 0 && (
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    <Trans>Monto a enviar</Trans> ({currentLeg.currency})
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isExecuting || isStepCompleted(currentStep)}
                    className="font-mono tabular-nums"
                  />
                  <p className="text-xs text-muted-foreground">
                    <Trans>Ingresa el monto inicial del flujo</Trans>
                  </p>
                </div>
              )}

              {/* Step Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Moneda</p>
                  <p className="text-sm font-semibold">{currentLeg.currency}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Red de pago</p>
                  <p className="text-sm font-semibold">
                    {RAIL_ICONS[currentLeg.rail]} {currentLeg.rail.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Acción</p>
                  <p className="text-sm font-semibold capitalize">{currentLeg.action}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tiempo estimado</p>
                  <p className="text-sm font-semibold">{currentLeg.estimatedTime}</p>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex justify-end gap-2">
                {!isStepCompleted(currentStep) && (
                  <Button
                    onClick={handleExecuteStep}
                    disabled={isExecuting || (currentStep === 0 && !amount)}
                    variant="gradient"
                    className="gap-2"
                  >
                    {isExecuting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <Trans>Un momento...</Trans>
                      </>
                    ) : (
                      <>
                        <Trans>Ejecutar paso</Trans>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
                {isStepCompleted(currentStep) && currentStep < flow.legs.length - 1 && (
                  <Button
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    variant="gradient"
                    className="gap-2"
                  >
                    <Trans>Siguiente paso</Trans>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Warning */}
      <Card className="bg-warning/5 border-warning/20">
        <CardContent className="pt-6">
          <p className="text-xs text-muted-foreground">
            ⚠️ <strong>Modo Sandbox:</strong> Este flujo está conectado al entorno de pruebas de Bridge.
            No se procesarán transacciones reales.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

