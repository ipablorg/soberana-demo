import type { VerifyIdentityValues } from './verify-identity.schema';

// KYC PII (names, tax IDs, addresses, birth dates) is kept in sessionStorage
// so it is cleared when the tab closes. The TTL is a safety net only.
const PERSISTENCE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const CURRENT_VERSION = '1.0' as const;

const PERSISTENCE_KEY_PREFIX = 'kyc_persistence_';

export interface KycPersistenceData {
  version: '1.0';
  customerId?: string;
  customerType: 'individual' | 'business';
  lastSavedAt: string;
  
  personalInfo: {
    firstName: string;
    middleName?: string;
    lastName: string;
    birthDate: string;
    nationality: string;
    nationalities: string[];
    placeOfBirth?: string;
    taxId: string;
    taxIdType: string;
  };
  
  addressInfo: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  
  complianceInfo: {
    accountPurpose?: string;
    employmentStatus?: string;
    sourceOfFunds?: string;
    expectedMonthlyPaymentsUsd?: number;
    actingAsIntermediary?: boolean;
    mostRecentOccupation?: string;
  };
  
  documentInfo: {
    identifyingDocuments: Array<{
      type: string;
      issuingCountry: string;
      number?: string;
      description?: string;
      expiration?: string;
    }>;
    supportingDocuments: Array<{
      purposes: string[];
      description?: string;
    }>;
    hasSelfie: boolean;
  };
  
  businessInfo?: {
    businessLegalName: string;
    businessType: string;
    businessIndustry: string;
    incorporationDate: string;
    businessDescription?: string;
    primaryWebsite?: string;
    operatesInProhibitedCountries?: boolean;
    estimatedAnnualRevenueUsd?: number;
    hasMaterialIntermediaryOwnership?: boolean;
    ownershipThreshold?: number;
    conductsMoneyServices?: boolean;
    complianceScreeningExplanation?: string;
    sourceOfFunds?: string;
    accountPurpose?: string;
    highRisksActivities?: boolean;
    associatedPersons: Array<{
      firstName: string;
      lastName: string;
      email: string;
      birthDate: string;
      hasOwnership: boolean;
      hasControl: boolean;
      isSigner: boolean;
      ownershipPercentage?: number;
      title?: string;
      relationshipEstablishedAt?: string;
    }>;
  };

  progressTracking?: {
    currentStepIndex: number;
    stepsCompleted: string[];
    overallProgress: number;
  };
}

interface PersistenceMetadata {
  version: string;
  timestamp: number;
}

interface PersistenceStorage {
  metadata: PersistenceMetadata;
  data: KycPersistenceData;
}

function getPersistenceKey(customerId: string): string {
  return `${PERSISTENCE_KEY_PREFIX}${customerId}`;
}

