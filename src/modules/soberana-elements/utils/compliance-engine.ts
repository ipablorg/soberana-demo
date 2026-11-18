import type { ComplianceRule, ComplianceDecision } from '../types';

export interface ComplianceContext {
  amount: number;
  country: string;
  riskLevel?: string;
}

export function evaluateComplianceRules(
  rules: ComplianceRule[],
  context: ComplianceContext,
): ComplianceDecision | null {
  for (const rule of rules) {
    if (matchesRule(rule, context)) {
      return { action: rule.action, rule, matched: true };
    }
  }
  return null;
}

function matchesRule(rule: ComplianceRule, ctx: ComplianceContext): boolean {
  switch (rule.condition) {
    case 'amount_gt':
      return ctx.amount > Number(rule.value);
    case 'amount_lt':
      return ctx.amount < Number(rule.value);
    case 'country_is':
      return ctx.country.toUpperCase() === String(rule.value).toUpperCase();
    case 'risk_level_is':
      return (ctx.riskLevel ?? '') === String(rule.value);
  }
}
