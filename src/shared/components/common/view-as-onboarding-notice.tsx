import { Trans } from '@lingui/react/macro';

import { Button } from '@/shared/components/ui/button';

import { useExitViewAs } from './view-as-banner';

/**
 * What a super admin sees instead of the onboarding wizard when the customer
 * they view has not finished onboarding (Loopay2/SOBERANA#415, read-only).
 */
export function ViewAsOnboardingNotice({ kycStatus }: { kycStatus: string | null }) {
  const exit = useExitViewAs();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6 text-center">
        <h2 className="text-lg font-semibold text-foreground">
          <Trans>El cliente está en onboarding</Trans>
        </h2>
        <p className="text-sm text-muted-foreground">
          <Trans>
            Todavía no completó su verificación (estado: {kycStatus ?? '—'}). En modo solo lectura
            no se muestra el asistente de onboarding.
          </Trans>
        </p>
        <Button variant="outline" onClick={exit}>
          <Trans>Salir de la vista</Trans>
        </Button>
      </div>
    </div>
  );
}
