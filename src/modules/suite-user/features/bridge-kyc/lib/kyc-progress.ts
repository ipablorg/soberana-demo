import type { VerifyIdentityValues, BusinessValues } from './verify-identity.schema';

export interface StepValidation {
  field: string;
  status: 'passed' | 'failed' | 'pending';
  message?: string;
}

export interface StepProgress {
  completed: boolean;
  completedAt?: string;
  validations: StepValidation[];
}

export interface KycProgress {
  customerId: string;
  customerType: 'individual' | 'business';
  steps: {
    [stepName: string]: StepProgress;
  };
  overallProgress: number;
  lastUpdated: string;
}

export type IndividualStepName = 'personal' | 'address' | 'document' | 'review';
export type BusinessStepName = 'business_basic' | 'business_address' | 'business_compliance' | 'business_documents' | 'business_ubos' | 'review';
export type StepName = IndividualStepName | BusinessStepName;

const PROGRESS_KEY_PREFIX = 'kyc_progress_';
const PROGRESS_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function getProgressKey(customerId: string): string {
  return `${PROGRESS_KEY_PREFIX}${customerId}`;
}

function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  
  try {
    const testKey = '__kyc_progress_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function getStepDefinitions(customerType: 'individual' | 'business'): StepName[] {
  if (customerType === 'individual') {
    return ['personal', 'address', 'document', 'review'];
  }
  return ['business_basic', 'business_address', 'business_compliance', 'business_documents', 'business_ubos', 'review'];
}

function getIndividualStepValidations(values: Partial<VerifyIdentityValues>): Record<string, StepValidation> {
  const validations: Record<string, StepValidation> = {};
  
  validations.birthDate = {
    field: 'birthDate',
    status: values.birth_date ? 'passed' : 'pending',
  };
  
  validations.nationality = {
    field: 'nationality',
    status: values.nationality ? 'passed' : 'pending',
  };
  
  validations.taxId = {
    field: 'taxId',
    status: values.tax_id ? 'passed' : 'pending',
  };
  
  validations.taxIdType = {
    field: 'taxIdType',
    status: values.tax_id_type ? 'passed' : 'pending',
  };
  
  return validations;
}

function getIndividualAddressValidations(values: Partial<VerifyIdentityValues>): Record<string, StepValidation> {
  const validations: Record<string, StepValidation> = {};
  
  validations.addressLine1 = {
    field: 'addressLine1',
    status: values.address_line_1 ? 'passed' : 'pending',
  };
  
  validations.city = {
    field: 'city',
    status: values.city ? 'passed' : 'pending',
  };
  
  validations.country = {
    field: 'country',
    status: values.country ? 'passed' : 'pending',
  };
  
  return validations;
}

function getIndividualDocumentValidations(values: Partial<VerifyIdentityValues>): Record<string, StepValidation> {
  const validations: Record<string, StepValidation> = {};
  
  const hasIdentifyingDoc = values.type && values.issuing_country;
  validations.identifying_information = {
    field: 'identifying_information',
    status: hasIdentifyingDoc ? 'passed' : 'pending',
  };
  
  validations.selfie = {
    field: 'selfie',
    status: values.selfie ? 'passed' : 'pending',
  };
  
  if (values.image_front) {
    validations.image_front = {
      field: 'image_front',
      status: 'passed',
    };
  }
  
  return validations;
}

function getBusinessBasicValidations(values: Partial<BusinessValues>): Record<string, StepValidation> {
  const validations: Record<string, StepValidation> = {};
  
  validations.businessLegalName = {
    field: 'businessLegalName',
    status: values.business_legal_name ? 'passed' : 'pending',
  };
  
  validations.businessType = {
    field: 'businessType',
    status: values.business_type ? 'passed' : 'pending',
  };
  
  return validations;
}

function getBusinessAddressValidations(values: Partial<BusinessValues>): Record<string, StepValidation> {
  const validations: Record<string, StepValidation> = {};
  
  validations.registered_address_line_1 = {
    field: 'registered_address_line_1',
    status: values.registered_address_line_1 ? 'passed' : 'pending',
  };
  
  validations.registered_address_city = {
    field: 'registered_address_city',
    status: values.registered_address_city ? 'passed' : 'pending',
  };
  
  validations.registered_address_country = {
    field: 'registered_address_country',
    status: values.registered_address_country ? 'passed' : 'pending',
  };
  
  return validations;
}

