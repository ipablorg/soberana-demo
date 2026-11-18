import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Separator } from '@/shared/components/ui/separator';
import { Plus, Trash2, ShieldCheck, ShieldAlert } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';
import { evaluateComplianceRules } from '../../../utils/compliance-engine';
import type { ComplianceRule, ComplianceCondition, ComplianceAction } from '../../../types';
import type { ComplianceContext } from '../../../utils/compliance-engine';

interface HeadlessCompliancePreviewProps {
  rules: ComplianceRule[];
  onChange: (rules: ComplianceRule[]) => void;
  className?: string;
}

const CONDITIONS: { value: ComplianceCondition; label: string }[] = [
  { value: 'amount_gt', label: 'amount >' },
  { value: 'amount_lt', label: 'amount <' },
  { value: 'country_is', label: 'country =' },
  { value: 'risk_level_is', label: 'risk_level =' },
];

const ACTIONS: { value: ComplianceAction; label: string }[] = [
  { value: 'require_biometric', label: 'require_biometric' },
  { value: 'allow_fast_flow', label: 'allow_fast_flow' },
  { value: 'block_and_escalate', label: 'block_and_escalate' },
  { value: 'require_document', label: 'require_document' },
];

const ACTION_VARIANT: Record<ComplianceAction, 'secondary' | 'success' | 'destructive' | 'warning'> = {
  require_biometric: 'warning',
  allow_fast_flow: 'success',
  block_and_escalate: 'destructive',
  require_document: 'secondary',
};

const DEMO_CONTEXT: ComplianceContext = { amount: 15000, country: 'EC', riskLevel: 'high' };

let ruleCounter = 100;

export function HeadlessCompliancePreview({ rules, onChange, className }: HeadlessCompliancePreviewProps) {
  const decision = evaluateComplianceRules(rules, DEMO_CONTEXT);

  const addRule = () => {
    const newRule: ComplianceRule = {
      id: `r${++ruleCounter}`,
      condition: 'amount_gt',
      value: 1000,
      action: 'require_biometric',
    };
    onChange([...rules, newRule]);
  };

  const updateRule = (id: string, patch: Partial<ComplianceRule>) => {
    onChange(rules.map(r => r.id === id ? { ...r, ...patch } : r));
  };

  const deleteRule = (id: string) => {
    onChange(rules.filter(r => r.id !== id));
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          <Trans>Reglas de compliance</Trans>
        </p>
        <Badge variant="secondary" className="text-xs">
          {rules.length} <Trans>reglas</Trans>
        </Badge>
      </div>

      {/* Rule rows */}
      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {rules.map((rule) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 p-2">
                {/* Condition */}
                <Select
                  value={rule.condition}
                  onValueChange={v => updateRule(rule.id, { condition: v as ComplianceCondition })}
                >
                  <SelectTrigger className="h-7 w-32 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map(c => (
                      <SelectItem key={c.value} value={c.value} className="text-xs">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Value */}
                <Input
                  value={String(rule.value)}
                  onChange={e => {
                    const raw = e.target.value;
                    const asNum = Number(raw);
                    updateRule(rule.id, { value: isNaN(asNum) || raw === '' ? raw : asNum });
                  }}
                  className="h-7 w-24 text-xs font-mono"
                  placeholder={rule.condition.includes('amount') ? '10000' : 'EC'}
                />

                <span className="text-xs text-muted-foreground shrink-0">→</span>

                {/* Action */}
                <Select
                  value={rule.action}
                  onValueChange={v => updateRule(rule.id, { action: v as ComplianceAction })}
                >
                  <SelectTrigger className="h-7 flex-1 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIONS.map(a => (
                      <SelectItem key={a.value} value={a.value} className="text-xs font-mono">
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => deleteRule(rule.id)}
                  title={t`Eliminar regla`}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {rules.length === 0 && (
          <div className="rounded-lg border border-dashed border-border px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">
              <Trans>Sin reglas. Todos los flujos usarán allow_fast_flow por defecto.</Trans>
            </p>
          </div>
        )}
      </div>

      <Button variant="outline" size="sm" className="w-full" onClick={addRule}>
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        <Trans>Agregar regla</Trans>
      </Button>

      {rules.length > 0 && (
        <>
          <Separator />

          {/* Live evaluation */}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              <Trans>Evaluación en vivo</Trans>
            </p>
            <p className="text-xs font-mono text-muted-foreground bg-muted/30 rounded-md px-2 py-1.5">
              {'{ amount: 15000, country: \'EC\', riskLevel: \'high\' }'}
            </p>

            {decision ? (
              <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2">
                <ShieldAlert className="h-3.5 w-3.5 text-warning shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-mono text-muted-foreground truncate">
                    {decision.rule.condition} {String(decision.rule.value)}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs text-muted-foreground">→</span>
                    <Badge variant={ACTION_VARIANT[decision.action]} className="text-xs font-mono">
                      {decision.action}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-3 py-2">
                <ShieldCheck className="h-3.5 w-3.5 text-success shrink-0" />
                <p className="text-xs font-mono text-success">
                  <Trans>Ninguna regla activa → allow_fast_flow</Trans>
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
