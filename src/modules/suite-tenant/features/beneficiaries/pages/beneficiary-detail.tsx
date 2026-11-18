import { useNavigate, useParams } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';

import { Ban, RotateCcw, Trash2 } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { TENANT_ROUTES } from '@/shared/config/tenant-modes.config';
import { BeneficiaryEditForm } from '@/modules/suite-tenant/features/beneficiaries/components/beneficiary-edit-form';
import {
  useDeactivateTenantBeneficiary,
  useDeleteTenantBeneficiary,
  useReactivateTenantBeneficiary,
  useTenantBeneficiary,
  useUpdateTenantBeneficiary,
} from '@/modules/suite-tenant/features/beneficiaries/hooks/use-tenant-beneficiaries';
import {
  editValuesOf,
  isDeactivated,
  toUpdateBeneficiaryInput,
} from '@/modules/suite-tenant/features/beneficiaries/lib/beneficiary-form';
import { StatusBadge } from '@/modules/suite-tenant/components/atoms/status-badge';
import { ConfirmAction } from '@/modules/suite-tenant/components/molecules/confirm-action';
import { KeyValueList } from '@/modules/suite-tenant/components/molecules/key-value-list';
import {
  QueryError,
  TenantPageSkeleton,
} from '@/modules/suite-tenant/components/molecules/query-state';
import { SectionHeader } from '@/modules/suite-tenant/components/molecules/section-header';
import { formatDateTime, humanizeCode } from '@/modules/suite-tenant/lib/tenant-format';

/** Container: one beneficiary, its review state, the editable fields and the lifecycle actions. */
export default function BeneficiaryDetail() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { beneficiaryId = '' } = useParams();
  const beneficiary = useTenantBeneficiary(beneficiaryId);
  const update = useUpdateTenantBeneficiary();
  const deactivate = useDeactivateTenantBeneficiary();
  const reactivate = useReactivateTenantBeneficiary();
  const data = beneficiary.data?.tenant_getBeneficiary;
  const remove = useDeleteTenantBeneficiary(() =>
    navigate(
      `${TENANT_ROUTES.beneficiaries}?customer_id=${encodeURIComponent(data?.customer_id ?? '')}`
    )
  );

  if (beneficiary.isLoading) return <TenantPageSkeleton />;
  if (beneficiary.error || !data) {
    return <QueryError error={beneficiary.error} onRetry={() => void beneficiary.refetch()} />;
  }

  const inactive = isDeactivated(data);
  const name = data.alias || data.beneficiary_name;
  const busy = deactivate.isPending || reactivate.isPending || remove.isPending;

  return (
    <div className="space-y-6">
      <SectionHeader
        title={name}
        subtitle={t`Payout beneficiary.`}
        action={
          <div className="flex flex-wrap gap-2">
            {inactive ? (
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                data-testid="reactivate-beneficiary"
                onClick={() => reactivate.mutate({ id: data.id })}
              >
                <RotateCcw className="h-4 w-4" />
                <span className="ml-1.5">
                  <Trans>Reactivate</Trans>
                </span>
              </Button>
            ) : (
              <ConfirmAction
                testId="deactivate-beneficiary"
                variant="outline"
                icon={Ban}
                label={t`Deactivate`}
                title={t`Deactivate ${name}?`}
                description={t`It stops receiving money until you reactivate it.`}
                confirmLabel={t`Deactivate`}
                disabled={busy}
                onConfirm={() => deactivate.mutate({ id: data.id })}
              />
            )}
            <ConfirmAction
              testId="delete-beneficiary"
              icon={Trash2}
              label={t`Delete`}
              title={t`Delete ${name}?`}
              description={t`The beneficiary disappears from your lists. Past transactions keep their record.`}
              confirmLabel={t`Delete beneficiary`}
              disabled={busy}
              onConfirm={() => remove.mutate({ id: data.id })}
            />
          </div>
        }
      />

      <Card className="rounded-xl shadow-none">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-base font-semibold">
            <Trans>Account</Trans>
            <StatusBadge status={data.review_status ?? data.verification_status} />
            {inactive ? <StatusBadge status="INACTIVE" /> : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <KeyValueList
            items={[
              { label: t`Account holder name`, value: data.beneficiary_name },
              { label: t`Account`, value: data.masked_account_number ?? '—', mono: true },
              { label: t`Rail`, value: data.rail_code ?? data.payment_rail ?? '—', mono: true },
              { label: t`Country`, value: data.country, mono: true },
              { label: t`Currency`, value: data.currency, mono: true },
              { label: t`Provider`, value: data.provider_code ?? '—' },
              { label: t`Holder`, value: humanizeCode(data.holder_type) },
              { label: t`Bank`, value: data.bank_name ?? '—' },
              ...(data.review_reason
                ? [{ label: t`Review reason`, value: data.review_reason }]
                : []),
              { label: t`Created`, value: formatDateTime(data.created_at) },
              { label: t`ID`, value: data.id, mono: true },
            ]}
          />
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            <Trans>Details you can change</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BeneficiaryEditForm
            key={data.updated_at ?? data.id}
            initial={editValuesOf(data)}
            pending={update.isPending}
            onSubmit={(values) =>
              update.mutate({ id: data.id, input: toUpdateBeneficiaryInput(values) })
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
