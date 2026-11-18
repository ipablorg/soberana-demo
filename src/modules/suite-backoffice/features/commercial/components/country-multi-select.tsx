/**
 * Checkbox list to pick several countries (ISO alpha-3 values). Stored codes
 * missing from the catalog stay visible so they are never dropped silently.
 */

import { Checkbox } from '@/shared/components/ui/checkbox';
import { cn } from '@/shared/lib/utils';

import type { SelectOption } from '../../platform-config/lib/catalog-options';

interface CountryMultiSelectProps {
  legend: string;
  options: readonly SelectOption[];
  value: readonly string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export function CountryMultiSelect({
  legend,
  options,
  value,
  onChange,
  disabled,
  className,
}: CountryMultiSelectProps) {
  const known = new Set(options.map((option) => option.value));
  const all: SelectOption[] = [
    ...options,
    ...value.filter((code) => !known.has(code)).map((code) => ({ value: code, label: code })),
  ];

  const toggle = (code: string, checked: boolean) =>
    onChange(
      checked ? [...value.filter((v) => v !== code), code] : value.filter((v) => v !== code)
    );

  return (
    <fieldset className={cn('space-y-2', className)} data-testid="allowed-countries">
      <legend className="text-sm font-medium">{legend}</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {all.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={value.includes(option.value)}
              disabled={disabled}
              aria-label={option.label}
              onCheckedChange={(checked) => toggle(option.value, checked === true)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
