/**
 * Result panel shown after approving an endorsement with a provider: reports
 * the virtual-account onboarding outcome instead of a bare "Aprobado".
 */

import { Trans, useLingui } from '@lingui/react/macro';

import type { ReviewEndorsementResult } from '@/graphql/mutations/admin-loopay';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

import { onboardingDetail, onboardingTone } from '../lib/endorsement-provider';
import { providerFieldLabel } from '../lib/provider-profile-labels';
import { providerDisplayName } from '@/shared/lib/rail-provider-labels';

interface EndorsementOnboardingResultProps {
  result: ReviewEndorsementResult | null;
  onClose: () => void;
  /** Opens the "complete the missing data and retry" form; hidden when absent. */
  onCompleteData?: () => void;
}

export function EndorsementOnboardingResult({
  result,
  onClose,
  onCompleteData,
}: EndorsementOnboardingResultProps) {
  const { t } = useLingui();
  const onboarding = result?.onboarding ?? null;
  const missingFields = onboarding?.missing_fields ?? [];
  const detail = onboarding ? onboardingDetail(onboarding, (d) => t(d)) : null;
  const canComplete =
    Boolean(onCompleteData) &&
    missingFields.length > 0 &&
    (onboarding?.state === 'PROVIDER_ONBOARDING' || onboarding?.state === 'FAILED');

  const headline = (() => {
    switch (onboarding?.state) {
      case 'ACTIVE':
        return t`Cuenta creada`;
      case 'PROVIDER_ONBOARDING':
        return t`En onboarding con el proveedor`;
      case 'FAILED':
        return t`Falló el onboarding con el proveedor`;
      case 'SKIPPED':
        return t`Onboarding omitido`;
      default:
        return t`Aprobado`;
    }
  })();

  return (
    <Dialog open={onboarding !== null} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            <Trans>Resultado de la aprobación</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>
              La aprobación quedó registrada sin importar el resultado del
              proveedor.
            </Trans>
          </DialogDescription>
        </DialogHeader>

        {onboarding ? (
          <div className="space-y-3 py-2" role="status">
            <div className="flex items-center gap-2">
              <Badge variant={onboardingTone(onboarding.state)}>{headline}</Badge>
              <span className="text-xs text-muted-foreground">
                {providerDisplayName(onboarding.provider_code)}
              </span>
            </div>
            {detail ? <p className="text-sm text-muted-foreground">{detail}</p> : null}
            {missingFields.length > 0 ? (
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  <Trans>El proveedor necesita estos datos:</Trans>
                </p>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {missingFields.map((field) => (
                    <li key={field}>{providerFieldLabel(field, (d) => t(d))}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          {canComplete ? (
            <Button variant="outline" onClick={onCompleteData}>
              <Trans>Completar datos y reintentar</Trans>
            </Button>
          ) : null}
          <Button onClick={onClose}>
            <Trans>Entendido</Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
