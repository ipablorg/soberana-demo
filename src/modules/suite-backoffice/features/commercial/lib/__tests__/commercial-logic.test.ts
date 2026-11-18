import { describe, expect, it } from 'vitest';

import type { ClientProviderOnboarding } from '@/graphql/queries/admin-commercial';

import {
  EMPTY_CREATE_CLIENT_FORM,
  EMPTY_FEE_SCHEDULE_FORM,
  buildCreateAndOnboardInput,
  buildFeeScheduleInput,
  buildLedgerVariables,
  buildManualLinkVariables,
  canLinkManually,
  canRetryProvider,
  groupSummaryByOperation,
  isClientIdValid,
  isCreateClientFormValid,
  isLedgerRangeValid,
  onboardingBadgeVariant,
  pendingProviders,
  summarizeJson,
  validateFeeSchedule,
  validateManualLink,
  deriveOnboardingProviders,
  effectiveAllowedCountries,
} from '../commercial-logic';

const row = (
  providerCode: string,
  status: ClientProviderOnboarding['status'],
): ClientProviderOnboarding => ({
  id: providerCode,
  clientId: 'c',
  providerCode,
  status,
  providerCustomerId: null,
  lastErrorCode: null,
  linkedAt: null,
  linkedByUserId: null,
  createdAt: '',
  updatedAt: '',
  attempts: [],
});

describe('onboarding status helpers', () => {
  it('maps every status to a badge variant', () => {
    expect(onboardingBadgeVariant('LINKED')).toBe('success');
    expect(onboardingBadgeVariant('MANUAL')).toBe('secondary');
    expect(onboardingBadgeVariant('FAILED')).toBe('destructive');
    expect(onboardingBadgeVariant('PENDING')).toBe('warning');
  });

  it('offers retry only while the provider is not linked', () => {
    expect(canRetryProvider('PENDING')).toBe(true);
    expect(canRetryProvider('FAILED')).toBe(true);
    expect(canRetryProvider('LINKED')).toBe(false);
    expect(canRetryProvider('MANUAL')).toBe(false);
  });

  it('refuses a manual link only for API-linked providers', () => {
    expect(canLinkManually('LINKED')).toBe(false);
    expect(canLinkManually('FAILED')).toBe(true);
    expect(canLinkManually('MANUAL')).toBe(true);
  });

  it('lists the providers an "onboard all pending" run would call', () => {
    expect(
      pendingProviders([row('mesta', 'LINKED'), row('kirafin', 'FAILED')]),
    ).toEqual(['kirafin']);
  });

  it('summarizes attempt JSON without throwing on null or nested values', () => {
    expect(summarizeJson(null)).toBe('—');
    expect(summarizeJson({})).toBe('—');
    expect(summarizeJson({ status: 'ok', ids: [1] })).toBe('status=ok, ids=[1]');
  });
});

describe('create and onboard payload', () => {
  const valid = {
    ...EMPTY_CREATE_CLIENT_FORM,
    name: ' Acme ',
    email: 'a@acme.com',
    taxId: '123',
    taxIdTypeId: 'type-1',
    country: 'col',
  };

  it('requires every field, a 3-letter country and at least one provider', () => {
    expect(isCreateClientFormValid(valid)).toBe(true);
    expect(isCreateClientFormValid({ ...valid, country: 'CO' })).toBe(false);
    expect(isCreateClientFormValid({ ...valid, providers: [] })).toBe(false);
    expect(isCreateClientFormValid({ ...valid, name: '  ' })).toBe(false);
  });

  it('trims, upper-cases the country and sends the chosen providers', () => {
    expect(buildCreateAndOnboardInput({ ...valid, providers: ['kirafin'] })).toEqual({
      name: 'Acme',
      email: 'a@acme.com',
      taxId: '123',
      taxIdTypeId: 'type-1',
      country: 'COL',
      providers: ['kirafin'],
      allowedCustomerCountries: ['COL'],
    });
  });

  it('follows the client country until the allowed countries are edited', () => {
    expect(effectiveAllowedCountries({ ...valid, country: 'usa' })).toEqual(['USA']);
    expect(
      effectiveAllowedCountries({ ...valid, country: 'usa', allowedCountries: ['COL', 'USA'] }),
    ).toEqual(['COL', 'USA']);
    expect(
      buildCreateAndOnboardInput({ ...valid, allowedCountries: ['USA', 'COL'] })
        .allowedCustomerCountries,
    ).toEqual(['USA', 'COL']);
  });

  it('refuses a client with no allowed country', () => {
    expect(isCreateClientFormValid({ ...valid, allowedCountries: [] })).toBe(false);
  });

  it('accepts only UUID v4 client ids', () => {
    expect(isClientIdValid('3f2b8a52-6c1d-4c2e-9a41-0d6f7c3b9e10')).toBe(true);
    expect(isClientIdValid('not-a-uuid')).toBe(false);
  });
});

