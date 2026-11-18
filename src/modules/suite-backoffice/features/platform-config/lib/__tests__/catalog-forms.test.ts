import { describe, expect, it } from 'vitest';

import {
  EMPTY_PAYMENT_RAIL_FORM,
  EMPTY_PROVIDER_FORM,
  buildCreatePaymentRailInput,
  buildUpdateProviderInput,
  hasFormErrors,
  parseJsonConfig,
  validatePaymentRailForm,
} from '../catalog-forms';

describe('parseJsonConfig', () => {
  it('treats a blank config as no config', () => {
    // Act
    const result = parseJsonConfig('   ');

    // Assert
    expect(result).toEqual({ ok: true, value: undefined });
  });

  it.each([['{"a": '], ['[1, 2]'], ['"text"'], ['null'], ['42']])(
    'rejects %s because the config must be a JSON object',
    (text) => {
      // Act
      const result = parseJsonConfig(text);

      // Assert
      expect(result.ok).toBe(false);
    }
  );

  it('returns the parsed object', () => {
    // Act
    const result = parseJsonConfig('{"wallet": {"chains": ["TRON"]}}');

    // Assert
    expect(result).toEqual({ ok: true, value: { wallet: { chains: ['TRON'] } } });
  });
});

describe('buildUpdateProviderInput', () => {
  it('never sends the immutable provider code', () => {
    // Arrange
    const form = { ...EMPTY_PROVIDER_FORM, id: 'p-1', code: 'bridge', name: 'Bridge' };

    // Act
    const input = buildUpdateProviderInput(form);

    // Assert
    expect(input).not.toHaveProperty('code');
    expect(input).toEqual({ name: 'Bridge' });
  });

  it('never sends the type or the active flag (#411: the catalogue is read-only)', () => {
    const form = {
      ...EMPTY_PROVIDER_FORM,
      id: 'p-1',
      code: 'kirafin',
      name: 'KiraFin',
      isActive: false,
    };

    const input = buildUpdateProviderInput({ ...form, configText: '{"a": 1}' });

    expect(input).toEqual({ name: 'KiraFin', config: { a: 1 } });
  });
});

describe('payment rail form', () => {
  it('requires an ISO3 country code', () => {
    // Arrange
    const form = {
      ...EMPTY_PAYMENT_RAIL_FORM,
      code: 'ach_us',
      name: 'ACH',
      currency: 'usd',
      country: 'US',
    };

    // Act
    const errors = validatePaymentRailForm(form);

    // Assert
    expect(errors.country).toBe(true);
    expect(hasFormErrors(errors)).toBe(true);
  });

  it('upper-cases currency and country on create', () => {
    // Arrange
    const form = {
      ...EMPTY_PAYMENT_RAIL_FORM,
      code: 'ach_us',
      name: 'ACH',
      currency: 'usd',
      country: 'usa',
    };

    // Act
    const input = buildCreatePaymentRailInput(form);

    // Assert
    expect(input).toEqual({
      code: 'ach_us',
      name: 'ACH',
      currency: 'USD',
      country: 'USA',
      direction: 'BOTH',
      isActive: true,
    });
  });
});