function getBusinessComplianceValidations(values: Partial<BusinessValues>): Record<string, StepValidation> {
  const validations: Record<string, StepValidation> = {};
  
  validations.sourceOfFunds = {
    field: 'sourceOfFunds',
    status: values.source_of_funds ? 'passed' : 'pending',
  };
  
  validations.accountPurpose = {
    field: 'accountPurpose',
    status: values.account_purpose ? 'passed' : 'pending',
  };
  
  return validations;
}

function getBusinessDocumentsValidations(values: Partial<BusinessValues>): Record<string, StepValidation> {
  const validations: Record<string, StepValidation> = {};

  validations.proof_of_address_document = {
    field: 'proof_of_address_document',
    status: values.proof_of_address_document ? 'passed' : 'pending',
  };

  validations.business_formation_document = {
    field: 'business_formation_document',
    status: values.business_formation_document ? 'passed' : 'pending',
  };

  return validations;
}

function getBusinessUBOsValidations(values: Partial<BusinessValues>): Record<string, StepValidation> {
  const validations: Record<string, StepValidation> = {};
  
  const hasUbo = values.ubos && values.ubos.length > 0;
  validations.has_ubos = {
    field: 'has_ubos',
    status: hasUbo ? 'passed' : 'pending',
  };
  
  if (hasUbo) {
    values.ubos.forEach((ubo, index) => {
      validations[`ubo_${index}_complete`] = {
        field: `ubo_${index}_complete`,
        status: (ubo.first_name && ubo.last_name && ubo.email && ubo.birth_date) ? 'passed' : 'pending',
      };
    });
  }
  
  return validations;
}

export function getStepValidations(
  stepName: StepName,
  values: Partial<VerifyIdentityValues | BusinessValues>,
  customerType: 'individual' | 'business',
): Record<string, StepValidation> {
  if (customerType === 'individual') {
    switch (stepName) {
      case 'personal':
        return getIndividualStepValidations(values as Partial<VerifyIdentityValues>);
      case 'address':
        return getIndividualAddressValidations(values as Partial<VerifyIdentityValues>);
      case 'document':
        return getIndividualDocumentValidations(values as Partial<VerifyIdentityValues>);
      case 'review':
        return {};
    }
  } else {
    switch (stepName) {
      case 'business_basic':
        return getBusinessBasicValidations(values as Partial<BusinessValues>);
      case 'business_address':
        return getBusinessAddressValidations(values as Partial<BusinessValues>);
      case 'business_compliance':
        return getBusinessComplianceValidations(values as Partial<BusinessValues>);
      case 'business_documents':
        return getBusinessDocumentsValidations(values as Partial<BusinessValues>);
      case 'business_ubos':
        return getBusinessUBOsValidations(values as Partial<BusinessValues>);
      case 'review':
        return {};
    }
  }
  
  return {};
}

export function calculateOverallProgress(progress: KycProgress): number {
  const stepNames = Object.keys(progress.steps);
  if (stepNames.length === 0) return 0;
  
  let totalValidations = 0;
  let passedValidations = 0;
  
  for (const stepName of stepNames) {
    const step = progress.steps[stepName];
    if (!step) continue;
    
    totalValidations += step.validations.length;
    passedValidations += step.validations.filter(v => v.status === 'passed').length;
  }
  
  if (totalValidations === 0) return 0;
  return Math.round((passedValidations / totalValidations) * 100);
}

export function createEmptyProgress(
  customerId: string,
  customerType: 'individual' | 'business',
): KycProgress {
  const stepNames = getStepDefinitions(customerType);
  const steps: KycProgress['steps'] = {};
  
  for (const stepName of stepNames) {
    steps[stepName] = {
      completed: false,
      validations: [],
    };
  }
  
  return {
    customerId,
    customerType,
    steps,
    overallProgress: 0,
    lastUpdated: new Date().toISOString(),
  };
}

