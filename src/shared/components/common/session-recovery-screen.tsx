/**
 * SessionRecoveryScreen
 *
 * Shown instead of the protected page when the server could not confirm a
 * restored session (Firebase / `auth_me` taking too long or failing
 * transiently). It is either a connection problem or an expired session, and we
 * cannot tell which, so the copy names both. Nothing has been signed out at this
 * point: the screen gives the user two explicit choices instead of an abrupt
 * redirect to login. A session the server definitively rejected never gets here:
 * it ends on /login with the "session expired" notice.
 *
 * Purely presentational. Timing, retry and the actual logout live in
 * `session-restore` and `ProtectedRoute`.
 */

import { Loader2, ShieldCheck } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useLingui } from '@lingui/react/macro';

export interface SessionRecoveryScreenProps {
  /** A retry is in flight: the retry button is busy and disabled. */
  retrying: boolean;
  /** "Intentar nuevamente": ask the session to recover again. */
  onRetry: () => void;
  /** "Volver a ingresar": the user gives up on this session. */
  onLogin: () => void;
}

export function SessionRecoveryScreen({ retrying, onRetry, onLogin }: SessionRecoveryScreenProps) {
  const { t } = useLingui();

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-background px-6">
      <Card className="w-full max-w-md rounded-xl border border-border bg-card">
        <CardContent className="space-y-6 p-8 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />

          <div role="status" aria-live="polite" className="space-y-2">
            <h1 className="text-lg font-semibold text-foreground">
              {t`No pudimos confirmar tu sesión`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t`Puede ser un problema de conexión o que tu sesión haya vencido. Intenta nuevamente o vuelve a ingresar.`}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="gradient"
              onClick={onRetry}
              disabled={retrying}
              aria-busy={retrying}
            >
              {retrying ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {t`Intentar nuevamente`}
            </Button>
            <Button type="button" variant="outline" onClick={onLogin}>
              {t`Volver a ingresar`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SessionRecoveryScreen;
