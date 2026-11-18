import { useState, type FormEvent } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { FormField } from '@/modules/suite-tenant/components/molecules/form-field';
import type { BeneficiaryEditValues } from '@/modules/suite-tenant/features/beneficiaries/lib/beneficiary-form';

interface BeneficiaryEditFormProps {
  initial: BeneficiaryEditValues;
  pending: boolean;
  onSubmit: (values: BeneficiaryEditValues) => void;
}

/** Alias, holder name and favorite: the only fields the API lets you change. */
export function BeneficiaryEditForm({ initial, pending, onSubmit }: BeneficiaryEditFormProps) {
  const { t } = useLingui();
  const [values, setValues] = useState<BeneficiaryEditValues>(initial);
  const nameMissing = values.beneficiary_name.trim().length === 0;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (nameMissing) return;
    onSubmit(values);
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate data-testid="beneficiary-edit-form">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          id="bf-edit-name"
          label={t`Account holder name`}
          error={nameMissing ? t`Required.` : undefined}
        >
          <Input
            id="bf-edit-name"
            value={values.beneficiary_name}
            onChange={(event) =>
              setValues((current) => ({ ...current, beneficiary_name: event.target.value }))
            }
          />
        </FormField>
        <FormField id="bf-edit-alias" label={t`Alias (optional)`}>
          <Input
            id="bf-edit-alias"
            value={values.alias}
            onChange={(event) =>
              setValues((current) => ({ ...current, alias: event.target.value }))
            }
          />
        </FormField>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label
          className="flex items-center gap-2 text-sm text-foreground"
          htmlFor="bf-edit-favorite"
        >
          <Checkbox
            id="bf-edit-favorite"
            checked={values.is_favorite}
            onCheckedChange={(checked) =>
              setValues((current) => ({ ...current, is_favorite: checked === true }))
            }
          />
          <Trans>Favorite</Trans>
        </label>
        <Button type="submit" size="sm" disabled={pending || nameMissing}>
          {pending ? <Trans>Saving…</Trans> : <Trans>Save changes</Trans>}
        </Button>
      </div>
    </form>
  );
}
