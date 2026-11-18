import { Trans, useLingui } from '@lingui/react/macro';

import type { TenantRailCatalogueCountry } from '@/graphql/types/tenant';
import { Badge } from '@/shared/components/ui/badge';

interface RailCatalogueListProps {
  countries: readonly TenantRailCatalogueCountry[];
}

/** Presentational catalogue: per country, each rail with its directions, payout support and providers. */
export function RailCatalogueList({ countries }: RailCatalogueListProps) {
  const { t } = useLingui();
  const directionLabel = (direction: string) =>
    direction === 'INBOUND' ? t`Receive` : direction === 'OUTBOUND' ? t`Send` : direction;

  return (
    <div className="space-y-4" data-testid="rail-catalogue">
      {countries.map((entry) => (
        <section key={entry.country} className="rounded-xl border border-border bg-card">
          <h3 className="border-b border-border px-4 py-2 font-mono text-sm font-semibold text-foreground">
            {entry.country}
          </h3>
          <ul className="divide-y divide-border">
            {entry.rails.map((rail) => (
              <li
                key={rail.code}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {rail.name}{' '}
                    <span className="font-mono text-xs text-muted-foreground">
                      {rail.code} · {rail.currency}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {rail.providers.map((provider) => (
                      <span
                        key={provider.code}
                        className={provider.available ? undefined : 'line-through'}
                      >
                        {provider.code}{' '}
                      </span>
                    ))}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {rail.directions.map((direction) => (
                    <Badge key={direction} variant="secondary" className="rounded-md text-xs">
                      {directionLabel(direction)}
                    </Badge>
                  ))}
                  {rail.beneficiary_supported ? (
                    <Badge variant="success" className="rounded-md text-xs">
                      <Trans>Beneficiaries</Trans>
                    </Badge>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
