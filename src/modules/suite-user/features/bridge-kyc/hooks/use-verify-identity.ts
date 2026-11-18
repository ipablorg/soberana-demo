import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useKYC } from '@/shared/hooks/useKYC';
import { isUnsupportedApiProviderError } from '@/shared/hooks/useKYC';
import { mapCreateCustomerError } from '@/shared/hooks/use-kyc-create-error';
import { graphqlClient } from '@/shared/lib/graphql-client';
import {
  saveSessionDraft,
  loadSessionDraft,
  clearSessionDraft,
  getDraftValuesExcludingBackendHydrated,
  setHydratingFromBackend,
  getIsHydratingFromBackend,
} from '../lib/session-draft';
import {
  mapBridgeErrorToFieldErrors,
  getFirstErrorForField,
  getErrorsForField,
  type FieldError,
} from '../lib/error-mapper';
import { canSubmit, setSubmittingGuard } from '../lib/submit-guards';
import {
  GetCustomerProfileDocument,
  type GetCustomerProfileQuery,
  type GetCustomerProfileQueryVariables,
} from '@/graphql/queries/customers/get-customer-profile';
import {
  buildVerifyIdentitySchema,
  businessSchema,
  type VerifyIdentityValues,
  type BusinessValues,
} from '../lib/verify-identity.schema';
import { mapVerifyValuesToApiPayload, mapBusinessValuesToApiPayload } from '../lib/verify-identity.mapper';
import { withLocalizedMessages } from '../lib/localize-validation-messages';
import { documentTypeShowsExpiration, isUsaDocumentType, type DocumentType } from '../lib/document-type-semantics';
import { getDefaultTaxIdType, isAllowedTaxIdType } from '../lib/tax-id-type-options';
import { DEFAULT_SOF_QUESTIONNAIRE_FIELDS } from '../lib/sof-defaults';
import {
  canCompleteVerifyIdentity,
  classifyPendingWorkflowRequirements,
  hasPersistedVerifyIdentityReviewProgress,
  isWorkflowOnlyNextStepState,
  shouldResumeVerifyIdentity,
} from './use-verify-identity-state';
import {
  formatPendingRequirementLabel,
  formatRequirementLabel,
  isWorkflowOnlyKycRequirementKey,
  KYC_TERMINAL_LIFECYCLES,
} from '../lib/kyc-snapshot-state';
import {
  buildVerifyIdentityHydrationValues,
  isHydratableVerifyIdentityValueDirty,
} from '../lib/verify-identity-hydration';

export const INDIVIDUAL_VERIFY_STEPS = ['personal', 'address', 'document', 'review'] as const;
export const BUSINESS_VERIFY_STEPS = ['business_basic', 'business_address', 'business_compliance', 'business_documents', 'business_ubos', 'review'] as const;

export type IndividualVerifyStep = (typeof INDIVIDUAL_VERIFY_STEPS)[number];
export type BusinessVerifyStep = (typeof BUSINESS_VERIFY_STEPS)[number];
export type VerifyStep = IndividualVerifyStep | BusinessVerifyStep;

/** Fields validated when leaving each individual step (index-aligned with INDIVIDUAL_VERIFY_STEPS). */
const INDIVIDUAL_STEP_FIELDS: ReadonlyArray<ReadonlyArray<keyof VerifyIdentityValues>> = [
  [
    'birth_date',
    'nationality',
    'additional_nationality',
    'place_of_birth_country',
    'place_of_birth_city',
    'tax_id',
    'tax_id_type',
    'source_of_funds',
    'employment_status',
    'account_purpose',
    'account_purpose_other',
    'expected_monthly_payments_usd',
    'acting_as_intermediary',
    'most_recent_occupation',
  ],
  ['address_line_1', 'city', 'state', 'postal_code', 'country'],
  [
    'type',
    'issuing_country',
    'number',
    'description',
    'expiration',
    'image_front',
    'image_back',
    'selfie',
    'supporting_documents',
  ],
  [],
];

