import { describe, it, expect } from 'vitest';
import { evaluateComplianceRules } from '../compliance-engine';
import type { ComplianceRule } from '../../types';

const rule = (overrides: Partial<ComplianceRule>): ComplianceRule => ({
  id: 'r1',
  condition: 'amount_gt',
  value: 1000,
  action: 'allow_fast_flow',
  ...overrides,
});

describe('evaluateComplianceRules', () => {
  it('returns null when rules array is empty', () => {
    expect(evaluateComplianceRules([], { amount: 5000, country: 'EC' })).toBeNull();
  });

  it('returns null when no rule matches', () => {
    const rules = [rule({ condition: 'amount_gt', value: 10000, action: 'block_and_escalate' })];
    expect(evaluateComplianceRules(rules, { amount: 500, country: 'EC' })).toBeNull();
  });

  it('amount_gt → require_biometric on match', () => {
    const rules = [rule({ condition: 'amount_gt', value: 5000, action: 'require_biometric' })];
    const result = evaluateComplianceRules(rules, { amount: 6000, country: 'US' });
    expect(result).not.toBeNull();
    expect(result!.action).toBe('require_biometric');
    expect(result!.matched).toBe(true);
  });

  it('amount_lt → allow_fast_flow on match', () => {
    const rules = [rule({ condition: 'amount_lt', value: 100, action: 'allow_fast_flow' })];
    const result = evaluateComplianceRules(rules, { amount: 50, country: 'MX' });
    expect(result!.action).toBe('allow_fast_flow');
  });

  it('amount_lt does not match when amount equals threshold', () => {
    const rules = [rule({ condition: 'amount_lt', value: 100, action: 'allow_fast_flow' })];
    expect(evaluateComplianceRules(rules, { amount: 100, country: 'MX' })).toBeNull();
  });

  it('country_is → block_and_escalate on matching country (case-insensitive)', () => {
    const rules = [rule({ condition: 'country_is', value: 've', action: 'block_and_escalate' })];
    const result = evaluateComplianceRules(rules, { amount: 0, country: 'VE' });
    expect(result!.action).toBe('block_and_escalate');
  });

  it('country_is does not match a different country', () => {
    const rules = [rule({ condition: 'country_is', value: 'VE', action: 'block_and_escalate' })];
    expect(evaluateComplianceRules(rules, { amount: 0, country: 'CO' })).toBeNull();
  });

  it('risk_level_is → require_document on match', () => {
    const rules = [rule({ condition: 'risk_level_is', value: 'high', action: 'require_document' })];
    const result = evaluateComplianceRules(rules, { amount: 1000, country: 'EC', riskLevel: 'high' });
    expect(result!.action).toBe('require_document');
  });

  it('risk_level_is does not match when riskLevel is undefined', () => {
    const rules = [rule({ condition: 'risk_level_is', value: 'high', action: 'require_document' })];
    expect(evaluateComplianceRules(rules, { amount: 1000, country: 'EC' })).toBeNull();
  });

  it('returns first matching rule when multiple rules match', () => {
    const rules = [
      rule({ id: 'first', condition: 'amount_gt', value: 100, action: 'allow_fast_flow' }),
      rule({ id: 'second', condition: 'amount_gt', value: 50, action: 'require_biometric' }),
    ];
    const result = evaluateComplianceRules(rules, { amount: 200, country: 'US' });
    expect(result!.rule.id).toBe('first');
    expect(result!.action).toBe('allow_fast_flow');
  });

  it('returns correct rule reference in decision', () => {
    const r = rule({ id: 'audit-rule', condition: 'country_is', value: 'EC', action: 'require_document' });
    const result = evaluateComplianceRules([r], { amount: 0, country: 'EC' });
    expect(result!.rule).toStrictEqual(r);
  });
});
