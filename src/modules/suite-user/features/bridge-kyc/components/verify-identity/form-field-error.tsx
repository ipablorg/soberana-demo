import { i18n } from '@lingui/core';
import { HelpCircle } from '@/shared/components/animated-icons';
import type { FieldError } from '@/modules/suite-user/features/bridge-kyc/lib/error-mapper';

interface FormFieldErrorProps {
  errors?: FieldError[];
}

export function FormFieldError({ errors = [] }: FormFieldErrorProps) {
  if (errors.length === 0) return null;

  return (
    <div
      className="mt-1.5 flex flex-col gap-1"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {errors.map((error, index) => (
        <div
          key={`${error.messageKey}-${index}`}
          className="flex items-start gap-1.5 text-xs text-destructive"
        >
          <HelpCircle className="h-3.5 w-3 flex-shrink-0 mt-0.5" />
          <span>{i18n._({ id: error.messageKey, message: error.messageKey })}</span>
        </div>
      ))}
    </div>
  );
}