export async function getProgress(customerId: string): Promise<KycProgress | null> {
  if (!isLocalStorageAvailable()) {
    return null;
  }
  
  try {
    const key = getProgressKey(customerId);
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    
    const data: KycProgress = JSON.parse(raw);
    
    const ageMs = Date.now() - new Date(data.lastUpdated).getTime();
    if (ageMs > PROGRESS_MAX_AGE_MS) {
      await clearProgress(customerId);
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
}

export async function saveProgress(customerId: string, progress: KycProgress): Promise<void> {
  if (!isLocalStorageAvailable()) {
    console.warn('[kyc-progress] localStorage not available');
    return;
  }
  
  try {
    const updatedProgress: KycProgress = {
      ...progress,
      overallProgress: calculateOverallProgress(progress),
      lastUpdated: new Date().toISOString(),
    };
    
    const key = getProgressKey(customerId);
    window.localStorage.setItem(key, JSON.stringify(updatedProgress));
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('[kyc-progress] localStorage quota exceeded');
    } else {
      console.warn('[kyc-progress] Failed to save progress:', error);
    }
  }
}

export async function updateStepProgress(
  customerId: string,
  stepName: StepName,
  completed: boolean,
  validations?: StepValidation[],
): Promise<void> {
  let progress = await getProgress(customerId);
  
  if (!progress) {
    return;
  }
  
  const step = progress.steps[stepName];
  if (!step) return;
  
  step.completed = completed;
  step.completedAt = completed ? new Date().toISOString() : undefined;
  
  if (validations) {
    step.validations = validations;
  }
  
  progress.lastUpdated = new Date().toISOString();
  
  await saveProgress(customerId, progress);
}

export async function clearProgress(customerId: string): Promise<void> {
  if (!isLocalStorageAvailable()) {
    return;
  }
  
  try {
    const key = getProgressKey(customerId);
    window.localStorage.removeItem(key);
  } catch {
    console.warn('[kyc-progress] Failed to clear progress');
  }
}

export async function isStepComplete(customerId: string, stepName: StepName): Promise<boolean> {
  const progress = await getProgress(customerId);
  if (!progress) return false;
  
  return progress.steps[stepName]?.completed ?? false;
}

export async function getCompletedSteps(customerId: string): Promise<StepName[]> {
  const progress = await getProgress(customerId);
  if (!progress) return [];
  
  return Object.entries(progress.steps)
    .filter(([_, step]) => step.completed)
    .map(([stepName]) => stepName as StepName);
}

export async function getNextPendingStep(customerId: string, customerType: 'individual' | 'business'): Promise<StepName | null> {
  const completedSteps = await getCompletedSteps(customerId);
  const stepDefinitions = getStepDefinitions(customerType);
  
  for (const stepName of stepDefinitions) {
    if (!completedSteps.includes(stepName)) {
      return stepName;
    }
  }
  
  return null;
}

export function getStepLabel(stepName: StepName, customerType: 'individual' | 'business'): string {
  if (customerType === 'individual') {
    switch (stepName) {
      case 'personal':
        return 'Personal Information';
      case 'address':
        return 'Address';
      case 'document':
        return 'Document';
      case 'review':
        return 'Review';
    }
  } else {
    switch (stepName) {
      case 'business_basic':
        return 'Business Information';
      case 'business_address':
        return 'Addresses';
      case 'business_compliance':
        return 'Compliance';
      case 'business_documents':
        return 'Documents';
      case 'business_ubos':
        return 'UBOs';
      case 'review':
        return 'Review';
    }
  }
  
  return stepName;
}

export function getStepDescription(stepName: StepName, customerType: 'individual' | 'business'): string {
  if (customerType === 'individual') {
    switch (stepName) {
      case 'personal':
        return 'Basic info about you';
      case 'address':
        return 'Where you live';
      case 'document':
        return 'ID document upload';
      case 'review':
        return 'Confirm your information';
    }
  } else {
    switch (stepName) {
      case 'business_basic':
        return 'Basic business details';
      case 'business_address':
        return 'Registered & physical addresses';
      case 'business_compliance':
        return 'Risk assessment information';
      case 'business_documents':
        return 'Upload business documents';
      case 'business_ubos':
        return 'Beneficial owners';
      case 'review':
        return 'Confirm your information';
    }
  }
  
  return '';
}

export function isStepFullyValidated(step: StepProgress): boolean {
  if (step.validations.length === 0) return true;
  return step.validations.every(v => v.status === 'passed');
}

export function getStepValidationStatus(step: StepProgress): 'complete' | 'partial' | 'empty' {
  if (step.validations.length === 0) return 'empty';
  
  const passedCount = step.validations.filter(v => v.status === 'passed').length;
  const totalCount = step.validations.length;
  
  if (passedCount === totalCount) return 'complete';
  if (passedCount > 0) return 'partial';
  return 'empty';
}