/** Fields validated when leaving each business step (index-aligned with BUSINESS_VERIFY_STEPS). */
const BUSINESS_STEP_FIELDS: ReadonlyArray<ReadonlyArray<string>> = [
  [
    'business_legal_name',
    'business_type',
    'business_industry',
    'incorporation_date',
    'business_description',
    'primary_website',
    'website_absence_reason',
    'registration_number',
    'number_of_employees',
    'is_financial_institution',
    'tax_id',
    'tax_id_type',
    'tax_id_issuing_country',
  ],
  [
    'registered_address_line_1',
    'registered_address_city',
    'registered_address_state',
    'registered_address_postal_code',
    'registered_address_country',
    'physical_address_line_1',
    'physical_address_city',
    'physical_address_state',
    'physical_address_postal_code',
    'physical_address_country',
  ],
  [
    'source_of_funds',
    'source_of_funds_description',
    'account_purpose',
    'account_purpose_other',
    'estimated_annual_revenue_usd',
    'high_risk_activities',
    'operates_in_prohibited_countries',
    'conducts_money_services',
    'conducts_money_services_using_bridge',
    'conducts_money_services_description',
    'compliance_screening_explanation',
  ],
  ['proof_of_address_document', 'business_formation_document'],
  ['ubos'],
  [],
];

const INDIVIDUAL_DEFAULT_VALUES: VerifyIdentityValues = {
  birth_date: '',
  nationality: '',
  additional_nationality: undefined,
  place_of_birth_country: undefined,
  place_of_birth_city: undefined,
  tax_id: '',
  tax_id_type: '',
  address_line_1: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
  type: 'PASSPORT',
  issuing_country: '',
  number: '',
  description: '',
  expiration: '',
  source_of_funds: undefined,
  employment_status: undefined,
  account_purpose: undefined,
  account_purpose_other: undefined,
  expected_monthly_payments_usd: undefined,
  acting_as_intermediary: false,
  most_recent_occupation: undefined,
  selfie: undefined,
  supporting_documents: undefined,
  image_front: '',
  image_back: undefined,
};

/**
 * Empty business form. The industry has no default (NF-7): KiraFin rejects
 * "other", so the customer must pick one (the schema reports it as missing).
 */
export const BUSINESS_DEFAULT_VALUES: BusinessValues = {
  business_legal_name: '',
  business_type: 'llc',
  business_industry: undefined as unknown as BusinessValues['business_industry'],
  incorporation_date: '',
  primary_website: '',
  website_absence_reason: '',
  registration_number: '',
  number_of_employees: undefined,
  is_financial_institution: false,
  business_description: '',
  is_dao: false,
  tax_id: '',
  tax_id_type: '',
  tax_id_issuing_country: '',
  registered_address_line_1: '',
  registered_address_city: '',
  registered_address_state: '',
  registered_address_postal_code: '',
  registered_address_country: '',
  physical_address_line_1: '',
  physical_address_city: '',
  physical_address_state: '',
  physical_address_postal_code: '',
  physical_address_country: '',
  source_of_funds: 'owners_capital',
  account_purpose: 'receive_payments_for_goods_and_services',
  account_purpose_other: '',
  estimated_annual_revenue_usd: '0_99999',
  expected_monthly_payments_usd: undefined,
  source_of_funds_description: '',
  conducts_money_services: false,
  conducts_money_services_using_bridge: false,
  conducts_money_services_description: '',
  high_risk_activities: ['none_of_the_above'],
  high_risk_activities_explanation: '',
  operates_in_prohibited_countries: false,
  compliance_screening_explanation: '',
  proof_of_address_document: '',
  business_formation_document: '',
  ubos: [],
};

/**
 * Orchestrates the in-app Verify Identity wizard: a single RHF form validated
 * per step, plus the submit that maps validated values into the api payload and
 * calls `useKYC().createCustomer`. KYC is a manual review: there is no ToS step,
 * so `tosLink` is always null and nothing waits on a ToS acceptance.
 */
