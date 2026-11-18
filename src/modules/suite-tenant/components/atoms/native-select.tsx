import * as React from 'react';

import { cn } from '@/shared/lib/utils';

export interface NativeSelectOption {
  value: string;
  label: string;
}

export interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: readonly NativeSelectOption[];
  /** First, empty option (shown while nothing is chosen). */
  placeholder?: string;
}

/** Native `<select>` styled like the design-system input (keyboard and form friendly). */
const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, options, placeholder, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
);
NativeSelect.displayName = 'NativeSelect';

export { NativeSelect };
