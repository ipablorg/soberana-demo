/**
 * Queue cells of the #413 approval flow and the #410 stale review: the payout
 * plan of a gross withdrawal, the stale indicator, and the inline explanation
 * of a refused decision.
 */

import { Trans, useLingui } from '@lingui/react/macro';
import { Link } from 'react-router-dom';

import type {
  AdminDispersionPayoutPlan,
  AdminDispersionQueueRow,
} from '@/graphql/queries/admin-loopay';
import { Badge } from '@/shared/components/ui/badge';
import { formatFiat } from '@/shared/lib/format-money';

import { staleAlertKind, type WithdrawalDecisionFailure } from '../lib/dispersion-approval';

/** Where staff enrol a second factor (same target as the act-as button and the backoffice MFA gate). */
const MFA_SETTINGS_ROUTE = '/suite/settings';

export function DispersionPayoutPlan({
  plan,
  currency,
}: {
  plan: AdminDispersionPayoutPlan;
  currency: string;
}) {
  const { t } = useLingui();
  // Everything that stays in the ops vault: Loopay fee, network component and rounding remainder.
  const kept = (Number(plan.gross) - Number(plan.funding_amount)).toFixed(8);
  const lines = [
    { label: t`Bruto`, value: plan.gross },
    { label: t`Fee`, value: kept },
    { label: t`Neto`, value: plan.funding_amount },
  ];

  return (
    <dl data-testid="dispersion-payout-plan" className="grid grid-cols-[auto_1fr] gap-x-2 text-xs">
      {lines.map((line) => (
        <div key={line.label} className="contents">
          <dt className="text-muted-foreground">{line.label}</dt>
          <dd className="font-mono tabular-nums text-right">{formatFiat(line.value, currency)}</dd>
        </div>
      ))}
    </dl>
  );
}

/** "Revisión requerida" with the reason, plus one badge per stale alert; nothing on a fresh row. */
export function DispersionStaleReview({ row }: { row: AdminDispersionQueueRow }) {
  const { t } = useLingui();
  const alerts = row.stale_alerts ?? [];

  if (!row.stale_review_required && alerts.length === 0) return null;

  const alertLabel = (key: string) => {
    switch (staleAlertKind(key)) {
      case 'sweep-unsettled':
        return t`Barrido sin liquidar (2 h)`;
      case 'payout-no-event':
        return t`Pago sin respuesta del proveedor (2 h)`;
      case 'awaiting-approval':
        return t`Sin aprobación hace más de 24 h`;
      default:
        return key;
    }
  };

  return (
    <div data-testid="dispersion-stale-review" className="flex max-w-xs flex-col gap-1">
      {row.stale_review_required ? (
        <>
          <Badge variant="destructive" className="w-fit">
            <Trans>Revisión requerida</Trans>
          </Badge>
          {row.stale_review_reason ? (
            <span className="text-xs text-muted-foreground">{row.stale_review_reason}</span>
          ) : null}
        </>
      ) : null}
      {alerts.map((alert) => (
        <Badge key={alert.key} variant="warning" className="w-fit">
          {alertLabel(alert.key)}
        </Badge>
      ))}
    </div>
  );
}

/** Why the back refused an approve, reject or retry: a missing second factor links to its setup. */
export function DispersionDecisionFailure({ kind }: { kind: WithdrawalDecisionFailure }) {
  return (
    <div
      role="alert"
      data-testid="dispersion-decision-error"
      className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
    >
      {kind === 'mfa-required' ? (
        <p>
          <Trans>
            Aprobar o rechazar un retiro requiere la verificación en dos pasos en tu cuenta.
          </Trans>{' '}
          <Link to={MFA_SETTINGS_ROUTE} className="font-medium underline underline-offset-2">
            <Trans>Configúrala y vuelve a iniciar sesión.</Trans>
          </Link>
        </p>
      ) : (
        <p>
          <Trans>El retiro cambió de estado mientras decidías. La lista se actualizó.</Trans>
        </p>
      )}
    </div>
  );
}
