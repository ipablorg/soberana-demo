/**
 * Faceted filter (shadcn "Data Table" pattern) for the deposit queue.
 *
 * One popover with a searchable option list, rendered from two places that
 * edit the SAME filter state: a dashed toolbar button showing the selected
 * values, and the column title itself as a text button inside a column header
 * (a dot marks an active filter). Selections apply immediately; multi facets
 * stay open, single facets close on pick. Escape closes the popover and Radix
 * returns focus to the trigger.
 */

import { useState, type ReactNode } from 'react';
import { useLingui } from '@lingui/react/macro';

import { Check, Plus } from '@/shared/components/animated-icons';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/shared/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { Separator } from '@/shared/components/ui/separator';
import { cn } from '@/shared/lib/utils';

import {
  filterFacetOptions,
  nextFacetSelection,
  withSelectedOptions,
  type FacetOption,
} from '../lib/facet-options';

/** Selections beyond this many collapse into "N seleccionados". */
const MAX_BADGES = 2;
const CLEAR_ITEM_VALUE = '__clear__';
const CUSTOM_ITEM_VALUE = '__custom__';

interface CustomValue {
  /** Normalizes free-typed text into the stored value (e.g. uppercases). */
  toValue: (text: string) => string;
  /** Label of the "use what I typed" item. */
  label: (text: string) => string;
}

export interface FacetedFilterProps {
  /** `toolbar`: dashed button with badges. `column`: the header title as a button. */
  variant: 'toolbar' | 'column';
  title: string;
  /** `column` only: visible header text when it differs from `title` (e.g. "Monto" for the Moneda filter). */
  triggerLabel?: string;
  options: readonly FacetOption[];
  selected: readonly string[];
  onChange: (next: string[]) => void;
  /** Multi facets toggle and stay open; single facets replace and close. */
  multiple?: boolean;
  /** The filter differs from the default view. */
  active?: boolean;
  /** Badge shown when active with nothing selected (e.g. "Todos"). */
  emptyLabel?: string;
  /** Lets the user pick free-typed text that is not among the options. */
  custom?: CustomValue;
  /** Adds a "Limpiar filtro" item while something is selected. */
  clearable?: boolean;
}

interface FacetedFilterListProps
  extends Pick<
    FacetedFilterProps,
    'title' | 'options' | 'selected' | 'onChange' | 'custom' | 'clearable'
  > {
  multiple: boolean;
  onClose: () => void;
}

function FacetedFilterList({
  title,
  options,
  selected,
  onChange,
  custom,
  clearable,
  multiple,
  onClose,
}: FacetedFilterListProps) {
  const { t } = useLingui();
  const [query, setQuery] = useState('');

  const listed = withSelectedOptions(options, selected);
  const visible = filterFacetOptions(listed, query);
  const customValue = custom ? custom.toValue(query) : '';
  const showCustom =
    Boolean(custom && customValue) &&
    !listed.some((option) => option.value === customValue);
  const showClear = Boolean(clearable) && selected.length > 0;

  const pick = (value: string) => {
    onChange(nextFacetSelection(selected, value, multiple));
    if (!multiple) onClose();
  };

  return (
    <Command shouldFilter={false} label={title}>
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder={t`Buscar ${title}`}
      />
      <CommandList>
        {visible.length === 0 && !showCustom && (
          <p role="status" className="py-6 text-center text-sm">
            {t`Sin resultados`}
          </p>
        )}
        <CommandGroup>
          {visible.map((option) => {
            const isSelected = selected.includes(option.value);

            return (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => pick(option.value)}
                className="gap-2"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded-sm border border-primary transition-colors duration-150',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'opacity-50 [&_svg]:invisible',
                  )}
                >
                  <Check size={12} />
                </span>
                {option.icon}
                <span className="truncate">{option.label}</span>
                {isSelected && <span className="sr-only">{t`Seleccionado`}</span>}
              </CommandItem>
            );
          })}
          {showCustom && custom && (
            <CommandItem
              value={CUSTOM_ITEM_VALUE}
              onSelect={() => pick(customValue)}
            >
              {custom.label(query)}
            </CommandItem>
          )}
        </CommandGroup>
        {showClear && (
          <>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                value={CLEAR_ITEM_VALUE}
                onSelect={() => {
                  onChange([]);
                  onClose();
                }}
                className="justify-center"
              >
                {t`Limpiar filtro`}
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  );
}

function selectedBadges(
  labels: readonly string[],
  countLabel: string,
): ReactNode {
  if (labels.length > MAX_BADGES) {
    return (
      <Badge variant="secondary" className="rounded-md px-1 font-normal">
        {countLabel}
      </Badge>
    );
  }

  return labels.map((label) => (
    <Badge
      key={label}
      variant="secondary"
      className="rounded-md px-1 font-normal"
    >
      {label}
    </Badge>
  ));
}

export function FacetedFilter({
  variant,
  title,
  triggerLabel = title,
  options,
  selected,
  onChange,
  multiple = false,
  active = selected.length > 0,
  emptyLabel,
  custom,
  clearable,
}: FacetedFilterProps) {
  const { t } = useLingui();
  const [open, setOpen] = useState(false);

  const listed = withSelectedOptions(options, selected);
  const selectedLabels = selected.map(
    (value) => listed.find((option) => option.value === value)?.label ?? value,
  );
  const badgeLabels =
    selectedLabels.length === 0 && active && emptyLabel
      ? [emptyLabel]
      : selectedLabels;
  const count = badgeLabels.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {variant === 'column' ? (
          <button
            type="button"
            data-active={active}
            aria-label={
              active
                ? t`Filtrar por ${title} (filtro activo)`
                : t`Filtrar por ${title}`
            }
            className={cn(
              // Buttons reset text-transform: inherit the header cell's casing.
              '-mx-1.5 inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-1.5 py-1 [text-transform:inherit]',
              'transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active && 'text-foreground',
            )}
          >
            {triggerLabel}
            {active && (
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full bg-primary"
              />
            )}
          </button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-active={active}
            className="border-dashed"
          >
            <Plus />
            {title}
            {badgeLabels.length > 0 && (
              <>
                <Separator orientation="vertical" className="mx-1 h-4" />
                {selectedBadges(badgeLabels, t`${count} seleccionados`)}
              </>
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <FacetedFilterList
          title={title}
          options={options}
          selected={selected}
          onChange={onChange}
          custom={custom}
          clearable={clearable}
          multiple={multiple}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}