export function useVerifyIdentity() {
  const {
    createCustomer,
    customerType,
    hasUnsupportedApiProviderFallback,
    isStartingTos,
    kycStatus,
    customerCountry,
    missingDocumentPurposes,
    missingFields,
    missingQuestionnaireFields,
    needsKycResume,
    needsKycRetry,
    refreshSnapshot,
    retryKyc,
    isRetryingKyc,
    isRefreshingSnapshot,
    startTos,
    tosAccepted,
    hasSubmittedIdentityProgress,
    unsupportedApiProviderMessage,
    snapshot,
    customerId,
  } = useKYC();
  const [stepIndex, setStepIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const isBusinessFlow = customerType === 'business';
  const currentSteps = isBusinessFlow ? BUSINESS_VERIFY_STEPS : INDIVIDUAL_VERIFY_STEPS;
  const currentDefaultValues = isBusinessFlow ? BUSINESS_DEFAULT_VALUES : INDIVIDUAL_DEFAULT_VALUES;
  const currentSchema = isBusinessFlow
    ? businessSchema
    : buildVerifyIdentitySchema([...DEFAULT_SOF_QUESTIONNAIRE_FIELDS]);

  const form = useForm({
    resolver: withLocalizedMessages(zodResolver(currentSchema)),
    mode: 'onChange',
    defaultValues: currentDefaultValues,
  });

  const watchedNationality = isBusinessFlow ? '' : form.watch('nationality');
  const watchedTaxIdIssuingCountry = isBusinessFlow ? form.watch('tax_id_issuing_country') : '';

  const hasLoadedLocalStorageRef = useRef(false);

  useEffect(() => {
    if (hasLoadedLocalStorageRef.current) return;

    const draft = loadSessionDraft(customerId ?? undefined);
    if (draft && Object.keys(draft).length > 0) {
      const draftValues = getDraftValuesExcludingBackendHydrated(draft);

      Object.entries(draftValues).forEach(([field, value]) => {
        if (value !== undefined && value !== '') {
          form.setValue(field as any, value as any, {
            shouldDirty: true,
            shouldTouch: false,
            shouldValidate: false,
          });
        }
      });
    }

    hasLoadedLocalStorageRef.current = true;
  }, [form, customerId]);

  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: customerProfileData, isFetched: profileFetched } = useQuery({
    queryKey: ['kyc-customer-profile', customerId],
    queryFn: async () => graphqlClient.request<GetCustomerProfileQuery, GetCustomerProfileQueryVariables>(
      GetCustomerProfileDocument,
      { id: customerId as string },
    ),
    enabled: Boolean(customerId),
    staleTime: 5 * 60 * 1000,
  });

  const hydratableValues = useMemo(
    () => buildVerifyIdentityHydrationValues(customerProfileData?.customers_findById),
    [customerProfileData],
  );

  const pendingRequirementBuckets = useMemo(
    () => classifyPendingWorkflowRequirements({
      pendingRequirements: snapshot?.requirements.pending ?? [],
    }),
    [snapshot?.requirements.pending],
  );

  const editableMissingFields = useMemo(
    () => missingFields.filter((field) => !isWorkflowOnlyKycRequirementKey(field)),
    [missingFields],
  );

  useEffect(() => {
    if (!isBusinessFlow) {
      requiredDocumentsBootstrap(form, missingDocumentPurposes);
    }
  }, [form, missingDocumentPurposes, isBusinessFlow]);

  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (hasHydratedRef.current) return;

    if (customerId && !profileFetched) {
      return;
    }

    setHydratingFromBackend(true);

    const backendValues = Object.entries(hydratableValues) as Array<
      [keyof typeof hydratableValues, string | undefined]
    >;

    backendValues.forEach(([field, value]) => {
      const currentValue = form.getValues(field as any);
      const dirty = form.getFieldState(field as any).isDirty;

      if (!isHydratableVerifyIdentityValueDirty(currentValue, value, dirty)) {
        return;
      }

      form.setValue(field as any, value as any, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    });

    const draft = loadSessionDraft(customerId ?? undefined);
    if (draft && Object.keys(draft).length > 0) {
      const draftValues = getDraftValuesExcludingBackendHydrated(draft);

      Object.entries(draftValues).forEach(([field, value]) => {
        if (value !== undefined) {
          form.setValue(field as any, value as any, {
            shouldDirty: true,
            shouldTouch: false,
            shouldValidate: false,
          });
        }
      });
    }

    setHydratingFromBackend(false);
    hasHydratedRef.current = true;
  }, [form, hydratableValues, customerId, profileFetched]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (getIsHydratingFromBackend()) {
        return;
      }

      const hasValues = Object.values(values).some(v => v !== undefined && v !== '');
      if (!hasValues) return;

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        saveSessionDraft(values as any, customerId ?? undefined);
        debounceTimeoutRef.current = null;
      }, 300);
    });

    return () => {
      subscription.unsubscribe();
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [form, customerId]);

  const clearFieldError = useCallback((fieldName: string) => {
    setFieldErrors(prev => prev.filter(e => e.field !== fieldName));
  }, []);

  const isLastStep = stepIndex === currentSteps.length - 1;
  const hasOutstandingRemediationRequirements =
    editableMissingFields.length > 0 ||
    missingDocumentPurposes.length > 0 ||
    missingQuestionnaireFields.length > 0;
  const isCorrectionFlow =
    (needsKycResume || needsKycRetry) && hasOutstandingRemediationRequirements;
  const isResumeState = shouldResumeVerifyIdentity({
    hasResumeAction: needsKycResume || hasSubmittedIdentityProgress,
    hasOutstandingRequirements: hasOutstandingRemediationRequirements,
    kycStatus,
  });
  // KYC is a manual review by operations: there is no Terms of Service step,
  // so a ToS link the backend may still return never holds the flow pending.
  const reviewTosLink: string | null = null;
  const requiresReviewTosAcceptance = false;
  const isApprovedWorkflowOnlyNextStep = isWorkflowOnlyNextStepState({
    hasWorkflowOnlyBlockers: pendingRequirementBuckets.workflow.length > 0,
    hasOutstandingRequirements: hasOutstandingRemediationRequirements,
    kycStatus,
    needsTosAction: requiresReviewTosAcceptance,
  });
  const hasPersistedReviewProgress = hasPersistedVerifyIdentityReviewProgress({
    kycStatus,
    tosAccepted,
    hasSubmittedIdentityProgress: hasSubmittedIdentityProgress || needsKycResume,
  });
  const canComplete = canCompleteVerifyIdentity({
    submitted,
    requiresReviewTosAcceptance,
    hasPersistedReviewProgress,
  });

  const isProcessing = useMemo(
    () =>
      submitted &&
      !KYC_TERMINAL_LIFECYCLES.includes(kycStatus) &&
      !requiresReviewTosAcceptance,
    [submitted, kycStatus, requiresReviewTosAcceptance],
  );

  const isLockedPending =
    kycStatus !== 'NOT_INITIATED' &&
    !KYC_TERMINAL_LIFECYCLES.includes(kycStatus) &&
    !hasOutstandingRemediationRequirements;

  useEffect(() => {
    if (!isResumeState) return;

    setStepIndex(currentSteps.length - 1);
    setSubmitted(true);
  }, [isResumeState, currentSteps.length]);

  useEffect(() => {
    if (isResumeState) return;
    if (!needsKycResume && !needsKycRetry) return;
    if (!hasOutstandingRemediationRequirements) return;

    let nextStepIndex: number;
    
    if (isBusinessFlow) {
      nextStepIndex = 0; // For business, always start from first step on correction
    } else {
      nextStepIndex =
        missingDocumentPurposes.length > 0 ||
        editableMissingFields.includes('selfie') ||
        editableMissingFields.includes('document_verification')
          ? 2
          : editableMissingFields.some((field) =>
              ['address_line_1', 'city', 'state', 'postal_code', 'country'].includes(field),
            )
            ? 1
            : 0;
    }

    setSubmitted(false);
    setStepIndex(nextStepIndex);
  }, [
    hasOutstandingRemediationRequirements,
    isResumeState,
    missingDocumentPurposes,
    editableMissingFields,
    needsKycResume,
    needsKycRetry,
    isBusinessFlow,
  ]);

  useEffect(() => {
    if (!customerCountry || isBusinessFlow) return;

    form.setValue('country', customerCountry, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [customerCountry, form, isBusinessFlow]);

  const watchedDocumentType = isBusinessFlow ? 'PASSPORT' : form.watch('type');
  const watchedIssuingCountry = isBusinessFlow ? '' : form.watch('issuing_country');

  useEffect(() => {
    if (isBusinessFlow) return;
    if (!watchedDocumentType || !watchedIssuingCountry) {
      return;
    }

    if (documentTypeShowsExpiration(watchedIssuingCountry, watchedDocumentType)) {
      return;
    }

    if (!form.getValues('expiration')) {
      return;
    }

    form.setValue('expiration', undefined, {
      shouldDirty: true,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, [form, watchedDocumentType, watchedIssuingCountry, isBusinessFlow]);

  // Bridge only accepts SSN/ITIN for US-issued identifying documents — when
  // the issuing country flips to/from the USA, reset an incompatible document
  // type so the form never holds an invalid DNI/PASSPORT/OTHER for the USA.
  useEffect(() => {
    if (isBusinessFlow) return;
    if (!watchedDocumentType || !watchedIssuingCountry) {
      return;
    }

    const isUsaIssuing = watchedIssuingCountry === 'USA';
    const typeIsUsaOnly = isUsaDocumentType(watchedDocumentType);

    if (isUsaIssuing === typeIsUsaOnly) {
      return;
    }

    const nextType: DocumentType = isUsaIssuing ? 'SSN' : 'PASSPORT';
    form.setValue('type', nextType, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    form.setValue('expiration', undefined, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [form, watchedDocumentType, watchedIssuingCountry, isBusinessFlow]);

  useEffect(() => {
    if (isBusinessFlow) return;
    const taxIdType = form.getValues('tax_id_type');

    if (!watchedNationality) {
      return;
    }

    if (taxIdType && isAllowedTaxIdType(watchedNationality, taxIdType)) {
      return;
    }

    const nextTaxIdType = getDefaultTaxIdType(watchedNationality);

    if (!nextTaxIdType) {
      return;
    }

    form.setValue('tax_id_type', nextTaxIdType, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [form, watchedNationality, isBusinessFlow]);

  useEffect(() => {
    if (!isBusinessFlow) return;
    const issuingCountry = form.getValues('tax_id_issuing_country');
    const taxIdType = form.getValues('tax_id_type');

    if (!issuingCountry) {
      return;
    }

    if (taxIdType && isAllowedTaxIdType(issuingCountry, taxIdType, 'business')) {
      return;
    }

    const nextTaxIdType = getDefaultTaxIdType(issuingCountry, 'business');

    if (!nextTaxIdType) {
      return;
    }

    form.setValue('tax_id_type', nextTaxIdType, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [form, watchedTaxIdIssuingCountry, isBusinessFlow]);

  const requirementsSummary = [
    ...editableMissingFields.map((field) => formatRequirementLabel('field', field)),
    ...missingDocumentPurposes.map((field) => formatRequirementLabel('document', field)),
    ...missingQuestionnaireFields.map((field) => formatRequirementLabel('questionnaire', field)),
  ];

  const pendingEditableSummary = pendingRequirementBuckets.editable.map((item) => (
    formatRequirementLabel(item.kind === 'document_purpose' ? 'document' : 'field', item.key)
  ));

  const pendingWorkflowSummary = pendingRequirementBuckets.workflow.map((item) => (
    formatPendingRequirementLabel(item.kind as 'field' | 'document_purpose' | 'review', item.key)
  ));

  const goNext = useCallback(async () => {
    const stepFields = isBusinessFlow 
      ? BUSINESS_STEP_FIELDS[stepIndex] 
      : INDIVIDUAL_STEP_FIELDS[stepIndex] as (keyof VerifyIdentityValues)[];
    
    const valid = await form.trigger(stepFields as any);
    if (valid) {
      setStepIndex((i) => Math.min(i + 1, currentSteps.length - 1));
    }
  }, [form, stepIndex, isBusinessFlow, currentSteps.length]);

  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const submit = form.handleSubmit(async (values) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    saveSessionDraft(values as any, customerId ?? undefined);

    if (!canSubmit()) {
      return;
    }
    setSubmittingGuard(true);
    setFieldErrors([]);

    try {
      if (isApprovedWorkflowOnlyNextStep) {
        setSubmitted(true);
        return;
      }

      const payload = isBusinessFlow 
        ? mapBusinessValuesToApiPayload(values as BusinessValues)
        : mapVerifyValuesToApiPayload(values as VerifyIdentityValues);
      
      payload.customer_type = customerType;
      if (needsKycRetry) {
        await retryKyc(payload);
      } else {
        await createCustomer(payload);
      }

      setSubmitted(true);
      clearSessionDraft(customerId ?? undefined);

      // Kickstart snapshot refresh so pending checks appear immediately
      // and the page can transition from wizard to waiting state.
      refreshSnapshot().catch(() => {
        // Background refresh errors are non-critical
      });
    } catch (err) {
      if (isUnsupportedApiProviderError(err)) {
        return;
      }

      saveSessionDraft(values as any, customerId ?? undefined);

      const errors = mapBridgeErrorToFieldErrors(err);
      setFieldErrors(errors);

      const generalErrors = errors.filter(e => e.field === 'general');
      if (generalErrors.length > 0) {
        toast.error(mapCreateCustomerError(err));
      }
    } finally {
      setSubmittingGuard(false);
    }
  });

  return {
    form,
    stepIndex,
    step: currentSteps[stepIndex],
    isLastStep,
    goNext,
    goBack,
    submit,
    isSubmitting: form.formState.isSubmitting,
    submitted,
    tosLink: reviewTosLink,
    isResumeState,
    requiresReviewTosAcceptance,
    canComplete,
    hasPersistedReviewProgress,
    isProcessing,
    isLockedPending,
    isCorrectionFlow,
    isStartingTos,
    isRefreshingSnapshot,
    isRetryingKyc,
    startTos,
    refreshSnapshot,
    hasUnsupportedApiProviderFallback,
    unsupportedApiProviderMessage,
    needsKycRetry,
    needsKycResume,
    requirementsSummary,
    customerCountry,
    missingDocumentPurposes,
    missingFields: editableMissingFields,
    effectiveQuestionnaireFields: isBusinessFlow ? [] : [...DEFAULT_SOF_QUESTIONNAIRE_FIELDS],
    hydratableValues,
    pendingEditableSummary,
    pendingWorkflowSummary,
    fieldErrors,
    getErrorForField: (field: string) => getFirstErrorForField(fieldErrors, field),
    getErrorsForField: (field: string) => getErrorsForField(fieldErrors, field),
    clearFieldError,
    customerType,
  };
}

function requiredDocumentsBootstrap(
  form: UseFormReturn<VerifyIdentityValues>,
  missingDocumentPurposes: string[],
): void {
  const current = form.getValues('supporting_documents') ?? [];

  if (current.length === missingDocumentPurposes.length) {
    return;
  }

  form.setValue(
    'supporting_documents',
    missingDocumentPurposes.map((purpose, index) => ({
      purpose: purpose as 'proof_of_address' | 'proof_of_source_of_funds' | 'proof_of_source_of_wealth' | 'proof_of_tax_identification' | 'proof_of_account_purpose' | 'proof_of_relationship' | 'proof_of_individual_name_change' | 'other',
      file: current[index]?.file ?? '',
      description: current[index]?.description ?? '',
    })),
    {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    },
  );
}
