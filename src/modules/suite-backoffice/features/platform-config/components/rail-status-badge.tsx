import { Trans } from '@lingui/react/macro';

import { Badge } from '@/shared/components/ui/badge';

import { isRailUnderMaintenance } from '../lib/rail-maintenance';
import { ActiveBadge } from './active-badge';

/** Active/inactive plus a maintenance indicator for rails the backend lists as under maintenance. */
export function RailStatusBadge({ code, active }: { code: string; active: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <ActiveBadge active={active} />
      {active && isRailUnderMaintenance(code) ? (
        <Badge variant="warning" className="font-semibold">
          <Trans>En mantenimiento</Trans>
        </Badge>
      ) : null}
    </div>
  );
}
