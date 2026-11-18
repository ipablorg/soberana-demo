import type { ReactNode } from 'react';

import { Label } from '@/shared/components/ui/label';

interface FormFieldProps {
  id: string;
  label: string;
  /** Validation message for this field, if any. */
  error?: string;
  hint?: string;
  children: ReactNode;
}

/** Label + control + hint/error, the building block of every tenant form. */
export function FormField({ id, label, error, hint, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive" role="alert" data-testid={`${id}-error`}>
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
