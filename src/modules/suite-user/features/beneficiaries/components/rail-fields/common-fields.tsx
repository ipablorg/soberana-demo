/** Fields every rail asks for: name, holder type, tax id, relationship, alias. */

import { useLingui } from '@lingui/react/macro';

import type { RailFieldName } from '../../lib/rail-fields';

import { RailSelectField, RailTextField, type RailFieldsProps } from './rail-field';

export function CommonFields({ ctx }: RailFieldsProps) {
  const { t } = useLingui();
  return (
    <>
      <RailTextField
        name="beneficiary_name"
        label={t`Nombre completo`}
        ctx={ctx}
        placeholder={t`Como aparece en la cuenta`}
      />
      <RailSelectField
        name="holder_type"
        label={t`Titular`}
        ctx={ctx}
        options={[
          { value: 'INDIVIDUAL', label: t`Persona` },
          { value: 'BUSINESS', label: t`Empresa` },
        ]}
      />
      <RailTextField name="tax_id" label={t`Documento o NIT`} ctx={ctx} />
    </>
  );
}

export function OptionalCommonFields({ ctx }: RailFieldsProps) {
  const { t } = useLingui();
  return (
    <>
      <RailSelectField
        name="relationship"
        label={t`Relación contigo`}
        ctx={ctx}
        optional
        options={[
          { value: 'SELF', label: t`Soy yo` },
          { value: 'FAMILY', label: t`Familia` },
          { value: 'FRIEND', label: t`Amigo` },
          { value: 'EMPLOYEE', label: t`Empleado` },
          { value: 'BUSINESS', label: t`Negocio` },
          { value: 'THIRD_PARTY', label: t`Tercero` },
          { value: 'OTHER', label: t`Otro` },
        ]}
      />
      <RailTextField
        name="alias"
        label={t`Alias`}
        ctx={ctx}
        optional
        placeholder={t`Ej: Cuenta principal de Juan`}
      />
    </>
  );
}

export interface AddressFieldsProps extends RailFieldsProps {
  /** Address fields the rail requires; the rest render as optional. */
  required: ReadonlySet<RailFieldName>;
}

/** Beneficiary address, shown for every rail except US ACH/Wire (its own set). */
export function AddressFields({ ctx, required }: AddressFieldsProps) {
  const { t } = useLingui();
  const optional = (name: RailFieldName) => !required.has(name);
  return (
    <>
      <RailTextField
        name="address_line_1"
        label={t`Dirección del beneficiario`}
        ctx={ctx}
        optional={optional('address_line_1')}
        placeholder={t`Calle y número`}
      />
      <div className="grid grid-cols-2 gap-3">
        <RailTextField name="city" label={t`Ciudad`} ctx={ctx} optional={optional('city')} />
        <RailTextField name="state" label={t`Estado o provincia`} ctx={ctx} optional={optional('state')} />
      </div>
      <RailTextField name="postal_code" label={t`Código postal`} ctx={ctx} optional={optional('postal_code')} />
    </>
  );
}
