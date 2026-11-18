/** SEPA: IBAN, optional BIC. */

import { useLingui } from '@lingui/react/macro';

import { RailTextField, type RailFieldsProps } from './rail-field';

export function SepaFields({ ctx }: RailFieldsProps) {
  const { t } = useLingui();
  return (
    <>
      <RailTextField name="iban" label={t`IBAN`} ctx={ctx} placeholder="DE89 3704 0044 0532 0130 00" />
      <RailTextField name="bic" label={t`BIC / SWIFT`} ctx={ctx} optional maxLength={11} />
    </>
  );
}
