import { useEffect, useState } from 'react';
import { ShieldCheck, Check } from '@/shared/components/animated-icons';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Trans, useLingui } from '@lingui/react/macro';
import { TotpEnrollmentFlow } from '@/modules/common/auth/components/totp-enrollment-flow';
import { useAuthStore } from '@/shared/stores/auth-store';
import { hasEnrolledFactors } from '@/shared/hooks/require-mfa-enrollment';

export function MfaSettingsSection() {
  const { t } = useLingui();
  const user = useAuthStore((s) => s.user);
  const [enrolled, setEnrolled] = useState<boolean | null>(null);
  const [showEnrollment, setShowEnrollment] = useState(false);

  useEffect(() => {
    let cancelled = false;
    hasEnrolledFactors().then((v) => {
      if (!cancelled) setEnrolled(v);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <Card variant="gradient-thin">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          {t`Autenticación de dos factores (2FA)`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-border/60">
          <span className="text-sm text-muted-foreground">{t`Estado`}</span>
          {enrolled === null ? (
            <span className="text-xs text-muted-foreground">{t`Verificando…`}</span>
          ) : enrolled ? (
            <Badge variant="success" className="gap-1.5">
              <Check className="h-3 w-3" />
              {t`Activa`}
            </Badge>
          ) : (
            <Badge variant="warning">{t`No configurada`}</Badge>
          )}
        </div>

        {enrolled === false && !showEnrollment && (
          <>
            <p className="text-xs text-muted-foreground">
              <Trans>
                Protege tu cuenta con una segunda capa de seguridad. Necesitás una
                app de autenticator en tu celular (Google Authenticator, Authy, etc.).
              </Trans>
            </p>
            <Button
              variant="gradient"
              onClick={() => setShowEnrollment(true)}
            >
              <Trans>Configurar 2FA</Trans>
            </Button>
          </>
        )}

        {enrolled === false && showEnrollment && (
          <TotpEnrollmentFlow
            accountEmail={user?.email}
            onEnrolled={() => setEnrolled(true)}
          />
        )}

        {enrolled === true && (
          <p className="text-xs text-muted-foreground">
            <Trans>
              Tu cuenta tiene 2FA activa. Si perdés acceso a tu app de
              autenticator, contactá a soporte para recuperar tu cuenta.
            </Trans>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
