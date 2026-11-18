/**
 * ReauthModal
 *
 * Asks the user to confirm their identity again when the backend rejects an
 * operation with `REAUTH_REQUIRED`. The project signs in with email/password,
 * so re-authentication uses `reauthenticateWithCredential`; when the account
 * has a second factor Firebase raises `auth/multi-factor-auth-required` and
 * the modal switches to its TOTP step.
 *
 * On success the ID token is force-refreshed and pushed into the GraphQL
 * client so the retried call carries a fresh `auth_time`.
 */

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Loader2 } from '@/shared/components/animated-icons';
import { useLingui } from '@lingui/react/macro';
import { setAuthToken } from '@/shared/lib/graphql-client';
import { mapError } from '@/shared/lib/error-mapper';
import type { ReauthChallenge } from '@/shared/lib/reauth';

export interface ReauthModalProps {
  open: boolean;
  challenge: ReauthChallenge | null;
  /** Called with `true` once re-authentication succeeded, `false` on cancel. */
  onResolve: (reauthenticated: boolean) => void;
}

type Step = 'password' | 'totp';

export function ReauthModal({ open, challenge, onResolve }: ReauthModalProps) {
  const { t } = useLingui();
  const [step, setStep] = useState<Step>('password');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resolver, setResolver] = useState<any>(null);

  useEffect(() => {
    if (!open) {
      setStep('password');
      setPassword('');
      setCode('');
      setPending(false);
      setError(null);
      setResolver(null);
    }
  }, [open]);

  async function finish() {
    const { getAuth } = await import('@/shared/lib/loopayx/firebase-client');
    const auth = await getAuth();
    const user = auth.currentUser;
    if (user) {
      setAuthToken(await user.getIdToken(true));
    }
    onResolve(true);
  }

  async function handlePasswordSubmit() {
    setPending(true);
    setError(null);
    try {
      const { getAuth } = await import('@/shared/lib/loopayx/firebase-client');
      const { EmailAuthProvider, reauthenticateWithCredential } = await import('firebase/auth');
      const auth = await getAuth();
      const user = auth.currentUser;

      if (!user?.email) {
        setError(t`No hay una sesión activa. Vuelve a iniciar sesión.`);
        return;
      }

      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      await finish();
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((err as any)?.code === 'auth/multi-factor-auth-required') {
        try {
          const { getAuth } = await import('@/shared/lib/loopayx/firebase-client');
          const { getMultiFactorResolver } = await import('firebase/auth');
          const auth = await getAuth();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setResolver(getMultiFactorResolver(auth, err as any));
          setStep('totp');
          return;
        } catch {
          setError(t`No pudimos iniciar la verificación en dos pasos.`);
          return;
        }
      }
      setError(mapError(err).message);
    } finally {
      setPending(false);
    }
  }

  async function handleTotpSubmit() {
    setPending(true);
    setError(null);
    try {
      const { TotpMultiFactorGenerator } = await import('firebase/auth');
      const hint = resolver?.hints?.[0];
      if (!hint) {
        setError(t`No encontramos un segundo factor asociado a tu cuenta.`);
        return;
      }
      const assertion = TotpMultiFactorGenerator.assertionForSignIn(hint.uid, code);
      await resolver.resolveSignIn(assertion);
      await finish();
    } catch (err) {
      setError(mapError(err).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onResolve(false); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t`Confirma tu identidad`}</DialogTitle>
          <DialogDescription>
            {step === 'password'
              ? t`Por seguridad necesitamos verificar tu identidad antes de continuar.`
              : t`Ingresa el código de tu app de autenticación.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'password' ? (
            <div className="space-y-2">
              <Label htmlFor="reauth-password">{t`Contraseña`}</Label>
              <Input
                id="reauth-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={pending}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="reauth-code">{t`Código de verificación`}</Label>
              <Input
                id="reauth-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={pending}
              />
            </div>
          )}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          {challenge?.maxAgeSeconds ? (
            <p className="text-xs text-muted-foreground">
              {t`Esta operación requiere una sesión verificada en los últimos ${Math.round(
                challenge.maxAgeSeconds / 60,
              )} minutos.`}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => onResolve(false)} disabled={pending}>
              {t`Cancelar`}
            </Button>
            <Button
              variant="gradient"
              onClick={step === 'password' ? handlePasswordSubmit : handleTotpSubmit}
              disabled={pending || (step === 'password' ? !password : !code)}
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : t`Confirmar`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
