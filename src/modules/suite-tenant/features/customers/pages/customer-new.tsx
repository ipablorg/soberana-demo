import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';

import { Card, CardContent } from '@/shared/components/ui/card';
import { tenantCustomerRoute } from '@/shared/config/tenant-modes.config';
import { CustomerForm } from '@/modules/suite-tenant/features/customers/components/customer-form';
import { useCreateTenantCustomer } from '@/modules/suite-tenant/features/customers/hooks/use-tenant-customers';
import {
  EMPTY_CUSTOMER_FORM,
  toCreateCustomerInput,
  validateCustomerForm,
  type CustomerFormErrors,
  type CustomerFormField,
  type CustomerFormValues,
} from '@/modules/suite-tenant/features/customers/lib/customer-form';
import { SectionHeader } from '@/modules/suite-tenant/components/molecules/section-header';

/** Container: create a customer, then open its detail (where the KYC link lives). */
export default function CustomerNew() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const [values, setValues] = useState<CustomerFormValues>(EMPTY_CUSTOMER_FORM);
  const [errors, setErrors] = useState<CustomerFormErrors>({});
  const create = useCreateTenantCustomer((result) => {
    navigate(tenantCustomerRoute(result.tenant_createCustomer.id));
  });

  const change = (field: CustomerFormField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }) as CustomerFormValues);
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = () => {
    const found = validateCustomerForm(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    create.mutate({ input: toCreateCustomerInput(values) });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t`New customer.`}
        subtitle={t`They verify themselves through a secure link.`}
      />
      <Card className="rounded-xl shadow-none">
        <CardContent className="pt-6">
          <CustomerForm
            values={values}
            errors={errors}
            pending={create.isPending}
            onChange={change}
            onSubmit={submit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
