import { useState, type FormEvent } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import type { TenantWebhookEventType } from '@/graphql/types/tenant';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Switch } from '@/shared/components/ui/switch';
import { FormField } from '@/modules/suite-tenant/components/molecules/form-field';
import {
  toggleEvent,
  validateWebhookForm,
  type WebhookFormErrors,
  type WebhookFormValues,
} from '@/modules/suite-tenant/features/webhooks/lib/webhook-form';

interface WebhookFormProps {
  initial: WebhookFormValues;
  /** Editing an existing webhook (shows the active switch). */
  editing: boolean;
  eventTypes: readonly TenantWebhookEventType[];
  pending: boolean;
  onSubmit: (values: WebhookFormValues) => void;
  onCancel?: () => void;
}

/** Presentational webhook form: URL, label, events (none = all) and, when editing, active. */
export function WebhookForm({
  initial,
  editing,
  eventTypes,
  pending,
  onSubmit,
  onCancel,
}: WebhookFormProps) {
  const { t } = useLingui();
  const [values, setValues] = useState<WebhookFormValues>(initial);
  const [errors, setErrors] = useState<WebhookFormErrors>({});

  const urlError =
    errors.url === 'required'
      ? t`Required.`
      : errors.url === 'url'
        ? t`Use an https:// URL.`
        : undefined;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateWebhookForm(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSubmit(values);
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate data-testid="webhook-form">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          id="wh-url"
          label={t`Endpoint URL`}
          error={urlError}
          hint={t`HTTPS in production.`}
        >
          <Input
            id="wh-url"
            type="url"
            value={values.url}
            aria-invalid={errors.url ? true : undefined}
            onChange={(event) => setValues((current) => ({ ...current, url: event.target.value }))}
          />
        </FormField>
        <FormField
          id="wh-description"
          label={t`Label (optional)`}
          error={errors.description ? t`Up to 120 characters.` : undefined}
        >
          <Input
            id="wh-description"
            value={values.description}
            onChange={(event) =>
              setValues((current) => ({ ...current, description: event.target.value }))
            }
          />
        </FormField>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">
          <Trans>Events</Trans>
        </legend>
        <p className="text-xs text-muted-foreground">
          <Trans>Leave every box empty to receive all events.</Trans>
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {eventTypes.map((type) => (
            <label key={type.event} className="flex items-start gap-2 rounded-md px-1 py-1 text-sm">
              <Checkbox
                data-event={type.event}
                checked={values.events.includes(type.event)}
                onCheckedChange={() =>
                  setValues((current) => ({
                    ...current,
                    events: toggleEvent(current.events, type.event),
                  }))
                }
                className="mt-0.5"
              />
              <span className="min-w-0">
                <span className="block font-mono text-xs text-foreground">{type.event}</span>
                <span className="block text-xs text-muted-foreground">{type.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {editing ? (
        <label className="flex items-center gap-2 text-sm text-foreground" htmlFor="wh-active">
          <Switch
            id="wh-active"
            checked={values.isActive}
            onCheckedChange={(checked) =>
              setValues((current) => ({ ...current, isActive: checked }))
            }
          />
          <Trans>Active: deliver events to this endpoint</Trans>
        </label>
      ) : null}

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            <Trans>Cancel</Trans>
          </Button>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Trans>Saving…</Trans>
          ) : editing ? (
            <Trans>Save webhook</Trans>
          ) : (
            <Trans>Create webhook</Trans>
          )}
        </Button>
      </div>
    </form>
  );
}
