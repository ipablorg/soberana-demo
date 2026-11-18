/**
 * Rail filter shared by the compliance queues: a select over the rail
 * catalog (default "Todos los rieles") instead of a free-text rail code.
 */

import { Trans, useLingui } from '@lingui/react/macro';

import { Label } from '@/shared/components/ui/label';

import { OptionSelect } from '../../../components/option-select';
import { useRailOptions } from '../../platform-config/hooks/use-catalog-options';

interface RailFilterSelectProps {
  id: string;
  /** Selected rail code; empty means every rail. */
  value: string;
  onChange: (railCode: string) => void;
  className?: string;
}

export function RailFilterSelect({
  id,
  value,
  onChange,
  className = 'w-56',
}: RailFilterSelectProps) {
  const { t } = useLingui();
  const { rails } = useRailOptions();

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        <Trans>Riel</Trans>
      </Label>
      <OptionSelect
        id={id}
        value={value}
        onChange={onChange}
        options={rails}
        placeholder={t`Todos los rieles`}
        emptyLabel={t`Todos los rieles`}
        className={className}
      />
    </div>
  );
}
