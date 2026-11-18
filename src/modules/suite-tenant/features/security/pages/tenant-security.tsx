/**
 * Second-factor enrollment of a tenant admin (`/tenant/settings/security`).
 *
 * The tenant backoffice requires an enrolled factor (`TenantRoute`), and the
 * customer settings that hold `MfaSettingsSection` sit behind the `/suite`
 * onboarding gate a tenant admin never passes, so the enrollment lives here:
 * the shared `TotpEnrollmentFlow`, then the way into the backoffice (which
 * re-checks the factor on mount).
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';

import { Check, ShieldCheck } from '@/shared/components/animated-icons';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { TENANT_ROUTES } from '@/shared/config/tenant-modes.config';
import { hasEnrolledFactors } from '@/shared/hooks/require-mfa-enrollment';
import { useAuthStore } from '@/shared/stores/auth-store';
import { TotpEnrollmentFlow } from '@/modules/common/auth/components/totp-enrollment-flow';

export default function TenantSecurity() {
  const { t } = useLingui();
  const email = useAuthStore((state) => state.user?.email);
  const [enrolled, setEnrolled] = useState<boolean | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void hasEnrolledFactors().then((value) => {
      if (!cancelled) setEnrolled(value);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md rounded-xl border border-border bg-card shadow-none">
        <CardContent className="space-y-5 p-8">
          <ShieldCheck className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h1 className="text-2xl tracking-tight">
            <span className="font-semibold text-foreground">{t`Two-step verification.`}</span>{' '}
            <span className="font-normal text-muted-foreground">
              {t`The tenant backoffice asks for it.`}
            </span>
          </h1>

          {enrolled === null ? (
            <p role="status" className="text-sm text-muted-foreground">
              {t`Checking…`}
            </p>
          ) : null}

          {enrolled === false && !enrolling ? (
            <>
              <p className="text-sm text-muted-foreground">
                <Trans>
                  Add a second layer to your sign-in with an authenticator app on your phone (Google
                  Authenticator, Authy or similar).
                </Trans>
              </p>
              <Button variant="gradient" onClick={() => setEnrolling(true)}>
                <Trans>Set up 2FA</Trans>
              </Button>
            </>
          ) : null}

          {enrolled === false && enrolling ? (
            <TotpEnrollmentFlow accountEmail={email} onEnrolled={() => setEnrolled(true)} />
          ) : null}

          {enrolled === true ? (
            <>
              <Badge variant="success" className="gap-1.5">
                <Check className="h-3 w-3" aria-hidden="true" />
                {t`Active`}
              </Badge>
              <p className="text-sm text-muted-foreground">{t`Two-step verification is on.`}</p>
              <Button asChild>
                <Link to={TENANT_ROUTES.overview}>
                  <Trans>Continue to the backoffice</Trans>
                </Link>
              </Button>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
