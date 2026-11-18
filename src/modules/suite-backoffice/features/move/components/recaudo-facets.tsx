/**
 * The four deposit-queue facets (Estado, Cliente, Moneda, Proveedor).
 *
 * Each one binds `FacetedFilter` to the single filter state, so the toolbar
 * button and the column-header title of the same facet always show and edit the
 * same value. `variant` only decides where it is rendered.
 */

import { useMemo } from 'react';
import { useLingui } from '@lingui/react/macro';

import type { RecaudoStatusFilter } from '@/graphql/types/admin-loopay';
import { CoinIcon } from '@/shared/components/common/coin-icon';
import { QUICK_PICK_COINS } from '@/shared/lib/coin-code';

import { useClientOptions } from '../../ops-review/hooks/use-client-options';
import { useRecaudoStatusLabels } from '../hooks/use-recaudo-status-labels';
import type { FacetOption } from '../lib/facet-options';
import {
  RECAUDO_STATUSES,
  hasCustomRecaudoStatuses,
  type RecaudoFilterEdits,
  type RecaudoFilterValues,
} from '../lib/recaudo-filters';
import { FacetedFilter, type FacetedFilterProps } from './faceted-filter';

interface RecaudoFacetProps {
  variant: FacetedFilterProps['variant'];
  values: RecaudoFilterValues;
  onEdit: (changes: RecaudoFilterEdits) => void;
}

export function RecaudoStatusFacet({
  variant,
  values,
  onEdit,
}: RecaudoFacetProps) {
  const { t } = useLingui();
  const labels = useRecaudoStatusLabels();

  const options = useMemo<FacetOption[]>(
    () =>
      RECAUDO_STATUSES.map((status) => ({
        value: status,
        label: labels[status],
      })),
    [labels],
  );

  return (
    <FacetedFilter
      variant={variant}
      title={t`Estado`}
      options={options}
      selected={values.statuses}
      multiple
      active={hasCustomRecaudoStatuses(values.statuses)}
      emptyLabel={t`Todos`}
      onChange={(next) => onEdit({ statuses: next as RecaudoStatusFilter[] })}
    />
  );
}

export function RecaudoClientFacet({
  variant,
  values,
  onEdit,
}: RecaudoFacetProps) {
  const { t } = useLingui();
  const { options: clients } = useClientOptions();

  const options = useMemo<FacetOption[]>(
    () =>
      clients.map((client) => ({
        value: client.client_id,
        label: client.is_active
          ? client.client_name
          : t`${client.client_name} (inactivo)`,
      })),
    [clients, t],
  );

  return (
    <FacetedFilter
      variant={variant}
      title={t`Cliente`}
      options={options}
      selected={values.clientId ? [values.clientId] : []}
      clearable
      onChange={(next) => onEdit({ clientId: next[0] })}
    />
  );
}

interface RecaudoCurrencyFacetProps extends RecaudoFacetProps {
  /** Header text of the `column` variant when it is not the facet title. */
  label?: string;
}

export function RecaudoCurrencyFacet({
  variant,
  values,
  onEdit,
  label,
}: RecaudoCurrencyFacetProps) {
  const { t } = useLingui();

  const options = useMemo<FacetOption[]>(
    () =>
      QUICK_PICK_COINS.map((coin) => ({
        value: coin,
        label: coin,
        icon: <CoinIcon code={coin} />,
      })),
    [],
  );
  const custom = useMemo(
    () => ({
      toValue: (text: string) => text.trim().toUpperCase(),
      label: (text: string) => {
        const code = text.trim().toUpperCase();
        return t`Usar «${code}»`;
      },
    }),
    [t],
  );

  return (
    <FacetedFilter
      variant={variant}
      title={t`Moneda`}
      triggerLabel={label}
      options={options}
      selected={values.currency ? [values.currency] : []}
      custom={custom}
      clearable
      onChange={(next) => onEdit({ currency: next[0] ?? '' })}
    />
  );
}

interface RecaudoProviderFacetProps extends RecaudoFacetProps {
  suggestions: readonly string[];
}

export function RecaudoProviderFacet({
  variant,
  values,
  onEdit,
  suggestions,
}: RecaudoProviderFacetProps) {
  const { t } = useLingui();

  const options = useMemo<FacetOption[]>(
    () => suggestions.map((code) => ({ value: code, label: code })),
    [suggestions],
  );
  const custom = useMemo(
    () => ({
      toValue: (text: string) => text.trim(),
      label: (text: string) => {
        const code = text.trim();
        return t`Usar «${code}»`;
      },
    }),
    [t],
  );

  return (
    <FacetedFilter
      variant={variant}
      title={t`Proveedor`}
      options={options}
      selected={values.providerCode ? [values.providerCode] : []}
      custom={custom}
      clearable
      onChange={(next) => onEdit({ providerCode: next[0] ?? '' })}
    />
  );
}
