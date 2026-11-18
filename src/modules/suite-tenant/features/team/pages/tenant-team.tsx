import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import type { TenantAdminInvitation, TenantTeamMember } from '@/graphql/types/tenant';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useAuth } from '@/shared/hooks/use-auth';
import { selectIsActingAs, useActAsStore } from '@/shared/stores/act-as-store';
import { CopyButton } from '@/modules/suite-tenant/components/atoms/copy-button';
import {
  QueryError,
  TenantPageSkeleton,
} from '@/modules/suite-tenant/components/molecules/query-state';
import { SectionHeader } from '@/modules/suite-tenant/components/molecules/section-header';
import { InviteAdminForm } from '@/modules/suite-tenant/features/team/components/invite-admin-form';
import { TeamList } from '@/modules/suite-tenant/features/team/components/team-list';
import {
  useInviteTenantAdmin,
  useRemoveTenantAdmin,
  useTenantTeam,
} from '@/modules/suite-tenant/features/team/hooks/use-tenant-team';
import { isSelf } from '@/modules/suite-tenant/features/team/lib/team-member';

/**
 * Container: the tenant's admins, invitations and removals.
 *
 * Under act-as (epic 2026-11 S5) the signed-in identity is a Loopay staff
 * member, never a team row: no row is "you" (the email fallback would
 * mislabel one), every real admin can be removed, and a row carrying the
 * staff user id never offers removal (the back answers 403 for it).
 */
export default function TenantTeam() {
  const { t } = useLingui();
  const { user } = useAuth();
  const isActingAs = useActAsStore(selectIsActingAs);
  const team = useTenantTeam();
  const [invitation, setInvitation] = useState<TenantAdminInvitation | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const invite = useInviteTenantAdmin((result) => setInvitation(result.tenant_inviteAdmin));
  const remove = useRemoveTenantAdmin(() => setRemovingId(null));

  if (team.isLoading) return <TenantPageSkeleton />;
  if (team.error || !team.data)
    return <QueryError error={team.error} onRetry={() => void team.refetch()} />;

  const isSelfRow = (member: TenantTeamMember) => !isActingAs && isSelf(member, user);
  const canRemove = (member: TenantTeamMember) => !isActingAs || member.id !== user?.id;

  const handleRemove = (member: TenantTeamMember) => {
    if (isSelfRow(member) || !canRemove(member)) return;
    setRemovingId(member.id);
    remove.mutate({ user_id: member.id });
  };

  return (
    <div className="space-y-6">
      <SectionHeader title={t`Team.`} subtitle={t`The people who run your backoffice.`} />

      {isActingAs ? (
        <p className="text-sm text-muted-foreground" data-testid="act-as-team-note">
          <Trans>You are acting through Loopay, so your account is not on this team.</Trans>
        </p>
      ) : null}

      <TeamList
        members={team.data.tenant_listTeam}
        isSelf={isSelfRow}
        canRemove={canRemove}
        removingId={remove.isPending ? removingId : null}
        onRemove={handleRemove}
      />

      <Card className="rounded-xl shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">
            <Trans>Invite an admin</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InviteAdminForm
            pending={invite.isPending}
            onInvite={(email) => invite.mutate({ input: { email } })}
          />

          {invitation ? (
            <div className="space-y-2 rounded-xl bg-muted/30 p-4" data-testid="invitation-result">
              {invitation.password_setup_link ? (
                <>
                  <p className="text-sm font-medium text-foreground">
                    <Trans>
                      Send this setup link to {invitation.member.email}. It is shown only once.
                    </Trans>
                  </p>
                  <p className="break-all font-mono text-xs text-muted-foreground">
                    {invitation.password_setup_link}
                  </p>
                  <CopyButton value={invitation.password_setup_link} label={t`Copy link`} />
                </>
              ) : (
                <p className="text-sm text-foreground">
                  <Trans>
                    {invitation.member.email} already has a password and can sign in now.
                  </Trans>
                </p>
              )}
              <Button variant="ghost" size="sm" onClick={() => setInvitation(null)}>
                <Trans>Done</Trans>
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
