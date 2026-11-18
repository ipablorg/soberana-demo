import { Trans } from '@lingui/react/macro';

import type { TenantEndorsement } from '@/graphql/types/tenant';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { StatusBadge } from '@/modules/suite-tenant/components/atoms/status-badge';

interface CustomerRailsCardProps {
  rails: readonly TenantEndorsement[] | undefined;
  isLoading: boolean;
}

/** Payment rails (endorsements) of a customer, pending ones included. */
export function CustomerRailsCard({ rails, isLoading }: CustomerRailsCardProps) {
  return (
    <Card className="rounded-xl shadow-none">
      <CardHeader>
        <CardTitle className="text-lg">
          <Trans>Rails</Trans>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            <Trans>Loading rails…</Trans>
          </p>
        ) : !rails || rails.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            <Trans>No rails yet. They appear once KYC is approved.</Trans>
          </p>
        ) : (
          <ul className="space-y-2" data-testid="customer-rails">
            {rails.map((rail) => (
              <li
                key={`${rail.payment_rail}-${rail.country ?? ''}`}
                className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 px-3 py-2"
              >
                <span className="font-mono text-sm text-foreground">
                  {rail.payment_rail}
                  {rail.country ? (
                    <span className="text-muted-foreground"> · {rail.country}</span>
                  ) : null}
                </span>
                <StatusBadge status={rail.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
