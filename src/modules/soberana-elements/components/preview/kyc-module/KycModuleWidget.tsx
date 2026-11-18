import { useState, useEffect } from 'react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Stepper } from '@/shared/components/ui/stepper';
import { Separator } from '@/shared/components/ui/separator';
import {
  UserCheck,
  FileText,
  Camera,
  CheckCircle,
  ArrowRight,
  Shield,
  MessageCircle,
  AlertCircle,
} from '@/shared/components/animated-icons';
import { useKYC } from '@/shared/hooks/useKYC';
import type { WidgetConfig, WidgetEvent, WidgetEventType } from '../../../types';

type KycStep = 0 | 1 | 2 | 3 | 4;

interface KycModuleWidgetProps {
  config: WidgetConfig;
  userId?: string;
  returnUrl?: string;
  isPreview?: boolean;
  onEvent?: <T extends WidgetEventType>(event: WidgetEvent<T>) => void;
}

export function KycModuleWidget({ config, isPreview = false, onEvent }: KycModuleWidgetProps) {
  const [step, setStep] = useState<KycStep>(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const showBiometric = config.features.kycBiometric;
  const showCompliance = config.features.complianceChat;

  const {
    kycStatus,
    isKYCApproved,
    isKYCInReview,
    isKYCPending,
    needsManualRefresh,
    startKYC,
    isLoading: kycLoading,
  } = useKYC();

  const emit = <T extends WidgetEventType>(type: T, payload: WidgetEvent<T>['payload']) => {
    onEvent?.({
      type,
      widgetId: config.id,
      timestamp: new Date().toISOString(),
      payload,
    } as WidgetEvent<T>);
  };

  // Sync real KYC status to widget UI on mount
  useEffect(() => {
    if (kycLoading) return;
    if (isKYCApproved) {
      setStep(4);
      emit('kyc:completed', { kycId: `kyc_real`, status: 'approved' });
    } else if (isKYCInReview) {
      setStep(4);
      emit('kyc:completed', { kycId: `kyc_real`, status: 'pending_review' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: run once after first KYC load
  }, [kycLoading]);

  const start = async () => {
    setStep(1);
    emit('kyc:started', {});
    // In preview: still open the real Persona link (real KYC launch)
    await startKYC();
  };

  const uploadDocs = () => {
    setStep(showBiometric ? 2 : 3);
    emit('kyc:step-completed', { step: 1, stepName: 'Documentos' });
    if (!showBiometric) simulateProcessing();
  };

  const captureBiometric = () => {
    setStep(3);
    emit('kyc:step-completed', { step: 2, stepName: 'Biométrico' });
    simulateProcessing();
  };

  const simulateProcessing = () => {
    let p = 0;
    const iv = setInterval(() => {
      p += 25;
      setUploadProgress(p);
      if (p >= 100) {
        clearInterval(iv);
        // In preview: result reflects real KYC status, not a random outcome
        setStep(4);
        const realStatus = isKYCApproved ? 'approved' : 'pending_review';
        emit('kyc:completed', { kycId: `kyc_real`, status: realStatus });
      }
    }, 400);
  };

  const stepCount = showBiometric ? 4 : 3;
  const stepperItems = showBiometric
    ? [
        { title: t`Inicio`, helper: '' },
        { title: t`Documentos`, helper: '' },
        { title: t`Biométrico`, helper: '' },
        { title: t`Listo`, helper: '' },
      ]
    : [
        { title: t`Inicio`, helper: '' },
        { title: t`Documentos`, helper: '' },
        { title: t`Listo`, helper: '' },
      ];

  const activeStepperIndex = step === 4 ? stepCount - 1 : Math.min(step, stepCount - 1);
  const kycResult = isKYCApproved ? 'approved' : 'pending_review';

  return (
    <div className="relative flex flex-col gap-4">
      {/* PREVIEW badge */}
      {isPreview && (
        <Badge variant="secondary" className="absolute -top-2 -right-2 z-10 text-xs">
          {t`PREVIEW`}
        </Badge>
      )}

      {kycLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      ) : (
        <>
          <Stepper steps={stepperItems} activeIndex={activeStepperIndex} />

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <UserCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground"><Trans>Verificación de identidad</Trans></p>
                    <p className="text-sm text-muted-foreground"><Trans>~3 minutos · Seguro y privado</Trans></p>
                  </div>
                </div>

                {/* Show current real KYC state if not initiated */}
                {!isKYCPending && kycStatus !== 'NOT_INITIATED' && (
                  <Badge
                    variant={isKYCApproved ? 'success' : needsManualRefresh ? 'warning' : 'secondary'}
                    className="text-xs w-fit"
                  >
                    {t`Estado actual: ${kycStatus}`}
                  </Badge>
                )}

                <Separator />
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span><Trans>Documento de identidad (cédula o pasaporte)</Trans></span>
                  </div>
                  {showBiometric && (
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span><Trans>Selfie para validación biométrica</Trans></span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span><Trans>Cumplimiento Fortress · ISO 27001</Trans></span>
                  </div>
                </div>
                <Button variant="gradient" onClick={start}>
                  <Trans>Comenzar verificación</Trans>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                {isPreview && (
                  <p className="text-xs text-muted-foreground text-center -mt-1">
                    <Trans>Preview · Abrirá el flujo real de Persona/Bridge.</Trans>
                  </p>
                )}
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="docs"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4"
              >
                <p className="font-semibold text-foreground"><Trans>Sube tu documento</Trans></p>
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 gap-3">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center">
                    <Trans>Arrastra tu documento aquí o haz clic para seleccionar</Trans>
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    JPG, PNG, PDF — máx. 5 MB
                  </Badge>
                </div>
                <Button variant="gradient" onClick={uploadDocs}>
                  <Trans>Continuar</Trans>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {step === 2 && showBiometric && (
              <motion.div
                key="biometric"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4"
              >
                <p className="font-semibold text-foreground"><Trans>Validación biométrica</Trans></p>
                <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/30 p-8 gap-3">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center">
                    <Trans>Posiciona tu rostro en el centro del marco</Trans>
                  </p>
                </div>
                <Button variant="gradient" onClick={captureBiometric}>
                  <Trans>Capturar foto</Trans>
                </Button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl border border-border bg-card p-5 flex flex-col items-center gap-4"
              >
                {showCompliance && (
                  <div className="w-full rounded-lg border border-border bg-muted/30 p-3 flex items-start gap-2">
                    <MessageCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Zentinel:</strong>{' '}
                      <Trans>Estamos verificando tu identidad con Fortress Compliance. El proceso tarda ~30 segundos.</Trans>
                    </p>
                  </div>
                )}
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground animate-pulse">
                  <Trans>Verificando identidad...</Trans>
                </p>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="rounded-xl border border-border bg-card p-5 flex flex-col items-center gap-4"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  kycResult === 'approved' ? 'bg-success/10' : 'bg-warning/10'
                }`}>
                  {kycResult === 'approved'
                    ? <CheckCircle className="h-6 w-6 text-success" />
                    : <AlertCircle className="h-6 w-6 text-warning" />
                  }
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">
                    {kycResult === 'approved'
                      ? <Trans>¡Identidad verificada!</Trans>
                      : <Trans>En revisión</Trans>}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {kycResult === 'approved'
                      ? <Trans>Tu cuenta está activa. Ya puedes recibir pagos.</Trans>
                      : <Trans>Tu documentación está siendo revisada. Te notificaremos en 24h.</Trans>}
                  </p>
                </div>
                <Badge variant={kycResult === 'approved' ? 'success' : 'warning'}>
                  {kycResult === 'approved' ? <Trans>Aprobado</Trans> : <Trans>En revisión</Trans>}
                </Badge>
                {isPreview && (
                  <p className="text-xs text-muted-foreground text-center">
                    <Trans>Estado real: {kycStatus}</Trans>
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
