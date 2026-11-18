/** Faster Payments (UK): sort code and 8-digit account number. */

import { useLingui } from '@lingui/react/macro';

import { RailTextField, type RailFieldsProps } from './rail-field';

export function UkFields({ ctx }: RailFieldsProps) {
  const { t } = useLingui();
  return (
    <>
      <RailTextField name="sort_code" label={t`Sort code`} ctx={ctx} placeholder="60-83-71" maxLength={8} />
      <RailTextField
        name="account_number"
        label={t`Número de cuenta`}
        ctx={ctx}
        inputMode="numeric"
        maxLength={8}
      />
    </>
  );
}
