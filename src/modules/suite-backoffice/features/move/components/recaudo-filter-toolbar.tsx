/**
 * Toolbar above the deposit table (shadcn "Data Table" pattern): the global
 * search, the Estado / Cliente / Moneda faceted filters and a reset button.
 * Every control applies on change; there is no Apply button. The provider
 * filter lives only in its column header.
 */

import { useLingui } from '@lingui/react/macro';

import { X } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';

import type {
  RecaudoFilterEdits,
  RecaudoFilterValues,
} from '../lib/recaudo-filters';
import {
  RecaudoClientFacet,
  RecaudoCurrencyFacet,
  RecaudoStatusFacet,
} from './recaudo-facets';
import { RecaudoSearchInput } from './recaudo-search-input';

interface RecaudoFilterToolbarProps {
  values: RecaudoFilterValues;
  onEdit: (changes: RecaudoFilterEdits) => void;
  onReset: () => void;
  /** Anything differs from the default view; shows the reset button. */
  canReset: boolean;
}

export function RecaudoFilterToolbar({
  values,
  onEdit,
  onReset,
  canReset,
}: RecaudoFilterToolbarProps) {
  const { t } = useLingui();

  return (
    <div
      role="search"
      aria-label={t`Filtros de depósitos`}
      className="flex flex-wrap items-center gap-2"
    >
      <RecaudoSearchInput
        value={values.search}
        onChange={(search) => onEdit({ search })}
      />
      <RecaudoStatusFacet variant="toolbar" values={values} onEdit={onEdit} />
      <RecaudoClientFacet variant="toolbar" values={values} onEdit={onEdit} />
      <RecaudoCurrencyFacet variant="toolbar" values={values} onEdit={onEdit} />
      {canReset && (
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          {t`Restablecer`}
          <X />
        </Button>
      )}
    </div>
  );
}
