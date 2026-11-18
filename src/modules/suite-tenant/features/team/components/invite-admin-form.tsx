import { useState, type FormEvent } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { FormField } from '@/modules/suite-tenant/components/molecules/form-field';
import { isValidEmail } from '@/modules/suite-tenant/features/team/lib/team-member';

interface InviteAdminFormProps {
  pending: boolean;
  onInvite: (email: string) => void;
}

/** Email of the next tenant admin. */
export function InviteAdminForm({ pending, onInvite }: InviteAdminFormProps) {
  const { t } = useLingui();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setError(t`Enter a valid email.`);
      return;
    }
    setError(undefined);
    onInvite(email.trim());
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      data-testid="invite-form"
    >
      <div className="flex-1">
        <FormField id="invite-email" label={t`Email`} error={error}>
          <Input
            id="invite-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </FormField>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? <Trans>Inviting…</Trans> : <Trans>Invite admin</Trans>}
      </Button>
    </form>
  );
}
