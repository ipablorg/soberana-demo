import type { VerifyIdentityValues } from './verify-identity.schema';
import { createDraftMetadata, isDraftVersionValid } from './draft-version';

const PERSISTABLE_FIELDS: (keyof VerifyIdentityValues)[] = [
  'birth_date',
  'additional_nationality',
  'place_of_birth_country',
  'place_of_birth_city',
  'type',
  'issuing_country',
  'number',
  'description',
  'expiration',
  'tax_id',
  'source_of_funds',
  'employment_status',
  'account_purpose',
  'expected_monthly_payments_usd',
  'acting_as_intermediary',
  'most_recent_occupation',
  'nationality',
  'address_line_1',
  'city',
  'state',
  'postal_code',
  'country',
  'tax_id_type',
  'business_legal_name',
  'business_type',
  'business_industry',
  'incorporation_date',
  'business_description',
  'is_dao',
  'tax_id_issuing_country',
  'primary_website',
  'website_absence_reason',
  'registration_number',
  'number_of_employees',
  'is_financial_institution',
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
  'source_of_funds',
  'account_purpose',
  'expected_annual_revenue_usd',
  'source_of_funds_description',
  'high_risk_activities',
  'high_risk_activities_explanation',
  'operates_in_prohibited_countries',
  'conducts_money_services',
  'conducts_money_services_using_bridge',
  'conducts_money_services_description',
  'compliance_screening_explanation',
  'account_purpose_other',
  'ubos',
];

export interface SessionDraft {
  metadata: {
    version: number;
    timestamp: number;
  };
  values: Partial<VerifyIdentityValues>;
}

function getDraftKey(customerId?: string): string {
  const userId = customerId || 'anonymous';
  return `kyc_draft_${userId}`;
}

const DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function saveToSessionStorage(draft: SessionDraft, customerId?: string): boolean {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      console.warn('[session-draft] sessionStorage not available');
      return false;
    }

    const key = getDraftKey(customerId);
    window.sessionStorage.setItem(key, JSON.stringify(draft));
    return true;
  } catch {
    console.warn('[session-draft] Failed to save draft (private mode?)');
    return false;
  }
}

function loadFromSessionStorage(customerId?: string): SessionDraft | null {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return null;
    }

    const key = getDraftKey(customerId);
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;

    const draft: SessionDraft = JSON.parse(raw);

    if (!isDraftVersionValid(draft.metadata)) {
      console.warn('[session-draft] Draft version mismatch, ignoring');
      window.sessionStorage.removeItem(key);
      return null;
    }

    const ageMs = Date.now() - draft.metadata.timestamp;
    if (ageMs > DRAFT_MAX_AGE_MS) {
      console.warn('[session-draft] Draft expired, removing');
      window.sessionStorage.removeItem(key);
      return null;
    }

    return draft;
  } catch {
    console.warn('[session-draft] Failed to load draft');
    return null;
  }
}

export function saveSessionDraft(
  formValues: Partial<VerifyIdentityValues>,
  customerId?: string,
): void {
  const persistableValues: Record<string, unknown> = {};

  for (const field of PERSISTABLE_FIELDS) {
    const value = formValues[field];
    if (value === undefined || value === null || value === '') {
      continue;
    }

    if (field === 'ubos' && Array.isArray(value)) {
      persistableValues[field] = value.map((ubo) => ({
        ...ubo,
        identifying_document: ubo.identifying_document ? {
          type: ubo.identifying_document.type,
          issuing_country: ubo.identifying_document.issuing_country,
          number: ubo.identifying_document.number,
          description: ubo.identifying_document.description,
          expiration: ubo.identifying_document.expiration,
        } : undefined,
      }));
      continue;
    }

    persistableValues[field] = value;
  }

  const draft: SessionDraft = {
    metadata: createDraftMetadata(),
    values: persistableValues as Partial<VerifyIdentityValues>,
  };

  saveToSessionStorage(draft, customerId);
}

export function loadSessionDraft(customerId?: string): Partial<VerifyIdentityValues> | null {
  const draft = loadFromSessionStorage(customerId);
  return draft?.values ?? null;
}

export function clearSessionDraft(customerId?: string): void {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }
    const key = getDraftKey(customerId);
    window.sessionStorage.removeItem(key);
  } catch {
    // silent
  }
}

export function getDraftValuesExcludingBackendHydrated(
  draft: Partial<VerifyIdentityValues>,
): Partial<VerifyIdentityValues> {
  return { ...draft };
}

let isHydratingFromBackend = false;

export function setHydratingFromBackend(value: boolean): void {
  isHydratingFromBackend = value;
}

export function getIsHydratingFromBackend(): boolean {
  return isHydratingFromBackend;
}
