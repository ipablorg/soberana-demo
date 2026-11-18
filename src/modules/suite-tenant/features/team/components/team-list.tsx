import { Trans, useLingui } from '@lingui/react/macro';

import type { TenantTeamMember } from '@/graphql/types/tenant';
import { Trash2 } from '@/shared/components/animated-icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { memberName } from '@/modules/suite-tenant/features/team/lib/team-member';
import { formatDateTime } from '@/modules/suite-tenant/lib/tenant-format';

interface TeamListProps {
  members: readonly TenantTeamMember[];
  isSelf: (member: TenantTeamMember) => boolean;
  /** False hides the remove action on that row (e.g. the acting staff member's own id under act-as). */
  canRemove?: (member: TenantTeamMember) => boolean;
  removingId: string | null;
  onRemove: (member: TenantTeamMember) => void;
}

/** Active admins; removal asks for confirmation and is never offered on your own row. */
export function TeamList({
  members,
  isSelf,
  canRemove = () => true,
  removingId,
  onRemove,
}: TeamListProps) {
  const { t } = useLingui();

  return (
    <ul
      className="divide-y divide-border rounded-xl border border-border bg-card"
      data-testid="team-list"
    >
      {members.map((member) => {
        const self = isSelf(member);
        const name = memberName(member);

        return (
          <li
            key={member.id}
            className="flex items-center justify-between gap-4 px-4 py-3"
            data-member={member.id}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {name}
                {self ? (
                  <Badge variant="secondary" className="ml-2 rounded-md text-[10px]">
                    <Trans>You</Trans>
                  </Badge>
                ) : null}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {member.email} · <Trans>Since {formatDateTime(member.created_at)}</Trans>
              </p>
            </div>
            {canRemove(member) ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={self || removingId === member.id}
                    title={self ? t`You can't remove yourself.` : undefined}
                    aria-label={t`Remove ${name}`}
                    data-testid="remove-admin"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="ml-1.5">
                      <Trans>Remove</Trans>
                    </span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      <Trans>Remove {name}?</Trans>
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      <Trans>
                        They lose access to the tenant backoffice right away and are signed out.
                      </Trans>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      <Trans>Keep</Trans>
                    </AlertDialogCancel>
                    <AlertDialogAction
                      data-testid="confirm-remove-admin"
                      onClick={() => onRemove(member)}
                    >
                      <Trans>Remove admin</Trans>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
