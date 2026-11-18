import type {
  CustomerKycSnapshot,
  KycSnapshotAction,
  KycSnapshotLifecycle,
} from '@/graphql/queries/customers/get-kyc-snapshot';

export interface KycSnapshotState {
  lifecycle: KycSnapshotLifecycle;
  actions: KycSnapshotAction[];
  reasons: string[];
  missingFields: string[];
  missingDocumentPurposes: string[];
  missingQuestionnaireFields: string[];
  reconciliationState: 'fresh' | 'stale' | 'refresh_failed' | 'unknown';
  isApproved: boolean;
  isPendingSubmission: boolean;
  isPendingReview: boolean;
  isAdditionalInfoRequired: boolean;
  isRejected: boolean;
  isExpired: boolean;
  isFailed: boolean;
  isTerminal: boolean;
  needsResume: boolean;
  needsRetry: boolean;
  needsSupport: boolean;
  needsManualRefresh: boolean;
  canAcceptTos: boolean;
  hasSubmittedProgress: boolean;
  onboardingMode: 'api' | 'kyc_link' | null;
}

export const KYC_SUPPORT_EMAIL = 'legal@loopay.com';

export const WORKFLOW_ONLY_KYC_REQUIREMENT_KEYS = [
  'external_account',
  'terms_of_service_v1',
  'terms_of_service_v2',
  'tos_acceptance',
  'tos_v2_acceptance',
  'kyc_approval',
  'post_processing',
  'sof_questionnaire_review',
  'kyb_review',
  'control_person_ownership_attestation',
  'business_ownership_documents',
] as const;

const WORKFLOW_ONLY_KYC_REQUIREMENT_KEY_SET = new Set<string>(WORKFLOW_ONLY_KYC_REQUIREMENT_KEYS);

const EMPTY_ACTIONS: KycSnapshotAction[] = [];

export const KYC_ACTIVE_LIFECYCLES: readonly KycSnapshotLifecycle[] = [
  'NOT_INITIATED',
  'INITIATED',
  'PENDING_REVIEW',
  'ADDITIONAL_INFO_REQUIRED',
];

export const KYC_TERMINAL_LIFECYCLES: readonly KycSnapshotLifecycle[] = [
  'APPROVED',
  'REJECTED',
  'EXPIRED',
  'FAILED',
];

const FIELD_LABELS: Record<string, string> = {
  birth_date: 'Date of birth',
  nationality: 'Nationality',
  tax_id: 'Tax ID',
  tax_id_type: 'Tax ID type',
  address_line_1: 'Street address',
  city: 'City',
  state: 'State or province',
  postal_code: 'Postal code',
  country: 'Country',
  selfie: 'Selfie',
  id_verification: 'Identity verification',
  document_verification: 'Identity document images',
  first_name: 'First name',
  last_name: 'Last name',
  business_description: 'Business description',
  is_dao: 'Is DAO',
  source_of_funds_description: 'Source of funds description',
  transmits_customer_funds: 'Transmits customer funds',
  has_ownership: 'Has ownership',
  has_control: 'Has control',
  is_signer: 'Is signer',
  is_director: 'Is director',
  title: 'Title',
  ownership_percentage: 'Ownership percentage',
  expected_monthly_payments_usd: 'Expected monthly payments',
  tos_acceptance: 'Terms of Service acceptance',
  tos_v2_acceptance: 'Updated Terms of Service acceptance',
  kyc_approval: 'Identity verification approval',
};

const DOCUMENT_PURPOSE_LABELS: Record<string, string> = {
  proof_of_address: 'Proof of address',
  proof_of_source_of_funds: 'Proof of source of funds',
  proof_of_source_of_wealth: 'Proof of source of wealth',
  proof_of_tax_identification: 'Proof of tax identification',
  proof_of_account_purpose: 'Proof of account purpose',
  proof_of_relationship: 'Proof of relationship',
  proof_of_individual_name_change: 'Proof of name change',
  other: 'Supporting document',
};

const QUESTIONNAIRE_LABELS: Record<string, string> = {
  source_of_funds: 'Source of funds',
  employment_status: 'Employment status',
  account_purpose: 'Account purpose',
  expected_monthly_payments_usd: 'Expected monthly payments',
  acting_as_intermediary: 'Acting as intermediary',
  most_recent_occupation: 'Occupation',
};

function toSentenceCase(value: string): string {
  return value
    .split('_')
    .filter(Boolean)
    .map((part, index) => (index === 0 ? part[0]?.toUpperCase() + part.slice(1) : part))
    .join(' ');
}

export function formatRequirementLabel(kind: 'field' | 'document' | 'questionnaire', key: string): string {
  if (kind === 'field') {
    return FIELD_LABELS[key] ?? toSentenceCase(key);
  }

  if (kind === 'document') {
    return DOCUMENT_PURPOSE_LABELS[key] ?? toSentenceCase(key);
  }

  return QUESTIONNAIRE_LABELS[key] ?? toSentenceCase(key);
}

export function isWorkflowOnlyKycRequirementKey(key: string): boolean {
  return WORKFLOW_ONLY_KYC_REQUIREMENT_KEY_SET.has(key);
}

