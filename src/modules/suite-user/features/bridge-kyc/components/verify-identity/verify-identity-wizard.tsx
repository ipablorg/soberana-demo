import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLingui } from '@lingui/react/macro';
import { Form } from '@/shared/components/ui/form';
import { Button } from '@/shared/components/ui/button';
import { WizardStepper, type WizardStepperItem } from './wizard-stepper';
import { Building2, ChevronLeft, Loader2, User } from '@/shared/components/animated-icons';
import { useKYC } from '@/shared/hooks/useKYC';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useKycTypeSelectionStore } from '@/shared/stores/useKycTypeSelectionStore';
import { clearSessionDraft } from '../../lib/session-draft';
import { useVerifyIdentity } from '../../hooks/use-verify-identity';
import { useKycProgress } from '../../hooks/use-kyc-progress';
import { StepPersonal } from './step-personal';
import { StepAddress } from './step-address';
import { StepDocument } from './step-document';
import { StepReview } from './step-review';
import { StepBusinessBasic } from './step-business-basic';
import { StepBusinessAddress } from './step-business-address';
import { StepBusinessCompliance } from './step-business-compliance';
import { StepBusinessDocuments } from './step-business-documents';
import { StepBusinessUBOs } from './step-business-ubos';
import { KycProgressIndicator } from '../kyc-progress';

interface VerifyIdentityWizardProps {
  /** Called when the user finishes the flow (after ToS acceptance, if required). */
  onComplete?: () => void;
}

/**
 * First wizard step while no customer profile exists yet: pick whether the
 * account belongs to an individual or a business. Registration no longer
 * captures this — the wizard is the single selection point, which also fixes
 * the cross-device case (a type picked on device A never reached device B).
 * Once a customer exists the type is immutable, so the step is skipped.
 */
export function VerifyIdentityWizard({ onComplete }: VerifyIdentityWizardProps) {
  const { t } = useLingui();
  const { customerId } = useKYC();
  const [chosenType, setChosenType] = useState<'individual' | 'business' | null>(null);

  if (!customerId && chosenType === null) {
    return <AccountTypeSelectionStep onSelect={setChosenType} />;
  }

  return (
    <div className="space-y-3">
      {/* key remounts the form with the right defaults when the type changes */}
      <VerifyIdentityWizardFlow key={chosenType ?? 'resolved-type'} onComplete={onComplete} />
      {!customerId && (
        <div className="text-center">
          <button
            type="button"
            className="text-xs text-muted-foreground underline underline-offset-2 transition-colors duration-150 hover:text-foreground"
            onClick={() => setChosenType(null)}
          >
            {t`Change account type`}
          </button>
        </div>
      )}
    </div>
  );
}

