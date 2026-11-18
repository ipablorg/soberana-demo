import { useLingui } from '@lingui/react/macro';

import type { TenantCustomer } from '@/graphql/types/tenant';
import { NativeSelect } from '@/modules/suite-tenant/components/atoms/native-select';
import { FormField } from '@/modules/suite-tenant/components/molecules/form-field';
import { customerDisplayName, humanizeCode } from '@/modules/suite-tenant/lib/tenant-format';

interface CustomerPickerProps {
  id: string;
  customers: readonly TenantCustomer[];
  value: string;
  onChange: (customerId: string) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
}

/** Customer select labelled with name, external id and operational status. */
export function CustomerPicker({
  id,
  customers,
  value,
  onChange,
  error,
  disabled,
  label,
}: CustomerPickerProps) {
  const { t } = useLingui();

  return (
    <FormField id={id} label={label ?? t`Customer`} error={error}>
      <NativeSelect
        id={id}
        value={value}
        disabled={disabled}
        placeholder={t`Choose a customer`}
        options={customers.map((customer) => ({
          value: customer.id,
          label: `${customerDisplayName(customer)} · ${customer.external_id} · ${humanizeCode(customer.customer_status)}`,
        }))}
        onChange={(event) => onChange(event.target.value)}
      />
    </FormField>
  );
}
