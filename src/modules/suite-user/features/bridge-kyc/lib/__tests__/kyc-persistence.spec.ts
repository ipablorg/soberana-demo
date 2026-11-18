// @vitest-environment jsdom
import {
  describe,
  it,
  test,
  expect,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';
import {
  saveKycData,
  loadKycData,
  clearKycData,
  getKycDataAge,
  isKycDataFresh,
} from '../kyc-persistence';
import type { VerifyIdentityValues } from '../verify-identity.schema';

describe('KYC Persistence - Individual and Business Data', () => {
  const mockCustomerId = 'customer-123';

  beforeEach(() => {
    sessionStorage.clear();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('shouldSaveIndividualKycData', () => {
    test('persists individual customer data without base64', async () => {
      const individualData: Partial<VerifyIdentityValues> = {
        first_name: 'John',
        last_name: 'Doe',
        birth_date: '1990-05-15',
        nationality: 'USA',
        tax_id: '123456789',
        tax_id_type: 'SSN',
        address_line_1: '123 Main St',
        city: 'New York',
        country: 'USA',
        type: 'PASSPORT',
        issuing_country: 'USA',
        number: 'P12345678',
        has_selfie: true,
      };

      await saveKycData(mockCustomerId, individualData);

      const loaded = await loadKycData(mockCustomerId);

      expect(loaded).toBeDefined();
      expect(loaded?.customerType).toBe('individual');
      expect(loaded?.personalInfo.firstName).toBe('John');
      expect(loaded?.personalInfo.lastName).toBe('Doe');
      expect(loaded?.personalInfo.birthDate).toBe('1990-05-15');
      expect(loaded?.personalInfo.nationality).toBe('USA');
      expect(loaded?.personalInfo.taxId).toBe('123456789');
      expect(loaded?.addressInfo.addressLine1).toBe('123 Main St');
      expect(loaded?.addressInfo.city).toBe('New York');
      expect(loaded?.addressInfo.country).toBe('USA');
      expect(loaded?.documentInfo.identifyingDocuments).toHaveLength(1);
      expect(loaded?.documentInfo.hasSelfie).toBe(true);
    });

    test('excludes base64 image data from persistence', async () => {
      const dataWithBase64: Partial<VerifyIdentityValues> = {
        first_name: 'Jane',
        last_name: 'Smith',
        birth_date: '1985-08-22',
        nationality: 'USA',
        tax_id: '987654321',
        tax_id_type: 'SSN',
        image_front: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1...',
        image_back: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q2...',
        selfie: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q3...',
      };

      await saveKycData(mockCustomerId, dataWithBase64);

      const loaded = await loadKycData(mockCustomerId);

      expect(loaded).toBeDefined();

      const storedData = sessionStorage.getItem(`kyc_persistence_${mockCustomerId}`);
      const parsed = JSON.parse(storedData || '{}');

      expect(JSON.stringify(parsed)).not.toContain('data:image/jpeg;base64');
      expect(parsed.data.documentInfo.identifyingDocuments[0]).not.toHaveProperty('image_front');
      expect(parsed.data.documentInfo.identifyingDocuments[0]).not.toHaveProperty('image_back');
      expect(parsed.data.documentInfo).not.toHaveProperty('selfie');
    });
  });

  describe('shouldSaveBusinessKycData', () => {
    test('persists business customer data with UBOs', async () => {
      const businessData: Partial<VerifyIdentityValues> = {
        customer_type: 'business',
        business_legal_name: 'Test Business LLC',
        business_type: 'corporation',
        business_industry: ['517000'],
        incorporation_date: '2020-01-15',
        business_description: 'Software development company',
        primary_website: 'https://testbusiness.com',
        operates_in_prohibited_countries: false,
        estimated_annual_revenue_usd: '100000_999999',
        business_source_of_funds: 'business_revenue',
        business_account_purpose: 'operational',
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
            title: 'CEO',
            relationship_established_at: '2020-01-15',
          },
          {
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane@example.com',
            birth_date: '1985-08-22',
            has_ownership: true,
            has_control: false,
            is_signer: false,
            ownership_percentage: 30,
            title: 'CFO',
            relationship_established_at: '2020-01-15',
          },
        ],
      };

      await saveKycData(mockCustomerId, businessData);

      const loaded = await loadKycData(mockCustomerId);

      expect(loaded).toBeDefined();
      expect(loaded?.customerType).toBe('business');
      expect(loaded?.businessInfo).toBeDefined();
      expect(loaded?.businessInfo?.businessLegalName).toBe('Test Business LLC');
      expect(loaded?.businessInfo?.businessType).toBe('corporation');
      expect(loaded?.businessInfo?.businessIndustry).toEqual(['517000']);
      expect(loaded?.businessInfo?.incorporationDate).toBe('2020-01-15');
      expect(loaded?.businessInfo?.businessDescription).toBe('Software development company');
      expect(loaded?.businessInfo?.primaryWebsite).toBe('https://testbusiness.com');
      expect(loaded?.businessInfo?.operatesInProhibitedCountries).toBe(false);
      expect(loaded?.businessInfo?.estimatedAnnualRevenueUsd).toBe('100000_999999');
      expect(loaded?.businessInfo?.sourceOfFunds).toBe('business_revenue');
      expect(loaded?.businessInfo?.accountPurpose).toBe('operational');
      expect(loaded?.businessInfo?.associatedPersons).toHaveLength(2);

      const firstUbo = loaded?.businessInfo?.associatedPersons[0];
      expect(firstUbo?.firstName).toBe('John');
      expect(firstUbo?.lastName).toBe('Doe');
      expect(firstUbo?.email).toBe('john@example.com');
      expect(firstUbo?.birthDate).toBe('1980-05-15');
      expect(firstUbo?.hasOwnership).toBe(true);
      expect(firstUbo?.hasControl).toBe(true);
      expect(firstUbo?.isSigner).toBe(true);
      expect(firstUbo?.ownershipPercentage).toBe(40);
      expect(firstUbo?.title).toBe('CEO');
    });

    test('excludes UBO image data from business persistence', async () => {
      const businessWithImages: Partial<VerifyIdentityValues> = {
        customer_type: 'business',
        business_legal_name: 'Test Business LLC',
        business_type: 'corporation',
        ubos: [
          {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            birth_date: '1980-05-15',
            has_ownership: true,
            has_control: true,
            is_signer: true,
            image_front: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1...',
            image_back: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q2...',
          },
        ],
      };

      await saveKycData(mockCustomerId, businessWithImages);

      const loaded = await loadKycData(mockCustomerId);

      expect(loaded).toBeDefined();

      const storedData = sessionStorage.getItem(`kyc_persistence_${mockCustomerId}`);
      const parsed = JSON.parse(storedData || '{}');

      expect(JSON.stringify(parsed)).not.toContain('data:image/jpeg;base64');
      expect(parsed.data.businessInfo?.associatedPersons[0]).not.toHaveProperty('image_front');
      expect(parsed.data.businessInfo?.associatedPersons[0]).not.toHaveProperty('image_back');
    });
  });

  describe('shouldNotPersistBase64Data', () => {
    test('excludes all base64 fields from document info', async () => {
      const dataWithAllBase64: Partial<VerifyIdentityValues> = {
        first_name: 'Test',
        last_name: 'User',
        birth_date: '1990-01-01',
        nationality: 'USA',
        image_front: 'data:image/jpeg;base64,front123',
        image_back: 'data:image/jpeg;base64,back123',
        selfie: 'data:image/jpeg;base64,selfie123',
        document_purposes: ['proof_of_address'],
        document_file: 'data:application/pdf;base64,pdf123',
      };

      await saveKycData(mockCustomerId, dataWithAllBase64);

      const storedData = sessionStorage.getItem(`kyc_persistence_${mockCustomerId}`);
      const parsed = JSON.parse(storedData || '{}');

      const jsonString = JSON.stringify(parsed);

      expect(jsonString).not.toContain('data:image/jpeg;base64');
      expect(jsonString).not.toContain('data:application/pdf;base64');
      expect(jsonString).not.toContain('front123');
      expect(jsonString).not.toContain('back123');
      expect(jsonString).not.toContain('selfie123');
      expect(jsonString).not.toContain('pdf123');
    });

    test('stores metadata and text fields normally', async () => {
      const dataWithBase64: Partial<VerifyIdentityValues> = {
        first_name: 'John',
        last_name: 'Doe',
        birth_date: '1990-05-15',
        nationality: 'USA',
        tax_id: '123456789',
        tax_id_type: 'SSN',
        image_front: 'data:image/jpeg;base64,largeimagedata...',
      };

      await saveKycData(mockCustomerId, dataWithBase64);

      const storedData = sessionStorage.getItem(`kyc_persistence_${mockCustomerId}`);
      const parsed = JSON.parse(storedData || '{}');

      expect(parsed.data.personalInfo.firstName).toBe('John');
      expect(parsed.data.personalInfo.lastName).toBe('Doe');
      expect(parsed.data.personalInfo.birthDate).toBe('1990-05-15');
      expect(parsed.data.personalInfo.nationality).toBe('USA');
      expect(parsed.data.personalInfo.taxId).toBe('123456789');
      expect(parsed.data.personalInfo.taxIdType).toBe('SSN');
    });
  });

  describe('shouldExpireAfter24Hours', () => {
    test('clears data after exactly 24 hours', async () => {
      const testData: Partial<VerifyIdentityValues> = {
        first_name: 'John',
        last_name: 'Doe',
        birth_date: '1990-05-15',
        nationality: 'USA',
      };

      await saveKycData(mockCustomerId, testData);

      const storedData = sessionStorage.getItem(`kyc_persistence_${mockCustomerId}`);
      const parsed = JSON.parse(storedData || '{}');

      const oneDayInMs = 24 * 60 * 60 * 1000;
      const expiredTimestamp = Date.now() - oneDayInMs - 1000; // 1 second after 24 hours

      parsed.metadata.timestamp = expiredTimestamp;
      sessionStorage.setItem(`kyc_persistence_${mockCustomerId}`, JSON.stringify(parsed));

      const loaded = await loadKycData(mockCustomerId);

      expect(loaded).toBeNull();
      expect(sessionStorage.getItem(`kyc_persistence_${mockCustomerId}`)).toBeNull();
    });

    test('keeps data within 24 hours', async () => {
      const testData: Partial<VerifyIdentityValues> = {
        first_name: 'John',
        last_name: 'Doe',
        birth_date: '1990-05-15',
        nationality: 'USA',
      };

      await saveKycData(mockCustomerId, testData);

      const storedData = sessionStorage.getItem(`kyc_persistence_${mockCustomerId}`);
      const parsed = JSON.parse(storedData || '{}');

      const twentyThreeHoursInMs = 23 * 60 * 60 * 1000;
      const recentTimestamp = Date.now() - twentyThreeHoursInMs;

      parsed.metadata.timestamp = recentTimestamp;
      sessionStorage.setItem(`kyc_persistence_${mockCustomerId}`, JSON.stringify(parsed));

      const loaded = await loadKycData(mockCustomerId);

      expect(loaded).not.toBeNull();
      expect(loaded?.personalInfo.firstName).toBe('John');
    });

    test('age calculation returns correct milliseconds', async () => {
      const testData: Partial<VerifyIdentityValues> = {
        first_name: 'John',
        last_name: 'Doe',
        birth_date: '1990-05-15',
        nationality: 'USA',
      };

      await saveKycData(mockCustomerId, testData);

      await new Promise(resolve => setTimeout(resolve, 100));

      const age = await getKycDataAge(mockCustomerId);

      expect(age).toBeDefined();
      expect(age).toBeGreaterThan(0);
      expect(age).toBeLessThan(1000); // Should be less than 1 second
    });

    test('isKycDataFresh returns correct freshness status', async () => {
      const testData: Partial<VerifyIdentityValues> = {
        first_name: 'John',
        last_name: 'Doe',
        birth_date: '1990-05-15',
        nationality: 'USA',
      };

      await saveKycData(mockCustomerId, testData);

      expect(await isKycDataFresh(await getKycDataAge(mockCustomerId))).toBe(true);

      const storedData = sessionStorage.getItem(`kyc_persistence_${mockCustomerId}`);
      const parsed = JSON.parse(storedData || '{}');
      const expiredTimestamp = Date.now() - (7 * 24 * 60 * 60 * 1000) - 1000;
      parsed.metadata.timestamp = expiredTimestamp;
      sessionStorage.setItem(`kyc_persistence_${mockCustomerId}`, JSON.stringify(parsed));

      expect(await isKycDataFresh(await getKycDataAge(mockCustomerId))).toBe(false);
    });
  });

  describe('clearKycData', () => {
    test('removes persisted data', async () => {
      const testData: Partial<VerifyIdentityValues> = {
        first_name: 'John',
        last_name: 'Doe',
        birth_date: '1990-05-15',
        nationality: 'USA',
      };

      await saveKycData(mockCustomerId, testData);

      expect(sessionStorage.getItem(`kyc_persistence_${mockCustomerId}`)).not.toBeNull();

      await clearKycData(mockCustomerId);

      expect(sessionStorage.getItem(`kyc_persistence_${mockCustomerId}`)).toBeNull();
    });
  });
});