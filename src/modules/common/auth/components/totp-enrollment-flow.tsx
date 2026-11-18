/**
 * TotpEnrollmentFlow
 *
 * Full inline TOTP enrollment UI — help copy, QR code, manual key,
 * code input and verification — built on the shared
 * `useTotpEnrollment` hook. Both surfaces that enroll a second factor
 * (Settings → MfaSettingsSection, and the post-registration
 * invitation on the dashboard) render this one component so the
 * enrollment experience can never drift between them.
 *
 * Enrollment starts automatically on mount: this component is only
 * rendered after the user explicitly chose "set up 2FA now", so the
 * secret fetch is the expected next frame, not a surprise.
 *
 * Error discipline: failures surface inline via `mapError()`; callers
 * may additionally observe `onEnrolled` to react to completion (e.g.
 * refresh enrollment status, close the invitation).
 */

import * as React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { CheckCircle, Loader2, ShieldCheck } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useTotpEnrollment } from '@/shared/hooks/use-totp-enrollment';
import { mapError } from '@/shared/lib/error-mapper';
import { cn } from '@/shared/lib/utils';
import { TotpAuthHelp } from './totp-auth-help';
import { TotpEnrollmentPanel } from './totp-enrollment-panel';

export interface TotpEnrollmentFlowProps {
  /** Email embedded in the QR code (falls back to the Firebase email). */
  accountEmail?: string | null;
  onEnrolled?: () => void;
  className?: string;
}

const CODE_MAX_LENGTH = 6;

export const TotpEnrollmentFlow: React.FC<TotpEnrollmentFlowProps> = ({
  accountEmail,
  onEnrolled,
  className,
}) => {
  const { t } = useLingui();
  const [code, setCode] = React.useState('');

  const {
    step,
    isStarting,
    isVerifying,
    isEnrolled,
    otpauthUrl,
    manualKey,
    error,
    start,
    verify,
  } = useTotpEnrollment({
    accountEmail,
    onEnrolled,
  });

  // The user already opted in by opening this flow — fetch the secret
  // immediately so the QR is the first meaningful frame.
  React.useEffect(() => {
    void start();
    // `start` is stable per accountEmail; mounting once is the intent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = () => {
    void verify(code);
  };

  if (isEnrolled) {
    return (
      <div
        className={cn(
          'flex flex-col items-center gap-3 rounded-xl border border-success/20 bg-success/10 p-6 text-center',
          className,
        )}
      >
        <CheckCircle className="h-8 w-8 text-success" aria-hidden />
        <p className="text-sm font-medium text-foreground">
          <Trans>2FA activada correctamente</Trans>
        </p>
        <p className="text-xs text-muted-foreground">
          <Trans>
            A partir de ahora vas a necesitar el código de tu app de autenticator
            para iniciar sesión.
          </Trans>
        </p>
      </div>
    );
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      <TotpAuthHelp mode="enroll" />

      {isStarting || !otpauthUrl ? (
        <div className="space-y-3" aria-live="polite">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            <Trans>Preparando tu código QR…</Trans>
          </div>
          <Skeleton className="mx-auto h-[232px] w-[232px] rounded-lg" />
        </div>
      ) : (
        <>
          <TotpEnrollmentPanel
            otpauthUrl={otpauthUrl}
            accountEmail={accountEmail ?? ''}
            manualKey={manualKey}
          />

          <div className="space-y-1.5">
            <Label htmlFor="totp-enrollment-code">
              <Trans>Código de verificación</Trans>
            </Label>
            <div className="flex gap-2">
              <Input
                id="totp-enrollment-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={CODE_MAX_LENGTH}
                placeholder="000000"
                className="h-12 font-mono tabular-nums text-center tracking-[0.5em]"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, '').slice(0, CODE_MAX_LENGTH))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleVerify();
                }}
                disabled={isVerifying}
              />
              <Button
                variant="gradient"
                onClick={handleVerify}
                disabled={isVerifying || code.length < CODE_MAX_LENGTH}
              >
                {isVerifying ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                )}
                {isVerifying ? <Trans>Verificando…</Trans> : <Trans>Verificar</Trans>}
              </Button>
            </div>
          </div>
        </>
      )}

      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {step === 'idle'
            ? t`No se pudo iniciar la configuración de 2FA. Inténtalo de nuevo.`
            : mapError(error).message}
        </p>
      ) : null}
    </div>
  );
};
