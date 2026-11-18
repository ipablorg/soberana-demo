import { useState, type FormEvent } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { RailCatalogueList } from '@/modules/suite-tenant/features/rails/components/rail-catalogue-list';
import { useTenantRailCatalogue } from '@/modules/suite-tenant/features/rails/hooks/use-tenant-rail-catalogue';
import { FormField } from '@/modules/suite-tenant/components/molecules/form-field';
import {
  EmptyState,
  QueryError,
  TenantPageSkeleton,
} from '@/modules/suite-tenant/components/molecules/query-state';
import { SectionHeader } from '@/modules/suite-tenant/components/molecules/section-header';
import { useTenantMe } from '@/modules/suite-tenant/hooks/use-tenant-me';

const COUNTRY = /^[A-Z]{2,3}$/;

/** Container: the client's enabled rails and the read-only rail catalogue, filterable by country. */
export default function TenantRails() {
  const { t } = useLingui();
  const me = useTenantMe();
  const [draft, setDraft] = useState('');
  const [country, setCountry] = useState('');
  const [invalid, setInvalid] = useState(false);
  const catalogue = useTenantRailCatalogue(country);

  const filter = (event: FormEvent) => {
    event.preventDefault();
    const value = draft.trim().toUpperCase();
    if (value && !COUNTRY.test(value)) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setCountry(value);
  };

  if (me.isLoading) return <TenantPageSkeleton />;
  if (me.error || !me.data)
    return <QueryError error={me.error} onRetry={() => void me.refetch()} />;

  const enabled = me.data.tenant_me.enabled_rails;

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t`Rails.`}
        subtitle={t`How money enters and leaves, country by country.`}
      />

      <Card className="rounded-xl shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            <Trans>Enabled for your account</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enabled.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              <Trans>No rails yet. Your account manager enables them.</Trans>
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2" data-testid="enabled-rails">
              {enabled.map((rail) => (
                <li
                  key={`${rail.code}-${rail.currency}-${rail.country ?? ''}`}
                  className="rounded-md bg-muted/50 px-2.5 py-1 font-mono text-xs text-foreground"
                >
                  {rail.code} · {rail.currency}
                  {rail.country ? ` · ${rail.country}` : ''}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <form
          onSubmit={filter}
          className="flex max-w-md items-end gap-2"
          noValidate
          data-testid="rails-filter"
        >
          <div className="flex-1">
            <FormField
              id="rails-country"
              label={t`Country`}
              hint={t`ISO code, e.g. MX or MEX. Empty shows every country.`}
              error={invalid ? t`Use a two- or three-letter ISO code.` : undefined}
            >
              <Input
                id="rails-country"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
            </FormField>
          </div>
          <Button type="submit" variant="outline" className="mb-6">
            <Trans>Filter</Trans>
          </Button>
        </form>

        {catalogue.isLoading ? (
          <TenantPageSkeleton />
        ) : catalogue.error || !catalogue.data ? (
          <QueryError error={catalogue.error} onRetry={() => void catalogue.refetch()} />
        ) : catalogue.data.tenant_railCatalogue.countries.length === 0 ? (
          <EmptyState
            title={t`No rails in that country.`}
            description={t`Try another country code.`}
          />
        ) : (
          <RailCatalogueList countries={catalogue.data.tenant_railCatalogue.countries} />
        )}
      </div>
    </div>
  );
}
