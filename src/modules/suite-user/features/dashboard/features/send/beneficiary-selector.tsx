/**
 * BeneficiarySelector
 *
 * List of saved beneficiaries for the send flow. Each row is a single
 * click target that feeds into `selectBeneficiary(id, currency)` — the
 * DI store then advances the DI copy and the SendFlow panel to the
 * `amount` step in the same transition.
 *
 * Visual system mirrors `CurrencySelector` vocabulary but renders as
 * a vertical list (not chips) because beneficiaries carry richer
 * identity (name + bank + rail + currency) than a currency chip. We
 * keep the list dense (48–56px rows), semantic-token-only, and rely
 * on the row-level hover to telegraph tappability.
 *
 * Provider review (ported from the retired standalone send page):
 *   - approved:  full-contrast label, success dot, selectable.
 *   - in review / rejected: listed but DISABLED with the reason, because the
 *                 back only lets APPROVED beneficiaries receive money.
 *   - rail in maintenance (CO / EC / PE): listed but DISABLED, "En
 *                 mantenimiento", no way to pick it.
 *
 * Empty-state: the parent SendFlow owns the empty-state rendering
 * (CTA to open the create dialog). This component assumes a non-empty
 * list; if passed an empty list it renders nothing so the parent can
 * take over cleanly.
 */

import * as React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { ChevronRight } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';
import { getCurrencyFlag } from '@/shared/lib/currency-flags';
import {
  getBeneficiaryRailCode,
  type BeneficiaryResponse,
} from '@/shared/lib/beneficiaries-api';
import { useReviewHint } from '@/modules/suite-user/features/beneficiaries/hooks/use-review-hint';
import { isRailUnderMaintenance } from '@/modules/suite-user/features/beneficiaries/lib/rail-maintenance';

export interface BeneficiarySelectorProps {
  beneficiaries: BeneficiaryResponse[];
  selectedBeneficiaryId: string | null;
  onSelect: (beneficiary: BeneficiaryResponse) => void;
  className?: string;
}

type VerificationDot = 'success' | 'warning' | 'destructive';

const dotForStatus = (status: string | null | undefined): VerificationDot => {
  const normalized = (status ?? '').toLowerCase();
  if (normalized === 'verified' || normalized === 'active') return 'success';
  if (normalized === 'error' || normalized === 'rejected') return 'destructive';
  return 'warning';
};

const dotColor: Record<VerificationDot, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
};

interface BeneficiaryRowProps {
  beneficiary: BeneficiaryResponse;
  isSelected: boolean;
  onSelect: (beneficiary: BeneficiaryResponse) => void;
}

const BeneficiaryRow: React.FC<BeneficiaryRowProps> = ({ beneficiary: b, isSelected, onSelect }) => {
  const reviewHint = useReviewHint(b);
  const railCode = getBeneficiaryRailCode(b);
  const inMaintenance = isRailUnderMaintenance(railCode);
  const blocked = reviewHint !== null || inMaintenance;

  const flag = getCurrencyFlag(b.currency ?? '');
  const currency = b.currency ?? '';
  const name = b.beneficiary_name || '—';
  const subtitle = [b.bank_name, railCode?.toUpperCase()]
    .filter((s): s is string => !!s)
    .join(' · ');
  const dot = blocked ? 'warning' : dotForStatus(b.verification_status ?? 'verified');

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      disabled={blocked}
      aria-disabled={blocked}
      onClick={() => {
        if (!blocked) onSelect(b);
      }}
      className={cn(
        'group w-full text-left',
        'flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-3',
        blocked ? 'cursor-not-allowed opacity-70' : 'hover:bg-muted',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isSelected && 'border-transparent bg-muted',
      )}
    >
      <span
        aria-hidden
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-lg"
        role="img"
      >
        {flag}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">{name}</span>
          <span
            aria-hidden
            className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotColor[dot])}
          />
        </div>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
        {inMaintenance ? (
          <p className="mt-1 text-xs text-muted-foreground">
            <Trans>En mantenimiento</Trans>
          </p>
        ) : (
          reviewHint && <p className="mt-1 text-xs text-muted-foreground">{reviewHint}</p>
        )}
      </div>
      {currency && (
        <span className="shrink-0 font-mono tabular-nums text-xs font-medium text-muted-foreground">
          {currency}
        </span>
      )}
      {!blocked && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />}
      <span className="sr-only">
        {dot === 'success' && <Trans>Verificado</Trans>}
        {dot === 'warning' && <Trans>En revisión</Trans>}
        {dot === 'destructive' && <Trans>Revisar datos</Trans>}
      </span>
    </button>
  );
};

export const BeneficiarySelector: React.FC<BeneficiarySelectorProps> = ({
  beneficiaries,
  selectedBeneficiaryId,
  onSelect,
  className,
}) => {
  const { t } = useLingui();

  if (beneficiaries.length === 0) return null;

  return (
    <div
      role="radiogroup"
      aria-label={t`Selecciona un beneficiario`}
      className={cn('flex flex-col gap-2', className)}
    >
      {beneficiaries.map((b) => (
        <BeneficiaryRow
          key={b.id}
          beneficiary={b}
          isSelected={selectedBeneficiaryId === b.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};
