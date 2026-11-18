/**
 * Setup tab, "Invite tenant admin" (epic 2026-11 S4, T4.3): LOOPAY_ADMIN and
 * OPS_COMMERCIAL create the client's tenant admin and hand over the one-time
 * password setup link. The link is kept in component state only and dropped on
 * "Done"; the backend never stores it.
 *
 * No setup step reports "tenant admin invited": no staff query exposes the
 * client's tenant admins (the marker that identifies them is not in GraphQL),
 * so the action stands on its own.
 */

import { useState, type FormEvent } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import type { InviteTenantAdminMutation } from '@/graphql/mutations/admin-loopay';
import { Check, Copy, UserPlus } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { canInviteTenantAdmin } from '@/shared/lib/staff-roles';
import { useAuthStore } from '@/shared/stores/auth-store';

import { useInviteTenantAdmin } from '../hooks/use-tenant-admin-invite';
import { normalizeInviteEmail } from '../lib/tenant-access';

type Invitation = InviteTenantAdminMutation['adminLoopay_inviteTenantAdmin'];

interface InviteTenantAdminCardProps {
  clientId: string;
}

/** Role gate; the form (and its mutation) only mounts for staff who may invite. */
export function InviteTenantAdminCard({ clientId }: InviteTenantAdminCardProps) {
  const staffRoles = useAuthStore((state) => state.user?.staff_roles);

  if (!canInviteTenantAdmin(staffRoles)) return null;

  return <InviteTenantAdminForm clientId={clientId} />;
}

function InviteTenantAdminForm({ clientId }: InviteTenantAdminCardProps) {
  const { t } = useLingui();
  const [email, setEmail] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const invite = useInviteTenantAdmin(clientId, (result) => {
    setInvitation(result.adminLoopay_inviteTenantAdmin);
    setEmail('');
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = normalizeInviteEmail(email);
    setInvalid(normalized === null);
    if (normalized === null) return;
    setInvitation(null);
    invite.mutate({ clientId, input: { email: normalized } });
  };

  return (
    <section
      className="space-y-4 rounded-xl border border-border p-4"
      data-testid="invite-tenant-admin"
    >
      <header className="space-y-1">
        <h3 className="text-base">
          <span className="font-semibold text-foreground">
            <Trans>Tenant admin.</Trans>
          </span>{' '}
          <span className="font-normal text-muted-foreground">
            {t`The person who runs this client's own backoffice.`}
          </span>
        </h3>
      </header>

      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={handleSubmit}
        noValidate
        data-testid="invite-tenant-admin-form"
      >
        <div className="flex-1 space-y-1">
          <Label htmlFor="tenant-admin-email">
            <Trans>Email</Trans>
          </Label>
          <Input
            id="tenant-admin-email"
            type="email"
            autoComplete="off"
            value={email}
            placeholder={t`admin@client.com`}
            aria-invalid={invalid}
            aria-describedby={invalid ? 'tenant-admin-email-error' : undefined}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <Button type="submit" disabled={invite.isPending}>
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          <Trans>Invite tenant admin</Trans>
        </Button>
      </form>
      {invalid ? (
        <p id="tenant-admin-email-error" className="text-sm text-destructive">
          <Trans>Enter a valid email.</Trans>
        </p>
      ) : null}

      {invitation ? (
        <InvitationResult invitation={invitation} onDone={() => setInvitation(null)} />
      ) : null}
    </section>
  );
}

function InvitationResult({ invitation, onDone }: { invitation: Invitation; onDone: () => void }) {
  const invitee = invitation.member.email;
  const link = invitation.password_setup_link;

  return (
    <div
      role="status"
      className="space-y-2 rounded-xl bg-muted/30 p-4"
      data-testid="tenant-admin-invitation"
    >
      {link ? (
        <>
          <p className="text-sm font-medium text-foreground">
            <Trans>Send this setup link to {invitee}. It is shown only once: copy it now.</Trans>
          </p>
          <p
            className="break-all font-mono text-xs text-muted-foreground"
            data-testid="tenant-admin-setup-link"
          >
            {link}
          </p>
          <CopyLinkButton value={link} />
        </>
      ) : (
        <p className="text-sm text-foreground">
          <Trans>{invitee} already has a password and can sign in now.</Trans>
        </p>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={onDone}
        data-testid="dismiss-tenant-admin-invitation"
      >
        <Trans>Done</Trans>
      </Button>
    </div>
  );
}

function CopyLinkButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={() => void copy()}
      data-testid="copy-tenant-admin-link"
    >
      {copied ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Copy className="h-4 w-4" aria-hidden="true" />
      )}
      {copied ? <Trans>Copied</Trans> : <Trans>Copy link</Trans>}
    </Button>
  );
}
