import { Link } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';

import type { TenantMe } from '@/graphql/types/tenant';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { TENANT_ROUTES } from '@/shared/config/tenant-modes.config';
import { EnvironmentBadge } from '@/modules/suite-tenant/components/atoms/environment-badge';
import { StatusBadge } from '@/modules/suite-tenant/components/atoms/status-badge';
import { KeyValueList } from '@/modules/suite-tenant/components/molecules/key-value-list';
import { SectionHeader } from '@/modules/suite-tenant/components/molecules/section-header';
import { normalizeEnvironment } from '@/modules/suite-tenant/lib/tenant-environment';
import { formatDateTime } from '@/modules/suite-tenant/lib/tenant-format';

interface OverviewPanelProps {
  tenant: TenantMe;
}

/** Presentational overview of the tenant (`tenant_me`). */
export function OverviewPanel({ tenant }: OverviewPanelProps) {
  const { t } = useLingui();

  return (
    <div className="space-y-6">
      <SectionHeader title={`${tenant.name}.`} subtitle={t`Your business at a glance.`} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="rounded-xl shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">
              <Trans>Account</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <KeyValueList
              items={[
                { label: t`Client`, value: tenant.name },
                { label: t`Status`, value: <StatusBadge status={tenant.status} /> },
                {
                  label: t`Environment`,
                  value: (
                    <EnvironmentBadge environment={normalizeEnvironment(tenant.environment)} />
                  ),
                },
                { label: t`Client ID`, value: tenant.client_id, mono: true },
              ]}
            />
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">
              <Trans>API key</Trans>
            </CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to={TENANT_ROUTES.apiKey}>
                <Trans>Manage</Trans>
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <KeyValueList
              items={[
                { label: t`Key prefix`, value: tenant.api_key_prefix, mono: true },
                { label: t`Rotated at`, value: formatDateTime(tenant.api_key_rotated_at) },
                {
                  label: t`Expires at`,
                  value: tenant.api_key_expires_at
                    ? formatDateTime(tenant.api_key_expires_at)
                    : t`Never`,
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">
            <Trans>Enabled rails</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tenant.enabled_rails.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              <Trans>No rails enabled yet. Loopay enables them for your account.</Trans>
            </p>
          ) : (
            <ul
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
              data-testid="enabled-rails"
            >
              {tenant.enabled_rails.map((rail) => (
                <li
                  key={`${rail.code}-${rail.currency}-${rail.country ?? ''}`}
                  className="rounded-xl bg-muted/30 px-4 py-3"
                >
                  <p className="font-mono text-sm text-foreground">{rail.code}</p>
                  <p className="text-xs text-muted-foreground">
                    {[rail.currency, rail.country].filter(Boolean).join(' · ')}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
