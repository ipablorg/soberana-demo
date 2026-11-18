import { useCallback, useEffect, useState } from 'react';
import type { VerifyIdentityValues, BusinessValues } from '../lib/verify-identity.schema';
import type { 
  KycProgress, 
  StepName, 
  StepValidation,
  IndividualStepName,
  BusinessStepName
} from '../lib/kyc-progress';
import {
  getProgress,
  saveProgress,
  updateStepProgress,
  isStepComplete,
  getCompletedSteps,
  getNextPendingStep,
  createEmptyProgress,
  getStepValidations,
  getStepDefinitions,
  calculateOverallProgress,
  getStepLabel,
  getStepDescription,
} from '../lib/kyc-progress';

interface UseKycProgressOptions {
  customerId: string | undefined;
  customerType: 'individual' | 'business';
}

export function useKycProgress({ customerId, customerType }: UseKycProgressOptions) {
  const [progress, setProgress] = useState<KycProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!customerId) {
      setProgress(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    getProgress(customerId)
      .then((data) => {
        if (!data) {
          const newProgress = createEmptyProgress(customerId, customerType);
          setProgress(newProgress);
          void saveProgress(customerId, newProgress);
        } else {
          setProgress(data);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error('Failed to load progress'));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [customerId, customerType]);

  const updateProgressForStep = useCallback(async (
    stepName: StepName,
    values: Partial<VerifyIdentityValues | BusinessValues>,
    isCompleted: boolean = false,
  ): Promise<void> => {
    if (!customerId || !progress) return;

    const validations = getStepValidations(stepName, values, customerType);
    const stepValidations: StepValidation[] = Object.values(validations).map(v => ({
      field: v.field,
      status: isCompleted ? 'passed' : v.status,
      message: v.message,
    }));

    await updateStepProgress(customerId, stepName, isCompleted, stepValidations);

    setProgress(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        steps: {
          ...prev.steps,
          [stepName]: {
            completed: isCompleted,
            completedAt: isCompleted ? new Date().toISOString() : undefined,
            validations: stepValidations,
          },
        },
        overallProgress: calculateOverallProgress({
          ...prev,
          steps: {
            ...prev.steps,
            [stepName]: {
              completed: isCompleted,
              completedAt: isCompleted ? new Date().toISOString() : undefined,
              validations: stepValidations,
            },
          },
        }),
        lastUpdated: new Date().toISOString(),
      };
    });
  }, [customerId, progress, customerType]);

  const initializeProgress = useCallback(async (): Promise<void> => {
    if (!customerId) return;

    const newProgress = createEmptyProgress(customerId, customerType);
    setProgress(newProgress);
    await saveProgress(customerId, newProgress);
  }, [customerId, customerType]);

  const resetProgress = useCallback(async (): Promise<void> => {
    if (!customerId) return;

    await initializeProgress();
  }, [customerId, initializeProgress]);

  const checkStepCompletion = useCallback(async (stepName: StepName): Promise<boolean> => {
    if (!customerId) return false;

    return isStepComplete(customerId, stepName);
  }, [customerId]);

  const getCompletedStepsList = useCallback(async (): Promise<StepName[]> => {
    if (!customerId) return [];

    return getCompletedSteps(customerId);
  }, [customerId]);

  const getNextStep = useCallback(async (): Promise<StepName | null> => {
    if (!customerId) return null;

    return getNextPendingStep(customerId, customerType);
  }, [customerId, customerType]);

  const getStepInfo = useCallback((stepName: StepName) => {
    return {
      label: getStepLabel(stepName, customerType),
      description: getStepDescription(stepName, customerType),
      progress: progress?.steps[stepName],
    };
  }, [customerType, progress]);

  const getAllStepsInfo = useCallback(() => {
    const stepNames = getStepDefinitions(customerType);
    
    return stepNames.map(stepName => ({
      name: stepName,
      label: getStepLabel(stepName, customerType),
      description: getStepDescription(stepName, customerType),
      progress: progress?.steps[stepName],
    }));
  }, [customerType, progress]);

  return {
    progress,
    isLoading,
    error,
    updateProgressForStep,
    initializeProgress,
    resetProgress,
    checkStepCompletion,
    getCompletedStepsList,
    getNextStep,
    getStepInfo,
    getAllStepsInfo,
    overallProgress: progress?.overallProgress ?? 0,
    isInitialized: progress !== null,
  };
}