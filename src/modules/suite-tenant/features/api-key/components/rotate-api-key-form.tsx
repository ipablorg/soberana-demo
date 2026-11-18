import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { FormField } from '@/modules/suite-tenant/components/molecules/form-field';
import {
  DEFAULT_GRACE_MINUTES,
  MAX_GRACE_MINUTES,
  validateRotation,
  type RotationFormErrors,
  type RotationFormValues,
} from '@/modules/suite-tenant/features/api-key/lib/rotation-form';

interface RotateApiKeyFormProps {
  pending: boolean;
  onRotate: (values: RotationFormValues) => void;
}

/** Grace period and optional expiry, confirmed before the key rotates. */
export function RotateApiKeyForm({ pending, onRotate }: RotateApiKeyFormProps) {
  const { t } = useLingui();
  const [values, setValues] = useState<RotationFormValues>({
    graceMinutes: String(DEFAULT_GRACE_MINUTES),
    expiresAt: '',
  });
  const [errors, setErrors] = useState<RotationFormErrors>({});
  const [confirming, setConfirming] = useState(false);

  const ask = () => {
    const found = validateRotation(values);
    setErrors(found);
    if (Object.keys(found).length === 0) setConfirming(true);
  };

  return (
    <div className="space-y-4" data-testid="rotate-form">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          id="rotate-grace"
          label={t`Grace period (minutes)`}
          hint={t`How long the current key keeps working. 0 stops it at once.`}
          error={
            errors.graceMinutes ? t`Use a whole number from 0 to ${MAX_GRACE_MINUTES}.` : undefined
          }
        >
          <Input
            id="rotate-grace"
            inputMode="numeric"
            value={values.graceMinutes}
            onChange={(event) =>
              setValues((current) => ({ ...current, graceMinutes: event.target.value }))
            }
          />
        </FormField>
        <FormField
          id="rotate-expiry"
          label={t`New key expires (optional)`}
          hint={t`Leave empty for a key that never expires.`}
          error={errors.expiresAt ? t`Pick a moment in the future.` : undefined}
        >
          <Input
            id="rotate-expiry"
            type="datetime-local"
            value={values.expiresAt}
            onChange={(event) =>
              setValues((current) => ({ ...current, expiresAt: event.target.value }))
            }
          />
        </FormField>
      </div>
      <Button onClick={ask} disabled={pending} data-testid="rotate-api-key">
        {pending ? <Trans>Rotating…</Trans> : <Trans>Rotate key</Trans>}
      </Button>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Trans>Rotate the API key?</Trans>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <Trans>
                A new key is issued and shown once. Your integration must switch to it before the
                grace period ends.
              </Trans>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Trans>Cancel</Trans>
            </AlertDialogCancel>
            <AlertDialogAction data-testid="confirm-rotate" onClick={() => onRotate(values)}>
              <Trans>Rotate</Trans>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
