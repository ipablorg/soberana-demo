import { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { CheckCircle, AlertCircle, ShieldCheck, ShieldAlert } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';
import { evaluateComplianceRules } from '../../../utils/compliance-engine';
import type { WidgetConfig, ComplianceRule } from '../../../types';

type KycStep = 'idle' | 'intro' | 'docs' | 'biometric' | 'verifying' | 'approved' | 'review';

interface HeadlessKycPreviewProps {
  config: Partial<WidgetConfig>;
  className?: string;
}

const STEPS: { key: KycStep; label: string }[] = [
  { key: 'idle', label: 'idle' },
  { key: 'intro', label: 'intro' },
  { key: 'docs', label: 'docs' },
  { key: 'biometric', label: 'biometric' },
  { key: 'verifying', label: 'verifying' },
  { key: 'approved', label: 'approved' },
  { key: 'review', label: 'review' },
];

const DEMO_CONTEXT = { amount: 15000, country: 'EC', riskLevel: 'high' };

const DEMO_RULES: ComplianceRule[] = [
  { id: 'r1', condition: 'amount_gt', value: 10000, action: 'require_biometric' },
  { id: 'r2', condition: 'country_is', value: 'EC', action: 'require_document' },
];

export function HeadlessKycPreview({ config, className }: HeadlessKycPreviewProps) {
  const [kycStep, setKycStep] = useState<KycStep>('idle');

  const rules = config.complianceRules ?? DEMO_RULES;
  const decision = evaluateComplianceRules(rules, DEMO_CONTEXT);

  const STEP_ORDER: KycStep[] = ['idle', 'intro', 'docs', 'biometric', 'verifying', 'approved'];
  const currentIndex = STEP_ORDER.indexOf(kycStep);

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono text-muted-foreground">
          <Trans>useKyc</Trans>
          <span className="text-foreground/40 mx-1">{'{'}</span>
          <span className="text-foreground">widgetId</span>
          <span className="text-foreground/40">: </span>
          <span className="text-success">'{config.id ?? 'wgt_preview'}'</span>
          <span className="text-foreground/40 ml-1">{'}'}</span>
        </p>
        <Badge variant="secondary" className="text-xs font-mono">
          <Trans>HEADLESS</Trans>
        </Badge>
      </div>

      <Separator />

      {/* Step selector */}
      <div className="rounded-lg border border-border bg-muted/30 p-3 flex flex-col gap-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          <Trans>Flujo KYC</Trans>
        </p>
        <div className="flex items-center gap-1 flex-wrap">
          {STEPS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setKycStep(key)}
              className={cn(
                'text-xs font-mono px-2 py-0.5 rounded-md border transition-colors duration-150',
                kycStep === key
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-1 font-mono text-xs">
          <span className="text-muted-foreground">step:</span>
          <span className="text-foreground">{Math.max(0, currentIndex)}</span>
          <span className="text-muted-foreground ml-2">status:</span>
          <Badge
            variant={kycStep === 'approved' ? 'success' : kycStep === 'review' ? 'warning' : 'secondary'}
            className="text-xs"
          >
            {kycStep}
          </Badge>
        </div>
      </div>

      {/* Compliance evaluation */}
      {rules.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/30 p-3 flex flex-col gap-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            <Trans>Compliance en contexto demo</Trans>
          </p>
          <div className="text-xs font-mono text-muted-foreground space-y-0.5">
            <span>{'{ amount: 15000, country: \'EC\', riskLevel: \'high\' }'}</span>
          </div>

          {decision ? (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-mono text-warning">
                  <Trans>Regla activada</Trans>: {decision.rule.condition} {String(decision.rule.value)}
                </p>
                <p className="text-xs font-mono text-muted-foreground">
                  action: <span className="text-foreground">{decision.action}</span>
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-3 py-2">
              <ShieldCheck className="h-3.5 w-3.5 text-success shrink-0" />
              <p className="text-xs font-mono text-success">
                <Trans>Ninguna regla activa — allow_fast_flow</Trans>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="rounded-lg border border-border bg-muted/30 p-3 flex flex-col gap-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          <Trans>Funciones disponibles</Trans>
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Button variant="outline" size="sm" className="h-6 text-xs font-mono px-2"
            onClick={() => setKycStep('intro')}>
            startKyc()
          </Button>
          <Button variant="outline" size="sm" className="h-6 text-xs font-mono px-2"
            onClick={() => setKycStep('docs')}>
            uploadDocument()
          </Button>
          <Button variant="outline" size="sm" className="h-6 text-xs font-mono px-2"
            onClick={() => setKycStep('verifying')}>
            complete()
          </Button>
          <Button variant="outline" size="sm" className="h-6 text-xs font-mono px-2"
            onClick={() => setKycStep('approved')}>
            → approved
          </Button>
          <Button variant="outline" size="sm" className="h-6 text-xs font-mono px-2"
            onClick={() => setKycStep('idle')}>
            reset()
          </Button>
        </div>
      </div>

      {/* Result */}
      {kycStep === 'approved' && (
        <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-3 py-2">
          <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" />
          <p className="text-xs font-mono text-success">
            onEvent('kyc:completed', {'{ kycId, status: \'approved\' }'})
          </p>
        </div>
      )}
      {kycStep === 'review' && (
        <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 text-warning shrink-0" />
          <p className="text-xs font-mono text-warning">
            onEvent('kyc:completed', {'{ kycId, status: \'pending_review\' }'})
          </p>
        </div>
      )}
    </div>
  );
}
