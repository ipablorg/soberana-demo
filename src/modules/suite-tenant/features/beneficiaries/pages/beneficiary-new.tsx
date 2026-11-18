import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';

import { Card, CardContent } from '@/shared/components/ui/card';
import { tenantBeneficiaryRoute } from '@/shared/config/tenant-modes.config';
import { BeneficiaryForm } from '@/modules/suite-tenant/features/beneficiaries/components/beneficiary-form';
import {
  useCreateTenantBeneficiary,
  useTenantRails,
} from '@/modules/suite-tenant/features/beneficiaries/hooks/use-tenant-beneficiaries';
import {
  EMPTY_BENEFICIARY_FORM,
  payoutRails,
  railCountries,
  toCreateBeneficiaryInput,
  validateBeneficiaryForm,
  type BeneficiaryFormErrors,
  type BeneficiaryFormField,
  type BeneficiaryFormValues,
} from '@/modules/suite-tenant/features/beneficiaries/lib/beneficiary-form';
import {
  EmptyState,
  QueryError,
  TenantPageSkeleton,
} from '@/modules/suite-tenant/components/molecules/query-state';
import { SectionHeader } from '@/modules/suite-tenant/components/molecules/section-header';
import { useTenantCustomerOptions } from '@/modules/suite-tenant/hooks/use-tenant-customer-options';

/** Container: register a payout beneficiary for a customer on one of the client's payout rails. */
export default function BeneficiaryNew() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const customers = useTenantCustomerOptions();
  const rails = useTenantRails();
  const [values, setValues] = useState<BeneficiaryFormValues>({
    ...EMPTY_BENEFICIARY_FORM,
    customer_id: params.get('customer_id') ?? '',
  });
  const [errors, setErrors] = useState<BeneficiaryFormErrors>({});
  const create = useCreateTenantBeneficiary((result) =>
    navigate(tenantBeneficiaryRoute(result.tenant_createBeneficiary.id))
  );

  if (customers.isLoading || rails.isLoading) return <TenantPageSkeleton />;
  if (customers.error || !customers.data) {
    return <QueryError error={customers.error} onRetry={() => void customers.refetch()} />;
  }
  if (rails.error || !rails.data) {
    return <QueryError error={rails.error} onRetry={() => void rails.refetch()} />;
  }

  const payout = payoutRails(rails.data.tenant_listRails);

  const change = (field: BeneficiaryFormField, value: string) => {
    setValues((current) => {
      if (field !== 'payment_rail') return { ...current, [field]: value };
      // A new rail brings its own country and account fields.
      const countries = railCountries(payout.find((rail) => rail.code === value));

      return {
        ...EMPTY_BENEFICIARY_FORM,
        ...pickCommon(current),
        payment_rail: value,
        country: countries.length === 1 ? countries[0] : '',
      };
    });
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = () => {
    const found = validateBeneficiaryForm(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    create.mutate({ input: toCreateBeneficiaryInput(values) });
  };

  return (
    <div className="space-y-6">
      <SectionHeader title={t`New beneficiary.`} subtitle={t`Where a customer's money lands.`} />
      {payout.length === 0 ? (
        <EmptyState
          title={t`No payout rails yet.`}
          description={t`Ask your account manager to enable a rail you can send money on.`}
        />
      ) : (
        <Card className="rounded-xl shadow-none">
          <CardContent className="pt-6">
            <BeneficiaryForm
              values={values}
              errors={errors}
              customers={customers.data.tenant_listCustomers.data}
              rails={payout}
              pending={create.isPending}
              onChange={change}
              onFavoriteChange={(value) =>
                setValues((current) => ({ ...current, is_favorite: value }))
              }
              onSubmit={submit}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/** Fields that do not depend on the rail and survive a rail change. */
function pickCommon(values: BeneficiaryFormValues): Partial<BeneficiaryFormValues> {
  return {
    customer_id: values.customer_id,
    holder_type: values.holder_type,
    beneficiary_name: values.beneficiary_name,
    relationship: values.relationship,
    alias: values.alias,
    is_favorite: values.is_favorite,
  };
}
