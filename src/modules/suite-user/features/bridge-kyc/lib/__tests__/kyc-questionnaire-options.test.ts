import { i18n } from '@lingui/core';
import { describe, expect, it } from 'vitest';
import {
  BUSINESS_ACCOUNT_PURPOSE_OPTIONS,
  BUSINESS_INDUSTRY_OPTIONS,
  BUSINESS_SOURCE_OF_FUNDS_OPTIONS,
  BUSINESS_TYPE_OPTIONS,
  EXPECTED_ANNUAL_REVENUE_OPTIONS,
  EXPECTED_MONTHLY_PAYMENTS_OPTIONS,
} from '../verify-identity.schema';
import {
  getBusinessAccountPurposeLabel,
  getBusinessIndustryLabel,
  getBusinessSourceOfFundsLabel,
  getBusinessTypeLabel,
  getExpectedAnnualRevenueLabel,
  getExpectedMonthlyPaymentLabel,
} from '../kyc-questionnaire-options';

i18n.load('es', {});
i18n.activate('es');

function expectHumanLabels(values: readonly string[], getLabel: (value: never) => string) {
  for (const value of values) {
    const label = getLabel(value as never);
    expect(label, `label for ${value}`).not.toBe(value);
    expect(label, `label for ${value}`).not.toMatch(/^[a-z0-9]+(_[a-z0-9]+)+$/);
  }
}

describe('business option labels', () => {
  it('maps every business type to a human label', () => {
    expectHumanLabels(BUSINESS_TYPE_OPTIONS, getBusinessTypeLabel);
  });

  it('maps every business industry to a human label', () => {
    expectHumanLabels(
      BUSINESS_INDUSTRY_OPTIONS.filter((v) => v.includes('_')),
      getBusinessIndustryLabel
    );
  });

  it('maps every business source of funds to a human label', () => {
    expectHumanLabels(BUSINESS_SOURCE_OF_FUNDS_OPTIONS, getBusinessSourceOfFundsLabel);
  });

  it('maps every business account purpose to a human label', () => {
    expectHumanLabels(BUSINESS_ACCOUNT_PURPOSE_OPTIONS, getBusinessAccountPurposeLabel);
  });

  it('maps revenue and monthly payment ranges to human labels', () => {
    expectHumanLabels(EXPECTED_ANNUAL_REVENUE_OPTIONS, getExpectedAnnualRevenueLabel);
    expectHumanLabels(EXPECTED_MONTHLY_PAYMENTS_OPTIONS, getExpectedMonthlyPaymentLabel);
  });
});
