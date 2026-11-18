/** Display helpers shared by the tenant screens (pure, locale-aware). */

import type { TenantCustomer } from '@/graphql/types/tenant';

export type StatusTone = 'success' | 'warning' | 'destructive' | 'secondary';

const SUCCESS = new Set(['ACTIVE', 'APPROVED', 'COMPLETED', 'RESOLVED', 'SUBMITTED', 'PAID']);
const WARNING = new Set([
  'PENDING',
  'PENDING_KYC',
  'PENDING_REVIEW',
  'INITIATED',
  'PROCESSING',
  'REQUESTED',
  'UPLOADED',
  'ADDITIONAL_INFO_REQUIRED',
  'CREATED',
]);
const DESTRUCTIVE = new Set([
  'REJECTED',
  'FAILED',
  'CANCELLED',
  'EXPIRED',
  'SUSPENDED',
  'FROZEN',
  'OFFBOARDED',
  'REVOKED',
]);

/** Badge tone of a REST status value (unknown values stay neutral). */
export function statusTone(status: string | null | undefined): StatusTone {
  const value = (status ?? '').toUpperCase();
  if (SUCCESS.has(value)) return 'success';
  if (WARNING.has(value)) return 'warning';
  if (DESTRUCTIVE.has(value)) return 'destructive';

  return 'secondary';
}

/** `PENDING_REVIEW` → `Pending review`. Status codes are API values, shown readable. */
export function humanizeCode(value: string | null | undefined): string {
  if (!value) return '—';
  const words = value.replace(/[_-]+/g, ' ').trim().toLowerCase();

  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Date and time in the browser locale; `—` for empty or invalid values. */
export function formatDateTime(value: string | null | undefined, locale?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

/** Business name, or first + last name, or the email as a last resort. */
export function customerDisplayName(
  customer: Pick<
    TenantCustomer,
    'customer_type' | 'business_name' | 'first_name' | 'last_name' | 'email'
  >
): string {
  if (customer.customer_type === 'business' && customer.business_name)
    return customer.business_name;
  const name = [customer.first_name, customer.last_name].filter(Boolean).join(' ').trim();

  return name || customer.email;
}

/** Amount with 2–8 decimals in the browser locale; the raw value when it is not a number. */
export function formatAmount(value: string | number | null | undefined, locale?: string): string {
  if (value === null || value === undefined || value === '') return '—';
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return String(value);

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  }).format(number);
}
