/**
 * "Simular aprobación / rechazo (sandbox)" controls for a provider-managed
 * beneficiary. Rendered only when the back reports a sandbox host for the
 * beneficiary's provider and the provider review is still `IN_REVIEW`.
 *
 * The call only asks the provider sandbox to produce the outcome; the status
 * changes when the provider's webhook arrives.
 */

import { useState } from 'react';
import { Trans } from '@lingui/react/macro';

import type { SandboxProviderOutcome } from '@/graphql/mutations/admin-loopay';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

import {
  useProviderSandboxAvailability,
  useSimulateProviderBeneficiary,
} from '../hooks/use-provider-sandbox';

interface SandboxBeneficiary {
  id: string;
  providerCode?: string | null;
  reviewStatus?: string | null;
}

interface ProviderSandboxActionsProps {
  beneficiary: SandboxBeneficiary;
}

export function ProviderSandboxActions({ beneficiary }: ProviderSandboxActionsProps) {
  const { data } = useProviderSandboxAvailability();
  const [outcome, setOutcome] = useState<SandboxProviderOutcome | null>(null);
  const simulate = useSimulateProviderBeneficiary(() => setOutcome(null));

  const sandbox = data?.adminLoopay_providerSandboxAvailability;
  const available =
    beneficiary.providerCode === 'mesta' &&
    sandbox?.mesta === true &&
    (beneficiary.reviewStatus ?? 'IN_REVIEW') === 'IN_REVIEW';

  if (!available) return null;

  const confirm = () => {
    if (!outcome || simulate.isPending) return;

    simulate.mutate({ beneficiaryId: beneficiary.id, outcome });
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        disabled={simulate.isPending}
        onClick={() => setOutcome('APPROVED')}
      >
        <Trans>Simular aprobación (sandbox)</Trans>
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={simulate.isPending}
        onClick={() => setOutcome('REJECTED')}
      >
        <Trans>Simular rechazo (sandbox)</Trans>
      </Button>

      <Dialog
        open={outcome !== null}
        onOpenChange={(open) => {
          if (!open) setOutcome(null);
        }}
      >
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>
              {outcome === 'REJECTED' ? (
                <Trans>Simular rechazo en el sandbox</Trans>
              ) : (
                <Trans>Simular aprobación en el sandbox</Trans>
              )}
            </DialogTitle>
            <DialogDescription>
              <Trans>
                Se le pedirá al sandbox del proveedor que produzca este resultado. El estado del
                beneficiario cambia cuando llega el webhook del proveedor.
              </Trans>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOutcome(null)}>
              <Trans>Cancelar</Trans>
            </Button>
            <Button disabled={simulate.isPending} onClick={confirm}>
              <Trans>Confirmar</Trans>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
