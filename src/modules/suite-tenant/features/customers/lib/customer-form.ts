/**
 * Create-customer form: values, client-side validation mirroring the back's
 * `CreateCustomerDto` (`POST /v1/customers`), and the REST body.
 *
 * The tenant backoffice creates customers with the hosted KYC flow
 * (`kyc_method: kyc_link`): the response carries the `kyc_link` the customer
 * opens to verify. Documents are never typed here.
 */

import type { TenantCreateCustomerInput } from '@/graphql/types/tenant';

export interface CustomerFormValues {
  customer_type: 'individual' | 'business';
  external_id: string;
  email: string;
  first_name: string;
  last_name: string;
  business_name: string;
  tax_id: string;
  tax_id_type: string;
  country: string;
  phone: string;
}

export type CustomerFormField = keyof CustomerFormValues;

/** Validation failures keyed by field; the screen maps each kind to copy. */
export type CustomerFormErrors = Partial<
  Record<CustomerFormField, 'required' | 'too_long' | 'email' | 'country'>
>;

export const EMPTY_CUSTOMER_FORM: CustomerFormValues = {
  customer_type: 'individual',
  external_id: '',
  email: '',
  first_name: '',
  last_name: '',
  business_name: '',
  tax_id: '',
  tax_id_type: '',
  country: '',
  phone: '',
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO3 = /^[A-Z]{3}$/;

function checkLength(
  errors: CustomerFormErrors,
  field: CustomerFormField,
  value: string,
  max: number
): void {
  if (value.length === 0) errors[field] = 'required';
  else if (value.length > max) errors[field] = 'too_long';
}

/** Same limits as the DTO (`@Length`, `@IsEmail`, ISO 3166-1 alpha-3 country). */
export function validateCustomerForm(values: CustomerFormValues): CustomerFormErrors {
  const errors: CustomerFormErrors = {};
  const v = trimValues(values);

  checkLength(errors, 'external_id', v.external_id, 255);
  if (!v.email) errors.email = 'required';
  else if (!EMAIL.test(v.email)) errors.email = 'email';

  if (v.customer_type === 'business') {
    checkLength(errors, 'business_name', v.business_name, 100);
  } else {
    checkLength(errors, 'first_name', v.first_name, 100);
    checkLength(errors, 'last_name', v.last_name, 100);
  }

  checkLength(errors, 'tax_id', v.tax_id, 255);
  checkLength(errors, 'tax_id_type', v.tax_id_type, 50);
  if (v.country && !ISO3.test(v.country)) errors.country = 'country';

  return errors;
}

function trimValues(values: CustomerFormValues): CustomerFormValues {
  return {
    ...values,
    external_id: values.external_id.trim(),
    email: values.email.trim(),
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    business_name: values.business_name.trim(),
    tax_id: values.tax_id.trim(),
    tax_id_type: values.tax_id_type.trim(),
    country: values.country.trim().toUpperCase(),
    phone: values.phone.trim(),
  };
}

/** REST body: only the fields of the chosen customer type, empty optionals omitted. */
export function toCreateCustomerInput(values: CustomerFormValues): TenantCreateCustomerInput {
  const v = trimValues(values);
  const input: TenantCreateCustomerInput = {
    external_id: v.external_id,
    email: v.email,
    customer_type: v.customer_type,
    tax_id: v.tax_id,
    tax_id_type: v.tax_id_type,
    kyc_method: 'kyc_link',
  };

  if (v.customer_type === 'business') input.business_name = v.business_name;
  else {
    input.first_name = v.first_name;
    input.last_name = v.last_name;
  }
  if (v.country) input.country = v.country;
  if (v.phone) input.phone = v.phone;

  return input;
}