function AccountTypeSelectionStep({
  onSelect,
}: {
  onSelect: (type: 'individual' | 'business') => void;
}) {
  const { t } = useLingui();
  const { customerType } = useKYC();
  const email = useAuthStore((state) => state.user?.email);
  const selectType = useKycTypeSelectionStore((state) => state.selectType);
  const [selected, setSelected] = useState<'individual' | 'business'>(
    customerType === 'business' ? 'business' : 'individual',
  );

  const handleContinue = () => {
    // The draft holds fields for the previous form shape — drop it so the
    // remounted form starts clean for the chosen type.
    clearSessionDraft(undefined);
    selectType(selected, email);
    onSelect(selected);
  };

  const options: Array<{
    value: 'individual' | 'business';
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
  }> = [
    {
      value: 'individual',
      icon: User,
      title: t`Individual`,
      description: t`The account is for personal use, under your own name.`,
    },
    {
      value: 'business',
      icon: Building2,
      title: t`Business`,
      description: t`The account belongs to a company. We will ask for its legal details and owners.`,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-1 text-center">
        <h3 className="font-semibold text-lg">{t`Who is this account for?`}</h3>
        <p className="text-sm text-muted-foreground">
          {t`Choose the account type. You will complete identity verification for it next.`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => {
          const isSelected = selected === option.value;
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors duration-150 ${
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/40'
              }`}
              onClick={() => setSelected(option.value)}
            >
              <span
                className={`rounded-lg border p-2 ${
                  isSelected
                    ? 'border-primary/30 bg-primary/15 text-primary'
                    : 'border-border bg-muted/50 text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="font-medium text-foreground">{option.title}</span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>

      <Button type="button" variant="gradient" className="w-full" onClick={handleContinue}>
        {t`Continue`}
      </Button>
    </div>
  );
}

const stepTransition = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.18, ease: 'easeOut' as const },
};

function VerifyIdentityWizardFlow({ onComplete }: VerifyIdentityWizardProps) {
  const { t } = useLingui();
  const {
    form,
    stepIndex,
    isLastStep,
    goNext,
    goBack,
    submit,
    isSubmitting,
    submitted,
    tosLink,
    isResumeState,
    canComplete,
    requiresReviewTosAcceptance,
    isCorrectionFlow,
    isStartingTos,
    isRefreshingSnapshot,
    isRetryingKyc,
    isProcessing,
    isLockedPending,
    startTos,
    refreshSnapshot,
    hasUnsupportedApiProviderFallback,
    unsupportedApiProviderMessage,
    needsKycResume,
    needsKycRetry,
    requirementsSummary,
    customerCountry,
    missingDocumentPurposes,
    effectiveQuestionnaireFields,
    hydratableValues,
    pendingEditableSummary,
    pendingWorkflowSummary,
    fieldErrors,
    getErrorsForField,
    clearFieldError,
    customerType,
    customerId,
  } = useVerifyIdentity();

  const { progress, updateProgressForStep, initializeProgress, getAllStepsInfo } = useKycProgress({
    customerId: customerId ?? undefined,
    customerType,
  });

  useEffect(() => {
    if (fieldErrors.length === 0) return;

    const firstFieldError = fieldErrors.find((e) => e.field !== 'general');
    if (!firstFieldError) return;

    const fieldName = firstFieldError.field as string;
    const timer = setTimeout(() => {
      const element = document.querySelector<HTMLElement>(
        `[name="${fieldName}"], [data-field="${fieldName}"]`,
      );
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus?.();
      }
    }, 80);

    return () => clearTimeout(timer);
  }, [fieldErrors]);

  // Processing (waiting for the review) is rendered inline by the review step and
  // the pending page; only an in-flight submit blocks the form with an overlay.
  const isBusy = isSubmitting || isRetryingKyc;
  const isBusinessFlow = customerType === 'business';

  const individualSteps: WizardStepperItem[] = [
    { title: t`Datos personales`, helper: t`Información básica` },
    { title: t`Dirección`, helper: t`Dónde vives` },
    { title: t`Documento`, helper: t`Carga de tu identificación` },
    { title: t`Revisión`, helper: t`Confirma tus datos` },
  ];

  const businessSteps: WizardStepperItem[] = [
    { title: t`Información de la empresa`, helper: t`Datos básicos` },
    { title: t`Direcciones`, helper: t`Domicilio legal y físico` },
    { title: t`Cumplimiento`, helper: t`Evaluación de riesgo` },
    { title: t`Documentos`, helper: t`Verificación de la empresa` },
    { title: t`Beneficiarios finales`, helper: t`Propietarios y control` },
    { title: t`Revisión`, helper: t`Confirma tus datos` },
  ];

  const steps = isBusinessFlow ? businessSteps : individualSteps;
  const currentSteps = isBusinessFlow ? ['business_basic', 'business_address', 'business_compliance', 'business_documents', 'business_ubos', 'review'] as const : ['personal', 'address', 'document', 'review'] as const;

  const showBack = stepIndex > 0 && !submitted && !isProcessing;
  const isBlockedByUnsupportedProvider =
    hasUnsupportedApiProviderFallback && isLastStep && !submitted;

  useEffect(() => {
    if (!progress && customerId) {
      void initializeProgress();
    }
  }, [progress, customerId, initializeProgress]);

  const handlePrimary = async () => {
    if (!isLastStep) {
      await goNext();
      if (progress) {
        const currentStepName = currentSteps[stepIndex];
        const formValues = form.getValues();
        await updateProgressForStep(currentStepName, formValues, false);
      }
      return;
    }
    if (!submitted) {
      await submit();
      if (progress) {
        const formValues = form.getValues();
        await updateProgressForStep('review' as const, formValues, true);
      }
      return;
    }
    onComplete?.();
  };

  const primaryLabel = !isLastStep
    ? t`Continue`
    : !submitted
      ? isBlockedByUnsupportedProvider
        ? t`Unavailable`
        : isCorrectionFlow
          ? t`Submit corrections`
          : needsKycRetry
            ? t`Retry verification`
            : needsKycResume
              ? t`Resume verification`
              : t`Submit`
      : isCorrectionFlow
        ? t`Corrections submitted`
        : t`Finish`;

  return (
    <div className="space-y-4 sm:space-y-6">
      {progress && (
        <KycProgressIndicator 
          progress={progress} 
          currentStep={stepIndex} 
          totalSteps={steps.length} 
        />
      )}
      
      <WizardStepper steps={steps} activeIndex={stepIndex} />

      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePrimary();
          }}
          className={`space-y-5 sm:space-y-6 ${isProcessing || isLockedPending ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <div className="relative">
            <AnimatePresence mode="wait">
              <fieldset disabled={isProcessing || isLockedPending} className="contents">
                <motion.div key={stepIndex} {...stepTransition}>
                  {isBusinessFlow ? (
                    <>
                      {stepIndex === 0 && (
                        <StepBusinessBasic
                          form={form}
                          getErrorsForField={getErrorsForField}
                          clearFieldError={clearFieldError}
                        />
                      )}
                      {stepIndex === 1 && (
                        <StepBusinessAddress
                          form={form}
                          lockedCountry={customerCountry}
                          getErrorsForField={getErrorsForField}
                          clearFieldError={clearFieldError}
                        />
                      )}
                       {stepIndex === 2 && (
                        <StepBusinessCompliance
                          form={form}
                          getErrorsForField={getErrorsForField}
                          clearFieldError={clearFieldError}
                        />
                      )}
                      {stepIndex === 3 && (
                        <StepBusinessDocuments
                          form={form}
                          getErrorsForField={getErrorsForField}
                          clearFieldError={clearFieldError}
                        />
                      )}
                      {stepIndex === 4 && (
                        <StepBusinessUBOs
                          form={form}
                          getErrorsForField={getErrorsForField}
                          clearFieldError={clearFieldError}
                        />
                      )}
                      {stepIndex === 5 && (
                        <StepReview
                          form={form}
                          submitted={submitted}
                          tosLink={tosLink}
                          isResumeState={isResumeState}
                          requiresTosAction={requiresReviewTosAcceptance}
                          isOpeningTos={isStartingTos}
                          onOpenTos={() => {
                            void startTos();
                          }}
                          hasUnsupportedProviderFallback={hasUnsupportedApiProviderFallback}
                          unsupportedProviderMessage={unsupportedApiProviderMessage}
                          isProcessing={isProcessing}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      {stepIndex === 0 && (
                        <StepPersonal
                          form={form}
                          requiredQuestionnaireFields={effectiveQuestionnaireFields}
                          getErrorsForField={getErrorsForField}
                          clearFieldError={clearFieldError}
                        />
                      )}
                      {stepIndex === 1 && (
                        <StepAddress
                          form={form}
                          lockedCountry={customerCountry}
                          getErrorsForField={getErrorsForField}
                          clearFieldError={clearFieldError}
                        />
                      )}
                      {stepIndex === 2 && (
                        <StepDocument
                          form={form}
                          requiredDocumentPurposes={missingDocumentPurposes}
                          requiresSelfie={requirementsSummary.includes('Selfie') || requirementsSummary.includes('Identity verification')}
                          getErrorsForField={getErrorsForField}
                          clearFieldError={clearFieldError}
                        />
                      )}
                      {stepIndex === 3 && (
                        <StepReview
                          form={form}
                          submitted={submitted}
                          tosLink={tosLink}
                          isResumeState={isResumeState}
                          requiresTosAction={requiresReviewTosAcceptance}
                          isOpeningTos={isStartingTos}
                          onOpenTos={() => {
                            void startTos();
                          }}
                          hasUnsupportedProviderFallback={hasUnsupportedApiProviderFallback}
                          unsupportedProviderMessage={unsupportedApiProviderMessage}
                          isProcessing={isProcessing}
                        />
                      )}
                    </>
                  )}
                </motion.div>
              </fieldset>
            </AnimatePresence>

            <AnimatePresence>
              {isBusy && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 z-40 flex items-start justify-center rounded-xl bg-background/70 pt-20 backdrop-blur-sm"
                  role="status"
                  aria-live="polite"
                >
                  <div className="flex flex-col items-center gap-3 rounded-lg border border-border/60 bg-card px-4 py-3 shadow-lg">
                    <div className="flex items-center gap-2.5">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        {isRetryingKyc
                          ? t`Retrying verification…`
                          : t`Submitting your information…`}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.reload()}
                    >
                      {t`Cancel and refresh`}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {(needsKycResume || needsKycRetry) && requirementsSummary.length > 0 && stepIndex < (isBusinessFlow ? 5 : 3) && (
            <div className="rounded-xl bg-muted/30 p-4 text-sm text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">{isCorrectionFlow ? t`What you need to correct` : t`What still needs attention`}</p>
              <ul className="list-disc space-y-1 pl-5">
                {requirementsSummary.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {stepIndex < (isBusinessFlow ? 5 : 3) && Object.values(hydratableValues).some(Boolean) && (
            <div className="rounded-xl border border-border/60 bg-card p-4 text-sm text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">{t`Saved data restored from your customer profile`}</p>
              <p>{isCorrectionFlow ? t`We restored the fields the backend already has so you can focus on the requested corrections before submitting again.` : t`We prefilled the fields the backend already exposes. You can edit them before submitting again.`}</p>
            </div>
          )}

          {stepIndex < (isBusinessFlow ? 5 : 3) && pendingEditableSummary.length > 0 && (
            <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-foreground space-y-2">
              <p className="font-medium">{t`Already submitted and waiting on review`}</p>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                {pendingEditableSummary.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {stepIndex < (isBusinessFlow ? 5 : 3) && pendingWorkflowSummary.length > 0 && (
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">{t`Provider workflow blockers`}</p>
              <ul className="list-disc space-y-1 pl-5">
                {pendingWorkflowSummary.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p>{t`These items cannot be edited here. Use refresh or support once the provider finishes its review.`}</p>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              {showBack ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={goBack}
                  disabled={isSubmitting}
                  className="w-full justify-center sm:w-auto"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t`Back`}
                </Button>
              ) : (
                (needsKycResume || needsKycRetry) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void refreshSnapshot()}
                    disabled={isRefreshingSnapshot || isSubmitting || isRetryingKyc}
                    className="w-full sm:w-auto"
                  >
                    {isRefreshingSnapshot && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isCorrectionFlow ? t`Check for updated requirements` : t`Refresh status`}
                  </Button>
                )
              )}
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full sm:w-auto"
              disabled={
                isSubmitting ||
                isRetryingKyc ||
                isProcessing ||
                isLockedPending ||
                (isLastStep && submitted && !canComplete) ||
                isBlockedByUnsupportedProvider
              }
            >
              {(isSubmitting || isRetryingKyc) && <Loader2 className="h-4 w-4 animate-spin" />}
              {isRetryingKyc ? t`Retrying` : primaryLabel}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
