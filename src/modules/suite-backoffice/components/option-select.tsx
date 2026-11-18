/**
 * Single-value select over a fixed option list (catalog values, countries).
 * Replaces free-text inputs for data the system already knows.
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

import type { SelectOption } from '../features/platform-config/lib/catalog-options';

const EMPTY_SENTINEL = '__none__';

interface OptionSelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  placeholder: string;
  /** When set, adds a first option with this label that clears the value (optional fields). */
  emptyLabel?: string;
  disabled?: boolean;
  className?: string;
}

export function OptionSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  emptyLabel,
  disabled,
  className,
}: OptionSelectProps) {
  return (
    // Always a defined string: `undefined` would make Radix treat the select as
    // uncontrolled and warn when the first value arrives. `''` shows the placeholder.
    <Select
      value={value || (emptyLabel ? EMPTY_SENTINEL : '')}
      onValueChange={(next) => onChange(next === EMPTY_SENTINEL ? '' : next)}
      disabled={disabled}
    >
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {emptyLabel ? <SelectItem value={EMPTY_SENTINEL}>{emptyLabel}</SelectItem> : null}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
