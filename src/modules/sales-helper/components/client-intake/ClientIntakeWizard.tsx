import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from '@/shared/components/animated-icons';
import { useClientIntakeStore } from '../../stores/client-intake-store';
import { DynamicIsland } from '@/shared/components/DynamicIsland';
import { useDynamicIslandStore } from '@/shared/stores/useDynamicIslandStore';
import { TypewriterText } from '@/shared/components/common/TypewriterText';
import { StepContact } from './StepContact';
import { StepCountry } from './StepCountry';
import { StepNeeds } from './StepNeeds';
import { StepDestinationCountry } from './StepDestinationCountry';
import { StepProductType } from './StepProductType';
import { StepVolume } from './StepVolume';
import { StepSummary } from './StepSummary';

const STEP_LABELS_LOCAL = ['Contacto', 'País', 'Servicios', 'Volumen', 'Resumen'];
const STEP_LABELS_INTL = [
  'Contacto',
  'País',
  'Servicios',
  'Destino',
  'Producto',
  'Volumen',
  'Resumen',
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

const STEP_MESSAGES_LOCAL = [
  '¿Cómo te podemos contactar?',
  '¿En qué país operas?',
  '¿Qué servicios necesitas?',
  '¿Cuánto volumen manejas?',
  'Revisa tu información',
];

const STEP_MESSAGES_INTL = [
  '¿Cómo te podemos contactar?',
  '¿En qué país operas?',
  '¿Qué servicios necesitas?',
  '¿A qué país envías?',
  '¿Qué producto te interesa?',
  '¿Cuánto volumen manejas?',
  'Revisa tu información',
];

export function ClientIntakeWizard() {
  const { needsInternational } = useClientIntakeStore();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const { setStep: setIslandStep, hide: hideIsland, reset: resetIsland } = useDynamicIslandStore();

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => s + 1);
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  }, []);

  const goToStep = useCallback(
    (target: number) => {
      setDirection(target > step ? 1 : -1);
      setStep(target);
    },
    [step],
  );

  const stepLabels = useMemo(() => {
    if (step <= 2) return STEP_LABELS_INTL;
    return needsInternational ? STEP_LABELS_INTL : STEP_LABELS_LOCAL;
  }, [needsInternational, step]);

  const stepMessages = useMemo(() => {
    if (step <= 2) return STEP_MESSAGES_INTL;
    return needsInternational ? STEP_MESSAGES_INTL : STEP_MESSAGES_LOCAL;
  }, [needsInternational, step]);

  useEffect(() => {
    setIslandStep(step, stepLabels.length, stepLabels[step] || '');
    return () => { hideIsland(); resetIsland(); };
  }, []);

  useEffect(() => {
    setIslandStep(step, stepLabels.length, stepLabels[step] || '');
  }, [step, stepLabels, setIslandStep]);

  const renderStep = () => {
    if (step === 0) return <StepContact onNext={goNext} />;
    if (step === 1) return <StepCountry onNext={goNext} />;
    if (step === 2) return <StepNeeds onNext={goNext} />;

    if (needsInternational) {
      if (step === 3) return <StepDestinationCountry onNext={goNext} />;
      if (step === 4) return <StepProductType onNext={goNext} />;
      if (step === 5) return <StepVolume onNext={goNext} />;
      return <StepSummary />;
    }

    if (step === 3) return <StepVolume onNext={goNext} />;
    return <StepSummary />;
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center pt-4">
      <DynamicIsland showBalance={false} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center mt-6 mb-8"
        >
          <h2 className="font-heading text-2xl font-bold text-foreground">
            <TypewriterText
              text={stepMessages[step] || ''}
              speed={30}
              delay={0}
            />
          </h2>
        </motion.div>
      </AnimatePresence>

      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="w-full"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {step > 0 && (
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={goBack}
          className="mt-6 flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Atrás
        </motion.button>
      )}
    </div>
  );
}
