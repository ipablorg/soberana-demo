/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getStepDefinitions,
  getStepValidations,
  calculateOverallProgress,
  createEmptyProgress,
  getProgress,
  saveProgress,
  updateStepProgress,
  clearProgress,
  isStepComplete,
  getCompletedSteps,
  getNextPendingStep,
  getStepLabel,
  getStepDescription,
  isStepFullyValidated,
  getStepValidationStatus,
  type StepName,
  type KycProgress,
} from '../kyc-progress';
import type { VerifyIdentityValues, BusinessValues } from '../verify-identity.schema';

describe('KYC Progress Tracking - Individual and Business Steps', () => {
  const mockCustomerId = 'customer-123';

  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('shouldTrackIndividualStepsProgress', () => {
    it('tracks 4 steps for individual customers', () => {
      const individualSteps = getStepDefinitions('individual');

      expect(individualSteps).toHaveLength(4);
      expect(individualSteps).toEqual(['personal', 'address', 'document', 'review']);
    });

    it('validates individual personal step correctly', () => {
      const individualData: Partial<VerifyIdentityValues> = {
        birth_date: '1990-05-15',
        nationality: 'USA',
        tax_id: '123456789',
        tax_id_type: 'SSN',
      };

      const validations = getStepValidations('personal', individualData, 'individual');

      expect(validations.birthDate.status).toBe('passed');
      expect(validations.nationality.status).toBe('passed');
      expect(validations.taxId.status).toBe('passed');
      expect(validations.taxIdType.status).toBe('passed');
    });

    it('validates individual address step correctly', () => {
      const addressData: Partial<VerifyIdentityValues> = {
        address_line_1: '123 Main St',
        city: 'New York',
        country: 'USA',
      };

      const validations = getStepValidations('address', addressData, 'individual');

      expect(validations.addressLine1.status).toBe('passed');
      expect(validations.city.status).toBe('passed');
      expect(validations.country.status).toBe('passed');
    });

    it('validates individual document step correctly', () => {
      const documentData: Partial<VerifyIdentityValues> = {
        type: 'PASSPORT',
        issuing_country: 'USA',
        number: 'P12345678',
        selfie: 'data:image/jpeg;base64,selfie',
      };

      const validations = getStepValidations('document', documentData, 'individual');

      expect(validations.identifying_information.status).toBe('passed');
      expect(validations.selfie.status).toBe('passed');
    });
  });

  describe('shouldTrackBusinessStepsProgress', () => {
    it('tracks 6 steps for business customers', () => {
      const businessSteps = getStepDefinitions('business');

      expect(businessSteps).toHaveLength(6);
      expect(businessSteps).toEqual(['business_basic', 'business_address', 'business_compliance', 'business_documents', 'business_ubos', 'review']);
    });

    it('validates business basic step correctly', () => {
      const businessBasicData: Partial<BusinessValues> = {
        business_legal_name: 'Test Business LLC',
        business_type: 'corporation',
      };

      const validations = getStepValidations('business_basic', businessBasicData, 'business');

      expect(validations.businessLegalName.status).toBe('passed');
      expect(validations.businessType.status).toBe('passed');
    });

    it('validates business address step correctly', () => {
      const businessAddressData: Partial<BusinessValues> = {
        registered_address_line_1: '123 Business St',
        registered_address_city: 'Business City',
        registered_address_country: 'USA',
      };

      const validations = getStepValidations('business_address', businessAddressData, 'business');

      expect(validations.registered_address_line_1.status).toBe('passed');
      expect(validations.registered_address_city.status).toBe('passed');
      expect(validations.registered_address_country.status).toBe('passed');
    });

    it('validates business documents step correctly', () => {
      const businessDocumentsData: Partial<BusinessValues> = {
        proof_of_address_document: 'data:application/pdf;base64,abc123',
        business_formation_document: 'data:application/pdf;base64,def456',
      };

      const validations = getStepValidations('business_documents', businessDocumentsData, 'business');

      expect(validations.proof_of_address_document.status).toBe('passed');
      expect(validations.business_formation_document.status).toBe('passed');
    });

    it('validates business compliance step correctly', () => {
      const businessComplianceData: Partial<BusinessValues> = {
        source_of_funds: 'business_revenue',
        account_purpose: 'operational',
      };

      const validations = getStepValidations('business_compliance', businessComplianceData, 'business');

      expect(validations.sourceOfFunds.status).toBe('passed');
      expect(validations.accountPurpose.status).toBe('passed');
    });

    it('validates business UBOs step correctly', () => {
      const businessUboData: Partial<BusinessValues> = {
        ubos: [
          {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            birth_date: '1980-05-15',
            has_ownership: true,
            has_control: true,
            is_signer: true,
            ownership_percentage: 40,
          },
        ],
      };

      const validations = getStepValidations('business_ubos', businessUboData, 'business');

      expect(validations.has_ubos.status).toBe('passed');
      expect(validations.ubo_0_complete.status).toBe('passed');
    });

    it('handles incomplete UBO data', () => {
      const incompleteUboData: Partial<BusinessValues> = {
        ubos: [
          {
            first_name: 'John',
            last_name: '', // Missing
            email: 'john@example.com',
            birth_date: '1980-05-15',
          },
        ],
      };

      const validations = getStepValidations('business_ubos', incompleteUboData, 'business');

      expect(validations.has_ubos.status).toBe('passed');
      expect(validations.ubo_0_complete.status).toBe('pending');
    });
  });

  describe('shouldCalculateOverallProgress', () => {
    it('calculates 0% progress for empty progress', () => {
      const emptyProgress: KycProgress = createEmptyProgress(mockCustomerId, 'individual');

      expect(calculateOverallProgress(emptyProgress)).toBe(0);
    });

    it('calculates correct percentage for partial completion', () => {
      const partialProgress: KycProgress = {
        customerId: mockCustomerId,
        customerType: 'individual',
        steps: {
          personal: {
            completed: true,
            validations: [
              { field: 'birthDate', status: 'passed' },
              { field: 'nationality', status: 'passed' },
              { field: 'taxId', status: 'pending' },
              { field: 'taxIdType', status: 'passed' },
            ],
          },
          address: {
            completed: false,
            validations: [
              { field: 'addressLine1', status: 'passed' },
              { field: 'city', status: 'pending' },
            ],
          },
        },
        overallProgress: 0,
        lastUpdated: new Date().toISOString(),
      };

      const progress = calculateOverallProgress(partialProgress);

      expect(progress).toBe(67); // 4 passed out of 6 total validations
    });

    it('calculates 100% progress for all completed', () => {
      const fullProgress: KycProgress = {
        customerId: mockCustomerId,
        customerType: 'individual',
        steps: {
          personal: {
            completed: true,
            validations: [
              { field: 'birthDate', status: 'passed' },
              { field: 'nationality', status: 'passed' },
            ],
          },
          address: {
            completed: true,
            validations: [
              { field: 'addressLine1', status: 'passed' },
              { field: 'city', status: 'passed' },
            ],
          },
        },
        overallProgress: 0,
        lastUpdated: new Date().toISOString(),
      };

      const progress = calculateOverallProgress(fullProgress);

      expect(progress).toBe(100);
    });
  });

  describe('shouldGetNextPendingStep', () => {
    it('returns first pending step for individual', async () => {
      const progress: KycProgress = {
        customerId: mockCustomerId,
        customerType: 'individual',
        steps: {
          personal: { completed: true, validations: [] },
          address: { completed: false, validations: [] },
          document: { completed: false, validations: [] },
          review: { completed: false, validations: [] },
        },
        overallProgress: 25,
        lastUpdated: new Date().toISOString(),
      };

      await saveProgress(mockCustomerId, progress);

      const nextStep = await getNextPendingStep(mockCustomerId, 'individual');

      expect(nextStep).toBe('address');
    });

    it('returns first pending step for business', async () => {
      const progress: KycProgress = {
        customerId: mockCustomerId,
        customerType: 'business',
        steps: {
          business_basic: { completed: true, validations: [] },
          business_address: { completed: false, validations: [] },
          business_compliance: { completed: false, validations: [] },
          business_documents: { completed: false, validations: [] },
          business_ubos: { completed: false, validations: [] },
          review: { completed: false, validations: [] },
        },
        overallProgress: 20,
        lastUpdated: new Date().toISOString(),
      };

      await saveProgress(mockCustomerId, progress);

      const nextStep = await getNextPendingStep(mockCustomerId, 'business');

      expect(nextStep).toBe('business_address');
    });

    it('returns null when all steps completed', async () => {
      const completedProgress: KycProgress = {
        customerId: mockCustomerId,
        customerType: 'individual',
        steps: {
          personal: { completed: true, validations: [] },
          address: { completed: true, validations: [] },
          document: { completed: true, validations: [] },
          review: { completed: true, validations: [] },
        },
        overallProgress: 100,
        lastUpdated: new Date().toISOString(),
      };

      await saveProgress(mockCustomerId, completedProgress);

      const nextStep = await getNextPendingStep(mockCustomerId, 'individual');

      expect(nextStep).toBeNull();
    });
  });

  describe('step management functions', () => {
    it('marks step as completed and updates progress', async () => {
      const progress: KycProgress = createEmptyProgress(mockCustomerId, 'individual');
      await saveProgress(mockCustomerId, progress);

      await updateStepProgress(mockCustomerId, 'personal', true, [
        { field: 'birthDate', status: 'passed' },
        { field: 'nationality', status: 'passed' },
      ]);

      const updated = await getProgress(mockCustomerId);

      expect(updated?.steps.personal.completed).toBe(true);
      expect(updated?.steps.personal.completedAt).toBeDefined();
      expect(updated?.steps.personal.validations).toHaveLength(2);
      expect(updated?.overallProgress).toBeGreaterThan(0);
    });

    it('checks if step is complete', async () => {
      const progress: KycProgress = createEmptyProgress(mockCustomerId, 'individual');
      await saveProgress(mockCustomerId, progress);

      await updateStepProgress(mockCustomerId, 'personal', true);

      expect(await isStepComplete(mockCustomerId, 'personal')).toBe(true);
      expect(await isStepComplete(mockCustomerId, 'address')).toBe(false);
    });

    it('gets completed steps list', async () => {
      const progress: KycProgress = createEmptyProgress(mockCustomerId, 'individual');
      await saveProgress(mockCustomerId, progress);

      await updateStepProgress(mockCustomerId, 'personal', true);
      await updateStepProgress(mockCustomerId, 'address', true);

      const completedSteps = await getCompletedSteps(mockCustomerId);

      expect(completedSteps).toEqual(['personal', 'address']);
    });

    it('clears all progress', async () => {
      const progress: KycProgress = createEmptyProgress(mockCustomerId, 'individual');
      await saveProgress(mockCustomerId, progress);

      await clearProgress(mockCustomerId);

      expect(await getProgress(mockCustomerId)).toBeNull();
    });
  });

  describe('step label and description utilities', () => {
    it('returns correct labels for individual steps', () => {
      expect(getStepLabel('personal', 'individual')).toBe('Personal Information');
      expect(getStepLabel('address', 'individual')).toBe('Address');
      expect(getStepLabel('document', 'individual')).toBe('Document');
      expect(getStepLabel('review', 'individual')).toBe('Review');
    });

    it('returns correct labels for business steps', () => {
      expect(getStepLabel('business_basic', 'business')).toBe('Business Information');
      expect(getStepLabel('business_address', 'business')).toBe('Addresses');
      expect(getStepLabel('business_compliance', 'business')).toBe('Compliance');
      expect(getStepLabel('business_documents', 'business')).toBe('Documents');
      expect(getStepLabel('business_ubos', 'business')).toBe('UBOs');
      expect(getStepLabel('review', 'business')).toBe('Review');
    });

    it('returns correct descriptions for individual steps', () => {
      expect(getStepDescription('personal', 'individual')).toBe('Basic info about you');
      expect(getStepDescription('address', 'individual')).toBe('Where you live');
      expect(getStepDescription('document', 'individual')).toBe('ID document upload');
      expect(getStepDescription('review', 'individual')).toBe('Confirm your information');
    });

    it('returns correct descriptions for business steps', () => {
      expect(getStepDescription('business_basic', 'business')).toBe('Basic business details');
      expect(getStepDescription('business_address', 'business')).toBe('Registered & physical addresses');
      expect(getStepDescription('business_compliance', 'business')).toBe('Risk assessment information');
      expect(getStepDescription('business_documents', 'business')).toBe('Upload business documents');
      expect(getStepDescription('business_ubos', 'business')).toBe('Beneficial owners');
      expect(getStepDescription('review', 'business')).toBe('Confirm your information');
    });
  });

  describe('step validation status', () => {
    it('returns empty status for step with no validations', () => {
      const step = {
        completed: false,
        validations: [],
      };

      expect(getStepValidationStatus(step)).toBe('empty');
    });

    it('returns complete status when all validations passed', () => {
      const step = {
        completed: false,
        validations: [
          { field: 'field1', status: 'passed' as const },
          { field: 'field2', status: 'passed' as const },
        ],
      };

      expect(getStepValidationStatus(step)).toBe('complete');
    });

    it('returns partial status when some validations passed', () => {
      const step = {
        completed: false,
        validations: [
          { field: 'field1', status: 'passed' as const },
          { field: 'field2', status: 'pending' as const },
        ],
      };

      expect(getStepValidationStatus(step)).toBe('partial');
    });

    it('returns empty status when no validations passed', () => {
      const step = {
        completed: false,
        validations: [
          { field: 'field1', status: 'pending' as const },
          { field: 'field2', status: 'pending' as const },
        ],
      };

      expect(getStepValidationStatus(step)).toBe('empty');
    });

    it('identifies fully validated steps', () => {
      const fullyValidatedStep = {
        completed: false,
        validations: [
          { field: 'field1', status: 'passed' as const },
          { field: 'field2', status: 'passed' as const },
        ],
      };

      const partiallyValidatedStep = {
        completed: false,
        validations: [
          { field: 'field1', status: 'passed' as const },
          { field: 'field2', status: 'pending' as const },
        ],
      };

      expect(isStepFullyValidated(fullyValidatedStep)).toBe(true);
      expect(isStepFullyValidated(partiallyValidatedStep)).toBe(false);
    });
  });
});