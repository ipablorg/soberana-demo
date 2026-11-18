/** SWIFT: BIC plus IBAN or account number, optional bank. The address is the shared block. */

import { useLingui } from '@lingui/react/macro';

import { RailTextField, type RailFieldsProps } from './rail-field';

export function SwiftFields({ ctx }: RailFieldsProps) {
  const { t } = useLingui();
  return (
    <>
      <RailTextField name="bic" label={t`BIC / SWIFT`} ctx={ctx} placeholder="DEUTDEFF" maxLength={11} />
      <RailTextField
        name="iban"
        label={t`IBAN`}
        ctx={ctx}
        optional
        hint={t`Si no tiene IBAN, usa el número de cuenta.`}
      />
      <RailTextField name="account_number" label={t`Número de cuenta`} ctx={ctx} optional />
      <RailTextField name="bank_name" label={t`Banco`} ctx={ctx} optional />
      <RailTextField name="bank_address" label={t`Dirección del banco`} ctx={ctx} optional />
    </>
  );
}
