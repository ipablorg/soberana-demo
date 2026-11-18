/** SPEI (Mexico): the 18-digit CLABE. */

import { useLingui } from '@lingui/react/macro';

import { RailTextField, type RailFieldsProps } from './rail-field';

export function SpeiFields({ ctx }: RailFieldsProps) {
  const { t } = useLingui();
  return (
    <RailTextField
      name="clabe"
      label={t`CLABE`}
      ctx={ctx}
      inputMode="numeric"
      maxLength={22}
      placeholder="012180001234567897"
    />
  );
}
