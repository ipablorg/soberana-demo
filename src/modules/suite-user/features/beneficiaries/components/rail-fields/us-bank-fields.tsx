/** ACH and Wire (US): routing + account + type, address, optional bank address. */

import { useLingui } from '@lingui/react/macro';

import { AccountTypeField, RailTextField, type RailFieldsProps } from './rail-field';

export function UsBankFields({ ctx }: RailFieldsProps) {
  const { t } = useLingui();
  return (
    <>
      <RailTextField
        name="routing_number"
        label={t`Routing number`}
        ctx={ctx}
        inputMode="numeric"
        maxLength={9}
        placeholder="021000021"
      />
      <RailTextField name="account_number_us" label={t`Número de cuenta`} ctx={ctx} inputMode="numeric" />
      <AccountTypeField ctx={ctx} />
      <RailTextField name="address_line_1" label={t`Dirección`} ctx={ctx} placeholder={t`Calle y número`} />
      <div className="grid grid-cols-2 gap-3">
        <RailTextField name="city" label={t`Ciudad`} ctx={ctx} />
        <RailTextField name="state" label={t`Estado`} ctx={ctx} maxLength={2} placeholder="FL" />
      </div>
      <RailTextField name="postal_code" label={t`Código postal`} ctx={ctx} inputMode="numeric" />
      <RailTextField name="bank_name" label={t`Banco`} ctx={ctx} optional />
      <RailTextField
        name="bank_address"
        label={t`Dirección del banco`}
        ctx={ctx}
        optional
        hint={t`Algunos proveedores la piden para ACH.`}
      />
    </>
  );
}
