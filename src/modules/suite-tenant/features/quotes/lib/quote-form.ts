/** Rate lookup (`GET /v1/quotes`) and create-quote (`POST /v1/quotes`) forms. */

import type { TenantCreateQuoteInput, TenantQuoteRateFilters } from '@/graphql/types/tenant';

export interface RateFormValues {
  from: string;
  to: string;
}

export interface QuoteFormValues {
  source_currency: string;
  destination_currency: string;
  source_amount: string;
}

export type QuoteFormError = 'required' | 'amount';
export type QuoteFormErrors = Partial<Record<keyof QuoteFormValues, QuoteFormError>>;
export type RateFormErrors = Partial<Record<keyof RateFormValues, 'required'>>;

export const EMPTY_QUOTE_FORM: QuoteFormValues = {
  source_currency: '',
  destination_currency: '',
  source_amount: '',
};

const currency = (value: string) => value.trim().toUpperCase();

/** Accepts a comma as the decimal separator. */
export function amountOf(value: string): number {
  return Number(value.trim().replace(',', '.'));
}

export function validateRateForm(values: RateFormValues): RateFormErrors {
  const errors: RateFormErrors = {};
  if (!values.from.trim()) errors.from = 'required';
  if (!values.to.trim()) errors.to = 'required';

  return errors;
}

export function toRateFilters(values: RateFormValues): TenantQuoteRateFilters {
  return { from: currency(values.from), to: currency(values.to) };
}

export function validateQuoteForm(values: QuoteFormValues): QuoteFormErrors {
  const errors: QuoteFormErrors = {};
  if (!values.source_currency.trim()) errors.source_currency = 'required';
  if (!values.destination_currency.trim()) errors.destination_currency = 'required';
  if (!values.source_amount.trim()) {
    errors.source_amount = 'required';
  } else {
    const amount = amountOf(values.source_amount);
    if (!Number.isFinite(amount) || amount < 0.01) errors.source_amount = 'amount';
  }

  return errors;
}

export function toCreateQuoteInput(values: QuoteFormValues): TenantCreateQuoteInput {
  return {
    source_currency: currency(values.source_currency),
    destination_currency: currency(values.destination_currency),
    source_amount: amountOf(values.source_amount),
  };
}