describe('manual link validation', () => {
  it('requires the provider customer id and a note up to 500 characters', () => {
    expect(validateManualLink({ providerCustomerId: ' ', note: 'x' })).toBe('ID_REQUIRED');
    expect(validateManualLink({ providerCustomerId: 'p1', note: ' ' })).toBe('NOTE_REQUIRED');
    expect(validateManualLink({ providerCustomerId: 'p1', note: 'x'.repeat(501) })).toBe(
      'NOTE_TOO_LONG',
    );
    expect(validateManualLink({ providerCustomerId: 'p1', note: 'x'.repeat(500) })).toBeNull();
  });

  it('builds trimmed variables', () => {
    expect(
      buildManualLinkVariables('c1', 'mesta', { providerCustomerId: ' p1 ', note: ' why ' }),
    ).toEqual({ clientId: 'c1', provider: 'mesta', providerCustomerId: 'p1', note: 'why' });
  });
});

describe('fee schedule validation and payload', () => {
  const base = { ...EMPTY_FEE_SCHEDULE_FORM, value: '1.5' };

  it('accepts decimals with up to 8 places and rejects the rest', () => {
    expect(validateFeeSchedule(base)).toBeNull();
    expect(validateFeeSchedule({ ...base, value: '0.12345678' })).toBeNull();
    expect(validateFeeSchedule({ ...base, value: '0.123456789' })).toBe('VALUE_INVALID');
    expect(validateFeeSchedule({ ...base, value: '-1' })).toBe('VALUE_INVALID');
    expect(validateFeeSchedule({ ...base, value: '1e3' })).toBe('VALUE_INVALID');
  });

  it('keeps a PERCENT value within 0..100 but lets FIXED exceed it', () => {
    expect(validateFeeSchedule({ ...base, value: '100' })).toBeNull();
    expect(validateFeeSchedule({ ...base, value: '100.00000001' })).toBe('PERCENT_OUT_OF_RANGE');
    expect(validateFeeSchedule({ ...base, mode: 'FIXED', value: '250' })).toBeNull();
  });

  it('compares min and max exactly, without float rounding', () => {
    expect(
      validateFeeSchedule({ ...base, minAmount: '0.30000000', maxAmount: '0.3' }),
    ).toBeNull();
    expect(validateFeeSchedule({ ...base, minAmount: '5', maxAmount: '4.99999999' })).toBe(
      'MIN_GREATER_THAN_MAX',
    );
    expect(validateFeeSchedule({ ...base, minAmount: 'abc' })).toBe('MIN_INVALID');
  });

  it('sends decimals as strings and nulls the empty optionals', () => {
    expect(buildFeeScheduleInput('c1', { ...base, minAmount: ' 1 ' })).toEqual({
      clientId: 'c1',
      railCode: null,
      operation: 'DEPOSIT',
      mode: 'PERCENT',
      value: '1.5',
      minAmount: '1',
      maxAmount: null,
      currency: null,
    });
  });

  it('keeps the currency only for FIXED fees', () => {
    const fixed = buildFeeScheduleInput('c1', {
      ...base,
      mode: 'FIXED',
      currency: 'usd',
    });
    expect(fixed.currency).toBe('USD');
    expect(buildFeeScheduleInput('c1', { ...base, currency: 'usd' }).currency).toBeNull();
  });
});

describe('ledger filters and summary', () => {
  it('makes the inclusive end date exclusive for the backend', () => {
    expect(
      buildLedgerVariables('c1', { from: '2026-01-01', to: '2026-01-31', operation: '' }),
    ).toEqual({
      clientId: 'c1',
      from: '2026-01-01T00:00:00.000Z',
      to: '2026-02-01T00:00:00.000Z',
      operation: null,
    });
  });

  it('omits empty filters and passes the operation', () => {
    expect(buildLedgerVariables('c1', { from: '', to: '', operation: 'P2P' })).toEqual({
      clientId: 'c1',
      from: null,
      to: null,
      operation: 'P2P',
    });
  });

  it('detects an inverted date range', () => {
    expect(isLedgerRangeValid({ from: '2026-02-01', to: '2026-01-01', operation: '' })).toBe(false);
    expect(isLedgerRangeValid({ from: '', to: '2026-01-01', operation: '' })).toBe(true);
  });

  it('groups totals per operation with currencies sorted', () => {
    expect(
      groupSummaryByOperation([
        { operation: 'DEPOSIT', currency: 'USD', total: '3' },
        { operation: 'PAYOUT', currency: 'COP', total: '9' },
        { operation: 'DEPOSIT', currency: 'COP', total: '1' },
      ]),
    ).toEqual([
      {
        operation: 'DEPOSIT',
        totals: [
          { currency: 'COP', total: '1' },
          { currency: 'USD', total: '3' },
        ],
      },
      { operation: 'PAYOUT', totals: [{ currency: 'COP', total: '9' }] },
    ]);
  });
});

describe('deriveOnboardingProviders', () => {
  const provider = (code: string, is_active = true) => ({ code, is_active });

  it('derives the onboarding-capable active providers from the catalog', () => {
    expect(
      deriveOnboardingProviders([
        provider('kirafin'),
        provider('bridge'),
        provider('mesta', false),
        provider('mesta2'),
      ]),
    ).toEqual(['kirafin']);
  });

  it('falls back to the default list when the catalog is missing or yields nothing', () => {
    expect(deriveOnboardingProviders(undefined)).toEqual(['mesta', 'kirafin']);
    expect(deriveOnboardingProviders([])).toEqual(['mesta', 'kirafin']);
    expect(deriveOnboardingProviders([provider('bridge')])).toEqual(['mesta', 'kirafin']);
  });
});
