import { Trans } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/shared/components/ui/button';
import { queryClient } from '@/shared/lib/query-client';
import { selectIsViewingAs, useViewAsStore } from '@/shared/stores/view-as-store';

/** Hook for the exit action, shared by the banner and the onboarding notice. */
export function useExitViewAs(): () => void {
  const navigate = useNavigate();
  const stop = useViewAsStore((state) => state.stop);

  return () => {
    stop();
    queryClient.clear();
    navigate('/backoffice/customers');
  };
}

/**
 * Persistent banner of the "view as customer" mode (Loopay2/SOBERANA#415):
 * whose app this is, that it is read-only, and the way back.
 */
export function ViewAsBanner() {
  const isViewingAs = useViewAsStore(selectIsViewingAs);
  const customerLabel = useViewAsStore((state) => state.customerLabel);
  const exit = useExitViewAs();

  if (!isViewingAs) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-50 flex flex-wrap items-center justify-center gap-3 border-b border-border bg-muted px-4 py-2 text-sm text-foreground"
    >
      <span>
        <Trans>Viendo como {customerLabel} · solo lectura</Trans>
      </span>
      <Button size="sm" variant="outline" className="h-7" onClick={exit}>
        <Trans>Salir de la vista</Trans>
      </Button>
    </div>
  );
}
