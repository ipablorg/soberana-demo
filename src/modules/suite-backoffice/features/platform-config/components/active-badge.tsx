import { Trans } from '@lingui/react/macro';

import { Badge } from '@/shared/components/ui/badge';

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? 'success' : 'secondary'} className="font-semibold">
      {active ? <Trans>Activo</Trans> : <Trans>Inactivo</Trans>}
    </Badge>
  );
}
