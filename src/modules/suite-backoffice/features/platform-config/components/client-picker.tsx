/**
 * Single-client picker for the per-client config tabs. Unlike the queue
 * `ClientFilterSelect` there is no "all clients" option: every assignment is
 * made for one explicit client.
 */

import { Trans, useLingui } from '@lingui/react/macro';

import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

import { useClientOptions } from '../../ops-review/hooks/use-client-options';

interface ClientPickerProps {
  id: string;
  value: string | undefined;
  onChange: (clientId: string) => void;
}

export function ClientPicker({ id, value, onChange }: ClientPickerProps) {
  const { t } = useLingui();
  const { options, isLoading } = useClientOptions();

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        <Trans>Cliente</Trans>
      </Label>
      <Select value={value ?? ''} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger id={id} className="w-72">
          <SelectValue placeholder={t`Seleccione un cliente`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.client_id} value={option.client_id}>
              {option.is_active
                ? option.client_name
                : t`${option.client_name} (inactivo)`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
