/** PIX (Brazil): the PIX key (CPF/CNPJ, email, phone or random key). */

import { useLingui } from '@lingui/react/macro';

import { RailTextField, type RailFieldsProps } from './rail-field';

export function PixFields({ ctx }: RailFieldsProps) {
  const { t } = useLingui();
  return (
    <RailTextField
      name="pix_key"
      label={t`Clave PIX`}
      ctx={ctx}
      hint={t`CPF/CNPJ, correo, teléfono o clave aleatoria.`}
    />
  );
}
