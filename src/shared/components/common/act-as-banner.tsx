import { Trans } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/shared/components/ui/button';
import { useActAsStore } from '@/shared/stores/act-as-store';

/** Commercial client detail a staff member returns to after acting as its tenant admin. */
export function actAsReturnPath(clientId: string | null): string {
  return clientId ? `/backoffice/commercial/clients/${clientId}` : '/backoffice';
}

/**
 * Hook for the exit action: goes back to the client detail. The staff route
 * there ends act-as once the tenant tree is gone (`StaffRoute` restores the
 * staff member, drops the header and the cached tenant responses), so the
 * tenant guard never sees the staff member and nothing redirects in between.
 */
export function useExitActAs(): () => void {
  const navigate = useNavigate();
  const clientId = useActAsStore((state) => state.clientId);

  return () => navigate(actAsReturnPath(clientId));
}

interface ActAsBannerProps {
  /** Client whose tenant backoffice is open (`tenant_me.name`). */
  clientName: string;
  /** Staff member acting (`tenant_me.acting_as.staff_email`). */
  staffEmail: string | null | undefined;
}

/**
 * Persistent banner of the "act as tenant admin" mode (epic 2026-11 S5):
 * whose backoffice this is, who is acting, that it is audited, and the way back.
 */
export function ActAsBanner({ clientName, staffEmail }: ActAsBannerProps) {
  const exit = useExitActAs();
  const staff = staffEmail ?? '—';

  return (
    <div
      role="status"
      className="sticky top-0 z-50 flex flex-wrap items-center justify-center gap-3 border-b border-border bg-muted px-4 py-2 text-sm text-foreground"
      data-testid="act-as-banner"
    >
      <span>
        <Trans>
          You are acting as an admin of {clientName} as {staff}
        </Trans>
      </span>
      <span className="text-muted-foreground">
        <Trans>Every action is audited.</Trans>
      </span>
      <Button size="sm" variant="outline" className="h-7" onClick={exit} data-testid="exit-act-as">
        <Trans>Exit</Trans>
      </Button>
    </div>
  );
}
