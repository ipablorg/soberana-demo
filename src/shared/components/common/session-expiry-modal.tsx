/**
 * SessionExpiryModal
 *
 * Asks the user whether to keep the session going shortly before it expires,
 * instead of silently kicking them out. Purely presentational: the timing and
 * the token refresh live in `SessionExpiryProvider`.
 *
 * It is intentionally not dismissible (no close button, Escape and outside
 * clicks are ignored): the user has to pick "keep" or "sign out".
 */

import { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Loader2 } from '@/shared/components/animated-icons';
import { useLingui } from '@lingui/react/macro';
import { formatCountdown, getAnnouncementSeconds } from '@/shared/lib/session-expiry';

export interface SessionExpiryModalProps {
  open: boolean;
  /** Whole seconds left before the session expires. */
  remainingSeconds: number;
  /** A token refresh is in flight. */
  refreshing: boolean;
  /** The last refresh attempt failed. */
  refreshFailed: boolean;
  onContinue: () => void;
  onLogout: () => void;
}

const preventDismiss = (event: Event) => event.preventDefault();

export function SessionExpiryModal({
  open,
  remainingSeconds,
  refreshing,
  refreshFailed,
  onContinue,
  onLogout,
}: SessionExpiryModalProps) {
  const { t } = useLingui();
  const continueRef = useRef<HTMLButtonElement>(null);

  // Screen readers hear the remaining time twice a minute, not every second.
  const announcedTime = formatCountdown(getAnnouncementSeconds(remainingSeconds));

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md [&>button]:hidden"
        onEscapeKeyDown={preventDismiss}
        onPointerDownOutside={preventDismiss}
        onInteractOutside={preventDismiss}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          continueRef.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{t`¿Quieres seguir con la sesión?`}</DialogTitle>
          <DialogDescription>{t`Tu sesión está por vencer.`}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
          <span className="text-sm text-muted-foreground">{t`Tiempo restante`}</span>
          <span
            role="timer"
            aria-live="off"
            className="font-mono text-2xl font-semibold tabular-nums text-foreground"
          >
            {formatCountdown(remainingSeconds)}
          </span>
        </div>

        <p role="status" aria-live="polite" className="sr-only">
          {t`Quedan ${announcedTime} para que venza tu sesión.`}
        </p>

        {refreshFailed ? (
          <p role="alert" className="text-sm text-destructive">
            {t`No pudimos renovar tu sesión. Inténtalo de nuevo o cierra sesión.`}
          </p>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-2 sm:space-x-0">
          <Button variant="outline" onClick={onLogout}>
            {t`Cerrar sesión`}
          </Button>
          <Button
            ref={continueRef}
            variant="gradient"
            onClick={onContinue}
            disabled={refreshing}
            aria-busy={refreshing}
          >
            {refreshing ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {refreshFailed ? t`Reintentar` : t`Seguir con la sesión`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
