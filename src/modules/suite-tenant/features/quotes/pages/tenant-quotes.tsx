import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';

import { tenantQuoteRoute } from '@/shared/config/tenant-modes.config';
import { CreateQuoteCard } from '@/modules/suite-tenant/features/quotes/components/create-quote-card';
import { RateLookupCard } from '@/modules/suite-tenant/features/quotes/components/rate-lookup-card';
import { useCreateTenantQuote } from '@/modules/suite-tenant/features/quotes/hooks/use-tenant-quotes';
import {
  toCreateQuoteInput,
  validateQuoteForm,
  type QuoteFormErrors,
  type QuoteFormValues,
} from '@/modules/suite-tenant/features/quotes/lib/quote-form';
import { SectionHeader } from '@/modules/suite-tenant/components/molecules/section-header';

/** Container: indicative rate lookup and quote creation (the new quote opens in its detail). */
export default function TenantQuotes() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<QuoteFormErrors>({});
  const create = useCreateTenantQuote((result) =>
    navigate(tenantQuoteRoute(result.tenant_createQuote.id))
  );

  const submit = (values: QuoteFormValues) => {
    const found = validateQuoteForm(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    create.mutate({ input: toCreateQuoteInput(values) });
  };

  return (
    <div className="space-y-6">
      <SectionHeader title={t`Quotes.`} subtitle={t`Know the rate before money moves.`} />
      <RateLookupCard />
      <CreateQuoteCard pending={create.isPending} errors={errors} onSubmit={submit} />
    </div>
  );
}
