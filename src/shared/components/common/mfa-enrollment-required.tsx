/**
 * MfaEnrollmentRequired
 *
 * Blocking screen shown instead of the backoffice when the signed-in staff
 * member (or tenant admin) has no Firebase second factor enrolled. Enrollment
 * itself lives elsewhere: suite settings (`MfaSettingsSection`) for staff, the
 * tenant security page for tenant admins (`setupRoute`), so this screen routes
 * there and then lets the user re-run the check without a full reload.
 */

import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from '@/shared/components/animated-icons';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { useLingui } from '@lingui/react/macro';

const MFA_SETTINGS_ROUTE = '/suite/settings';

export interface MfaEnrollmentRequiredProps {
  /** Re-runs the enrollment check after the user configures a factor. */
  onRecheck?: () => void;
  /** Where "Configurar ahora" enrolls a factor; the suite settings by default. */
  setupRoute?: string;
}

export function MfaEnrollmentRequired({
  onRecheck,
  setupRoute = MFA_SETTINGS_ROUTE,
}: MfaEnrollmentRequiredProps) {
  const { t } = useLingui();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
      <Card className="w-full max-w-md rounded-xl border border-border bg-card">
        <CardContent className="space-y-4 p-8 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="font-medium text-foreground">{t`Verificación en dos pasos requerida`}</p>
          <p className="text-sm text-muted-foreground">
            {t`El backoffice exige un segundo factor de autenticación. Configura tu app de autenticación para continuar.`}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="gradient" onClick={() => navigate(setupRoute)}>
              {t`Configurar ahora`}
            </Button>
            {onRecheck ? (
              <Button variant="outline" onClick={onRecheck}>
                {t`Ya lo configuré`}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
