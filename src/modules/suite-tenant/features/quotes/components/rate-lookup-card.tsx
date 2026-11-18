import { useState, type FormEvent } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import type { TenantQuoteRateFilters } from '@/graphql/types/tenant';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useTenantQuoteRate } from '@/modules/suite-tenant/features/quotes/hooks/use-tenant-quotes';
import {
  toRateFilters,
  validateRateForm,
  type RateFormErrors,
  type RateFormValues,
} from '@/modules/suite-tenant/features/quotes/lib/quote-form';
import { FormField } from '@/modules/suite-tenant/components/molecules/form-field';
import { QueryError } from '@/modules/suite-tenant/components/molecules/query-state';
import { formatAmount } from '@/modules/suite-tenant/lib/tenant-format';

/** Container: indicative rate of a currency pair (not locked, nothing is stored). */
export function RateLookupCard() {
  const { t } = useLingui();
  const [values, setValues] = useState<RateFormValues>({ from: '', to: '' });
  const [errors, setErrors] = useState<RateFormErrors>({});
  const [filters, setFilters] = useState<TenantQuoteRateFilters | null>(null);
  const rate = useTenantQuoteRate(filters);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateRateForm(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setFilters(toRateFilters(values));
  };

  const result = rate.data?.tenant_quoteRate;

  return (
    <Card className="rounded-xl shadow-none">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          <Trans>Indicative rate</Trans>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          <Trans>A reference price. It is not locked and nothing is stored.</Trans>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={submit}
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          noValidate
          data-testid="rate-form"
        >
          <FormField id="rate-from" label={t`From`} error={errors.from ? t`Required.` : undefined}>
            <Input
              id="rate-from"
              placeholder="USD"
              value={values.from}
              onChange={(event) =>
                setValues((current) => ({ ...current, from: event.target.value }))
              }
            />
          </FormField>
          <FormField id="rate-to" label={t`To`} error={errors.to ? t`Required.` : undefined}>
            <Input
              id="rate-to"
              placeholder="MXN"
              value={values.to}
              onChange={(event) => setValues((current) => ({ ...current, to: event.target.value }))}
            />
          </FormField>
          <div className="flex items-end">
            <Button type="submit" variant="outline" className="w-full">
              <Trans>Check rate</Trans>
            </Button>
          </div>
        </form>

        {filters === null ? null : rate.isLoading ? (
          <Skeleton className="h-14 w-full rounded-xl" />
        ) : rate.error || !result ? (
          <QueryError error={rate.error} onRetry={() => void rate.refetch()} />
        ) : (
          <div className="rounded-xl bg-muted/30 px-4 py-3" data-testid="rate-result">
            <p className="text-xs text-muted-foreground">{`1 ${result.from} =`}</p>
            <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">
              {formatAmount(result.rate)} {result.to}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
