/** ACH Colombia: bank from the Superfinanciera list, account type, number, document type. */

import { useLingui } from '@lingui/react/macro';

import { COLOMBIA_BANKS } from '@/shared/constants/colombia-banks';

import { AccountTypeField, RailSelectField, RailTextField, type RailFieldsProps } from './rail-field';

export function CoAchFields({ ctx }: RailFieldsProps) {
  const { t } = useLingui();
  return (
    <>
      <RailSelectField
        name="bank_code"
        label={t`Banco`}
        ctx={ctx}
        placeholder={t`Selecciona un banco`}
        options={COLOMBIA_BANKS.map((bank) => ({ value: bank.code, label: bank.name }))}
      />
      <AccountTypeField ctx={ctx} />
      <RailTextField name="account_number" label={t`Número de cuenta`} ctx={ctx} inputMode="numeric" />
      <RailSelectField
        name="tax_id_type"
        label={t`Tipo de documento`}
        ctx={ctx}
        placeholder={t`Selecciona`}
        options={[
          { value: 'CC', label: t`Cédula de ciudadanía` },
          { value: 'CE', label: t`Cédula de extranjería` },
          { value: 'NIT', label: t`NIT` },
        ]}
      />
    </>
  );
}
