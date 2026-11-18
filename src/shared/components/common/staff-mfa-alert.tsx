/**
 * StaffMfaAlert
 *
 * Standing, non-blocking alert shown at the top of the backoffice when the
 * deployment makes the second factor optional for staff
 * (`VITE_STAFF_MFA_OPTIONAL`) and the signed-in staff member has not enrolled
 * one. It is not dismissible on purpose: the account stays flagged until a
 * factor is configured in suite settings (`MfaSettingsSection`).
 */

import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { useLingui } from '@lingui/react/macro';

const MFA_SETTINGS_ROUTE = '/suite/settings';

export function StaffMfaAlert() {
  const { t } = useLingui();
  const navigate = useNavigate();

  return (
    <div
      role="alert"
      // The backoffice layout publishes the width its fixed rail + sidebar cover;
      // without it (outside the layout) the banner spans the full width.
      style={{ marginLeft: 'var(--backoffice-content-offset, 0px)' }}
      className="flex flex-col gap-3 border-b border-amber-500/40 bg-amber-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-sm text-foreground">
          {t`Tu cuenta de staff no tiene verificación en dos pasos. Configúrala ahora para proteger el backoffice.`}
        </p>
      </div>
      <Button size="sm" variant="outline" onClick={() => navigate(MFA_SETTINGS_ROUTE)}>
        {t`Configurar ahora`}
      </Button>
    </div>
  );
}
