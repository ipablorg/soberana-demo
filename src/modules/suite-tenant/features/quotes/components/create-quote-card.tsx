import { useState, type FormEvent } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  EMPTY_QUOTE_FORM,
  type QuoteFormErrors,
  type QuoteFormValues,
} from '@/modules/suite-tenant/features/quotes/lib/quote-form';
import { FormField } from '@/modules/suite-tenant/components/molecules/form-field';

interface CreateQuoteCardProps {
  pending: boolean;
  errors: QuoteFormErrors;
  onSubmit: (values: QuoteFormValues) => void;
}

/** Presentational create-quote form: source and destination currency, source amount. */
export function CreateQuoteCard({ pending, errors, onSubmit }: CreateQuoteCardProps) {
  const { t } = useLingui();
  const [values, setValues] = useState<QuoteFormValues>(EMPTY_QUOTE_FORM);

  const messageOf = (field: keyof QuoteFormValues) => {
    if (errors[field] === 'required') return t`Required.`;
    if (errors[field] === 'amount') return t`Enter an amount of at least 0.01.`;
    return undefined;
  };

  const field = (name: keyof QuoteFormValues, label: string, placeholder?: string) => (
    <FormField id={`quote-${name}`} label={label} error={messageOf(name)}>
      <Input
        id={`quote-${name}`}
        placeholder={placeholder}
        inputMode={name === 'source_amount' ? 'decimal' : undefined}
        value={values[name]}
        aria-invalid={errors[name] ? true : undefined}
        onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))}
      />
    </FormField>
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <Card className="rounded-xl shadow-none">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          <Trans>New quote</Trans>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          <Trans>Stored for your account. Attach it to an off-ramp while it is active.</Trans>
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4" noValidate data-testid="quote-form">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {field('source_currency', t`Source currency`, 'USDT')}
            {field('destination_currency', t`Destination currency`, 'COP')}
            {field('source_amount', t`Source amount`)}
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? <Trans>Creating…</Trans> : <Trans>Create quote</Trans>}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
