import { useLingui } from '@lingui/react/macro';

import { cn } from '@/shared/lib/utils';
import { selectIsViewingAs, useViewAsStore } from '@/shared/stores/view-as-store';

export type ViewAsReadOnlyAction = 'send' | 'add-beneficiary';

/** Whether the client app is open in "view as customer" mode (Loopay2/SOBERANA#415). */
export function useIsViewingAs(): boolean {
  return useViewAsStore(selectIsViewingAs);
}

interface ViewAsReadOnlyNoteProps {
  /** DOM id, so the disabled control can point at it with `aria-describedby`. */
  id: string;
  action: ViewAsReadOnlyAction;
  className?: string;
}

/**
 * Why a write action is disabled while an admin views the app as a customer:
 * the back refuses every write in that mode with `VIEW_AS_READ_ONLY`.
 * Renders nothing outside view-as.
 */
export function ViewAsReadOnlyNote({ id, action, className }: ViewAsReadOnlyNoteProps) {
  const { t } = useLingui();
  const isViewingAs = useIsViewingAs();

  if (!isViewingAs) return null;

  const message =
    action === 'send'
      ? t`Solo lectura: estás viendo la app como este cliente, no puedes enviar dinero.`
      : t`Solo lectura: estás viendo la app como este cliente, no puedes agregar beneficiarios.`;

  return (
    <p id={id} className={cn('text-sm text-muted-foreground', className)}>
      {message}
    </p>
  );
}
