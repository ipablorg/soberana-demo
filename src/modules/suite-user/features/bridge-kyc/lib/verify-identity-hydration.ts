import type { CustomerProfile } from '@/graphql/queries/customers/get-customer-profile';
import type { VerifyIdentityValues } from './verify-identity.schema';

type HydratableVerifyIdentityField = Extract<
  keyof VerifyIdentityValues,
  'tax_id' | 'tax_id_type' | 'address_line_1' | 'city' | 'state' | 'postal_code' | 'country' | 'nationality'
>;

type HydratableVerifyIdentityValues = Partial<Pick<VerifyIdentityValues, HydratableVerifyIdentityField>>;

function pickNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asAddressRecord(value: CustomerProfile['address'] | undefined): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

export function buildVerifyIdentityHydrationValues(
  customerProfile: CustomerProfile | null | undefined,
): HydratableVerifyIdentityValues {
  if (!customerProfile) {
    return {};
  }

  const address = asAddressRecord(customerProfile.address);

  return {
    tax_id: pickNonEmptyString(customerProfile.tax_id),
    tax_id_type: pickNonEmptyString(customerProfile.tax_id_type),
    address_line_1: pickNonEmptyString(address?.address_line_1) ?? pickNonEmptyString(address?.street),
    city: pickNonEmptyString(address?.city),
    state: pickNonEmptyString(address?.state),
    postal_code: pickNonEmptyString(address?.postal_code),
    country: pickNonEmptyString(address?.country) ?? pickNonEmptyString(customerProfile.country),
    nationality: pickNonEmptyString(customerProfile.country),
  };
}

export function isHydratableVerifyIdentityValueDirty(
  currentValue: unknown,
  nextValue: string | undefined,
  isDirty: boolean,
): boolean {
  if (isDirty || !nextValue) {
    return false;
  }

  return currentValue !== nextValue;
}
