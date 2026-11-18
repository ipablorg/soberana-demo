/**
 * Provider payout state of a v2 dispersion: badge + tooltip with the provider
 * and the vendor's last status. Renders nothing for legacy rows (no payout).
 */

import { useLingui } from '@lingui/react/macro';

import type { AdminDispersionPayout } from '@/graphql/queries/admin-loopay';
import { Badge } from '@/shared/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';

import { payoutTone } from '../lib/dispersion-payout';

interface DispersionPayoutBadgeProps {
  payout: AdminDispersionPayout;
}

export function DispersionPayoutBadge({ payout }: DispersionPayoutBadgeProps) {
  const { t } = useLingui();

  const label = (() => {
    switch (payout.state) {
      case 'PLACED':
        return t`Pago en curso`;
      case 'AWAITING_FUNDS':
        return t`Esperando fondos`;
      case 'EXECUTED':
      case 'COMPLETED':
        return t`Pagado`;
      case 'BLOCKED':
        return t`Bloqueado`;
      case 'REJECTED':
        return t`Rechazado por el proveedor`;
      case 'UNKNOWN':
        return t`Estado desconocido`;
      case 'FAILED':
        return t`Falló en el proveedor`;
      case 'RETURNED':
        return t`Devuelto`;
      default:
        return payout.state;
    }
  })();

  const details = [
    `${t`Proveedor`}: ${payout.providerCode}`,
    `${t`Estado`}: ${payout.state}`,
    payout.terminalVendorStatus
      ? `${t`Estado del proveedor`}: ${payout.terminalVendorStatus}`
      : null,
  ].filter((line): line is string => line !== null);

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span aria-label={details.join(' · ')} className="inline-flex">
            <Badge variant={payoutTone(payout.state)}>{label}</Badge>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {details.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