export function formatPendingRequirementLabel(
  kind: 'field' | 'document_purpose' | 'review',
  key: string,
): string {
  if (key === 'external_account') {
    return 'External account setup needed';
  }

  if (key === 'terms_of_service_v1') {
    return 'Terms of Service acceptance needed';
  }

  if (key === 'terms_of_service_v2') {
    return 'Updated Terms of Service acceptance needed';
  }

  if (key === 'tos_acceptance') {
    return 'Terms of Service acceptance needed';
  }

  if (key === 'tos_v2_acceptance') {
    return 'Updated Terms of Service acceptance needed';
  }

  if (key === 'kyc_approval') {
    return 'Identity verification approval pending';
  }

  if (key === 'post_processing') {
    return 'Post-processing in progress';
  }

  if (key === 'sof_questionnaire_review') {
    return 'Source of funds review in progress';
  }

  if (key === 'kyb_review') {
    return 'Business verification review in progress';
  }

  if (key === 'control_person_ownership_attestation') {
    return 'Control person ownership attestation needed';
  }

  if (key === 'business_ownership_documents') {
    return 'Business ownership documents needed';
  }

  if (key === 'duplicate_check_name_dob') {
    return 'Duplicate name and date of birth check in progress';
  }

  if (kind === 'field') {
    return `${formatRequirementLabel('field', key)} submitted`;
  }

  if (kind === 'document_purpose') {
    return `${formatRequirementLabel('document', key)} submitted`;
  }

  return key === 'bridge_review'
    ? 'Review in progress'
    : toSentenceCase(key);
}

export function deriveKycSnapshotState(
  snapshot: CustomerKycSnapshot | null | undefined,
  fallbackLifecycle: KycSnapshotLifecycle = 'NOT_INITIATED',
): KycSnapshotState {
  const lifecycle = snapshot?.lifecycle ?? fallbackLifecycle;
  const actions = snapshot?.actions ?? EMPTY_ACTIONS;
  const missingFields = snapshot?.requirements.missing.fields ?? [];
  const missingDocumentPurposes = snapshot?.requirements.missing.document_purposes ?? [];
  const missingQuestionnaireFields = snapshot?.requirements.missing.questionnaire_fields ?? [];
  const reasons = snapshot?.reasons.map((reason) => reason.message) ?? [];
  const reconciliationState = snapshot?.freshness.reconciliation_state ?? 'unknown';
  const isApproved = lifecycle === 'APPROVED';
  const isPendingSubmission = lifecycle === 'NOT_INITIATED' || lifecycle === 'INITIATED';
  const isPendingReview = lifecycle === 'PENDING_REVIEW';
  const isAdditionalInfoRequired = lifecycle === 'ADDITIONAL_INFO_REQUIRED';
  const isRejected = lifecycle === 'REJECTED';
  const isExpired = lifecycle === 'EXPIRED';
  const isFailed = lifecycle === 'FAILED';
  const isTerminal = KYC_TERMINAL_LIFECYCLES.includes(lifecycle);
  const needsResume = actions.includes('resume');
  const needsRetry = actions.includes('retry');
  const needsSupport = actions.includes('contact_support');
  const needsManualRefresh = actions.includes('reconcile') || (reconciliationState !== 'fresh' && !isApproved);
  const canAcceptTos = actions.includes('accept_tos') && snapshot?.tos.url != null;
  const hasSubmittedProgress = lifecycle !== 'NOT_INITIATED' && lifecycle !== 'INITIATED';
  const onboardingMode = snapshot?.onboarding_mode === 'api' || snapshot?.onboarding_mode === 'kyc_link'
    ? snapshot.onboarding_mode
    : null;

  return {
    lifecycle,
    actions,
    reasons,
    missingFields,
    missingDocumentPurposes,
    missingQuestionnaireFields,
    reconciliationState,
    isApproved,
    isPendingSubmission,
    isPendingReview,
    isAdditionalInfoRequired,
    isRejected,
    isExpired,
    isFailed,
    isTerminal,
    needsResume,
    needsRetry,
    needsSupport,
    needsManualRefresh,
    canAcceptTos,
    hasSubmittedProgress,
    onboardingMode,
  };
}

export function hasOutstandingRequirements(snapshot: CustomerKycSnapshot | null | undefined): boolean {
  if (!snapshot) {
    return false;
  }

  return (
    snapshot.requirements.missing.fields.length > 0 ||
    snapshot.requirements.missing.document_purposes.length > 0 ||
    snapshot.requirements.missing.questionnaire_fields.length > 0
  );
}

export function shouldPollKycLifecycle(lifecycle: KycSnapshotLifecycle | undefined): boolean {
  if (!lifecycle) {
    return true;
  }

  return KYC_ACTIVE_LIFECYCLES.includes(lifecycle);
}

export function pickPrimaryKycAction(state: KycSnapshotState): KycSnapshotAction | null {
  if (state.canAcceptTos) return 'accept_tos';
  if (state.needsResume) return 'resume';
  if (state.needsRetry) return 'retry';
  if (state.needsManualRefresh) return 'reconcile';
  if (state.needsSupport) return 'contact_support';
  if (state.actions.includes('submit')) return 'submit';
  return null;
}

export function hasExecutableKycRecovery(
  state: Pick<KycSnapshotState, 'needsResume' | 'needsRetry'>,
): boolean {
  return state.needsResume || state.needsRetry;
}

export function shouldEscalateKycToSupport(
  state: Pick<KycSnapshotState, 'needsSupport' | 'needsResume' | 'needsRetry'>,
): boolean {
  return state.needsSupport && !hasExecutableKycRecovery(state);
}

export function buildKycSupportHref({
  lifecycle,
  customerStatus,
  customerId,
}: {
  lifecycle: KycSnapshotLifecycle;
  customerStatus?: string | null;
  customerId?: string | null;
}): string {
  const subject = `KYC support request — ${lifecycle}`;
  const body = [
    'Hello Loopay team,',
    '',
    'I need help continuing my KYC verification.',
    `Lifecycle: ${lifecycle}`,
    customerStatus ? `Customer status: ${customerStatus}` : null,
    customerId ? `Customer profile ID: ${customerId}` : null,
  ]
    .filter((line): line is string => Boolean(line))
    .join('\n');

  return `mailto:${KYC_SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