function isStorageAvailable(): boolean {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return false;
  }

  try {
    const testKey = '__sessionStorage_test__';
    window.sessionStorage.setItem(testKey, 'test');
    window.sessionStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function isVersionValid(version: string): boolean {
  return version === CURRENT_VERSION;
}

function migrateData(storage: PersistenceStorage): PersistenceStorage | null {
  if (!isVersionValid(storage.metadata.version)) {
    console.warn('[kyc-persistence] Unsupported version:', storage.metadata.version);
    return null;
  }
  
  return storage;
}

function extractPersonalInfo(values: Partial<VerifyIdentityValues>) {
  return {
    firstName: values.first_name || '',
    middleName: values.middle_name,
    lastName: values.last_name || '',
    birthDate: values.birth_date || '',
    nationality: values.nationality || '',
    nationalities: values.additional_nationality ? 
      [values.nationality, values.additional_nationality].filter(Boolean) : 
      (values.nationality ? [values.nationality] : []),
    placeOfBirth: values.place_of_birth_city,
    taxId: values.tax_id || '',
    taxIdType: values.tax_id_type || '',
  };
}

function extractAddressInfo(values: Partial<VerifyIdentityValues>) {
  return {
    addressLine1: values.address_line_1 || '',
    addressLine2: values.address_line_2,
    city: values.city || '',
    state: values.state,
    postalCode: values.postal_code,
    country: values.country || '',
  };
}

function extractComplianceInfo(values: Partial<VerifyIdentityValues>) {
  return {
    accountPurpose: values.account_purpose,
    employmentStatus: values.employment_status,
    sourceOfFunds: values.source_of_funds,
    expectedMonthlyPaymentsUsd: values.expected_monthly_payments_usd,
    actingAsIntermediary: values.acting_as_intermediary,
    mostRecentOccupation: values.most_recent_occupation,
  };
}

function extractDocumentInfo(values: Partial<VerifyIdentityValues>) {
  const identifyingDocuments: KycPersistenceData['documentInfo']['identifyingDocuments'] = [];
  const supportingDocuments: KycPersistenceData['documentInfo']['supportingDocuments'] = [];
  
  if (values.type && values.issuing_country) {
    identifyingDocuments.push({
      type: values.type,
      issuingCountry: values.issuing_country,
      number: values.number,
      description: values.description,
      expiration: values.expiration,
    });
  }
  
  if (values.document_purposes) {
    supportingDocuments.push({
      purposes: values.document_purposes,
      description: values.document_description,
    });
  }
  
  return {
    identifyingDocuments,
    supportingDocuments,
    hasSelfie: values.has_selfie ?? false,
  };
}

function extractBusinessInfo(values: Partial<VerifyIdentityValues>): KycPersistenceData['businessInfo'] | undefined {
  if (!values.business_legal_name) {
    return undefined;
  }
  
  return {
    businessLegalName: values.business_legal_name,
    businessType: values.business_type || '',
    businessIndustry: values.business_industry || '',
    incorporationDate: values.incorporation_date || '',
    businessDescription: values.business_description,
    primaryWebsite: values.primary_website,
    operatesInProhibitedCountries: values.operates_in_prohibited_countries,
    estimatedAnnualRevenueUsd: values.estimated_annual_revenue_usd,
    hasMaterialIntermediaryOwnership: values.has_material_intermediary_ownership,
    ownershipThreshold: values.ownership_threshold,
    conductsMoneyServices: values.conducts_money_services,
    complianceScreeningExplanation: values.compliance_screening_explanation,
    sourceOfFunds: values.business_source_of_funds,
    accountPurpose: values.business_account_purpose,
    highRisksActivities: values.high_risks_activities,
    associatedPersons: (values.associated_persons || []).map(person => ({
      firstName: person.first_name || '',
      lastName: person.last_name || '',
      email: person.email || '',
      birthDate: person.birth_date || '',
      hasOwnership: person.has_ownership ?? false,
      hasControl: person.has_control ?? false,
      isSigner: person.is_signer ?? false,
      ownershipPercentage: person.ownership_percentage,
      title: person.title,
      relationshipEstablishedAt: person.relationship_established_at,
    })),
  };
}

function buildPersistenceData(
  customerId: string,
  values: Partial<VerifyIdentityValues>,
): KycPersistenceData {
  const customerType = values.customer_type === 'business' ? 'business' : 'individual';
  
  return {
    version: CURRENT_VERSION,
    customerId,
    customerType,
    lastSavedAt: new Date().toISOString(),
    
    personalInfo: extractPersonalInfo(values),
    addressInfo: extractAddressInfo(values),
    complianceInfo: extractComplianceInfo(values),
    documentInfo: extractDocumentInfo(values),
    businessInfo: customerType === 'business' ? extractBusinessInfo(values) : undefined,
  };
}

export async function saveKycData(
  customerId: string,
  values: Partial<VerifyIdentityValues>,
): Promise<void> {
  if (!isStorageAvailable()) {
    console.warn('[kyc-persistence] sessionStorage not available');
    return;
  }
  
  try {
    const data = buildPersistenceData(customerId, values);
    const storage: PersistenceStorage = {
      metadata: {
        version: CURRENT_VERSION,
        timestamp: Date.now(),
      },
      data,
    };
    
    const key = getPersistenceKey(customerId);
    window.sessionStorage.setItem(key, JSON.stringify(storage));
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('[kyc-persistence] sessionStorage quota exceeded');
    } else {
      console.warn('[kyc-persistence] Failed to save KYC data:', error);
    }
  }
}

export async function loadKycData(
  customerId: string,
): Promise<KycPersistenceData | null> {
  if (!isStorageAvailable()) {
    return null;
  }
  
  try {
    const key = getPersistenceKey(customerId);
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    
    const storage: PersistenceStorage = JSON.parse(raw);
    
    const migrated = migrateData(storage);
    if (!migrated) {
      window.sessionStorage.removeItem(key);
      return null;
    }
    
    const ageMs = Date.now() - migrated.metadata.timestamp;
    if (ageMs > PERSISTENCE_MAX_AGE_MS) {
      console.warn('[kyc-persistence] KYC data expired, removing');
      window.sessionStorage.removeItem(key);
      return null;
    }
    
    return migrated.data;
  } catch (error) {
    console.warn('[kyc-persistence] Failed to load KYC data:', error);
    return null;
  }
}

export async function clearKycData(customerId: string): Promise<void> {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    const key = getPersistenceKey(customerId);
    window.sessionStorage.removeItem(key);
  } catch {
    console.warn('[kyc-persistence] Failed to clear KYC data');
  }
}

/**
 * Remove every `kyc_persistence_*` entry regardless of customer id.
 * Used at logout, where the current customer id is not (reliably)
 * known — e.g. a shared device may hold entries from several users.
 * Also sweeps the wizard's `kyc_draft_*` session drafts (same PII
 * class, written by session-draft.ts).
 */
export async function clearAllKycData(): Promise<void> {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i);
      if (
        key?.startsWith(PERSISTENCE_KEY_PREFIX) ||
        key?.startsWith('kyc_draft_')
      ) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      window.sessionStorage.removeItem(key);
    }
  } catch {
    console.warn('[kyc-persistence] Failed to clear KYC data');
  }
}

export async function getKycDataAge(customerId: string): Promise<number | null> {
  if (!isStorageAvailable()) {
    return null;
  }
  
  try {
    const key = getPersistenceKey(customerId);
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    
    const storage: PersistenceStorage = JSON.parse(raw);
    const migrated = migrateData(storage);
    if (!migrated) return null;
    
    const ageMs = Date.now() - migrated.metadata.timestamp;
    if (ageMs > PERSISTENCE_MAX_AGE_MS) {
      window.sessionStorage.removeItem(key);
      return null;
    }
    
    return ageMs;
  } catch {
    return null;
  }
}

export function isKycDataFresh(ageMs: number | null): boolean {
  if (ageMs === null) return false;
  return ageMs < PERSISTENCE_MAX_AGE_MS;
}