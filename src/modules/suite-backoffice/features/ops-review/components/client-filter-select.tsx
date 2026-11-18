/**
 * Client selector shared by every ops queue toolbar.
 *
 * Defaults to "Todos los clientes" (no `clientId` filter). Active clients are
 * listed first; inactive ones stay selectable because their pending items
 * still have to be worked.
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

import { useClientOptions } from '../hooks/use-client-options';
import { ALL_CLIENTS_VALUE, toClientIdFilter } from '../lib/client-options';

interface ClientFilterSelectProps {
  id: string;
  value: string | undefined;
  onChange: (clientId: string | undefined) => void;
  className?: string;
}

export function ClientFilterSelect({
  id,
  value,
  onChange,
  className = 'w-56',
}: ClientFilterSelectProps) {
  const { t } = useLingui();
  const { options, isLoading } = useClientOptions();

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        <Trans>Cliente</Trans>
      </Label>
      <Select
        value={value ?? ALL_CLIENTS_VALUE}
        onValueChange={(next) => onChange(toClientIdFilter(next))}
        disabled={isLoading}
      >
        <SelectTrigger id={id} className={className}>
          <SelectValue placeholder={t`Todos los clientes`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_CLIENTS_VALUE}>{t`Todos los clientes`}</SelectItem>
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
