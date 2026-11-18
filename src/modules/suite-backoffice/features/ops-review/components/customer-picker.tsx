/**
 * Customer search picker for the UUID manual-operation forms.
 *
 * Replaces the raw-UUID text input: ops types an email fragment, the picker
 * queries `adminLoopay_listCustomers` (case-insensitive contains) and shows a
 * dropdown of matches. On select the parent gets the full customer record so
 * it can populate the UUID field and echo the name back.
 */

import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Loader2, Search } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import type { AdminCustomerSearchItem } from '@/graphql/queries/admin-loopay';
import { formatCustomerName } from '../lib/ops-formatting';
import { useCustomerSearch } from '../hooks/use-customer-search';
import { mapError } from '@/shared/lib/error-mapper';

interface CustomerPickerProps {
  id: string;
  /** Currently selected customer (null when nothing is chosen). */
  selected: AdminCustomerSearchItem | null;
  onSelect: (customer: AdminCustomerSearchItem) => void;
  onClear: () => void;
  label?: string;
}

export function CustomerPicker({
  id,
  selected,
  onSelect,
  onClear,
  label,
}: CustomerPickerProps) {
  const { t } = useLingui();
  const [term, setTerm] = useState('');

  const { data, isLoading, error } = useCustomerSearch(term);
  const results = data?.adminLoopay_listCustomers ?? [];
  const showResults = term.trim().length >= 3 && !selected;

  const handleSelect = (customer: AdminCustomerSearchItem) => {
    onSelect(customer);
    setTerm('');
  };

  const handleClear = () => {
    onClear();
    setTerm('');
  };

  if (selected) {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label ?? t`Cliente`}</Label>
        <div className="flex items-center justify-between rounded-md border bg-muted/40 p-2 text-sm">
          <div className="min-w-0 space-y-0.5">
            <p className="font-medium">
              {formatCustomerName(
                selected.firstName,
                selected.lastName,
                selected.email,
              )}
            </p>
            <p className="text-xs text-muted-foreground break-all">
              {selected.email} · {selected.id}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="shrink-0"
            onClick={handleClear}
          >
            <Trans> Cambiar</Trans>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label ?? t`Cliente`}</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={t`Buscar por correo...`}
          className="pl-9"
          autoComplete="off"
        />
        {isLoading ? (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      {showResults ? (
        <div className="max-h-56 overflow-auto rounded-md border bg-popover">
          {error ? (
            <p role="alert" className="p-3 text-sm text-destructive">
              <Trans>No se pudo buscar clientes:</Trans> {mapError(error).message}
            </p>
          ) : results.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">
              <Trans>Sin resultados. Verifique el correo o pegue el UUID.</Trans>
            </p>
          ) : (
            <ul className="divide-y">
              {results.map((customer) => (
                <li key={customer.id}>
                  <button
                    type="button"
                    className="flex w-full flex-col items-start p-2 text-left text-sm hover:bg-muted"
                    onClick={() => handleSelect(customer)}
                  >
                    <span className="font-medium">
                      {formatCustomerName(
                        customer.firstName,
                        customer.lastName,
                        customer.email,
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {customer.email}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
