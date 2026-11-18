/**
 * "Iniciar verificación en el proveedor" for a provider-managed beneficiary
 * whose provider verification never started (Mesta leaves a created
 * beneficiary `unverified` until it is started explicitly). Hidden once the
 * back records `providerMetadata.verification.started` or the provider
 * already decided. Feedback comes from the dynamic island via `useOpsMutation`.
 */

import { Trans } from '@lingui/react/macro';

import { Button } from '@/shared/components/ui/button';

import { useStartProviderBeneficiaryVerification } from '../hooks/use-provider-sandbox';

interface VerifiableBeneficiary {
  id: string;
  providerCode?: string | null;
  reviewStatus?: string | null;
  providerMetadata?: unknown;
}

function verificationStarted(providerMetadata: unknown): boolean {
  if (typeof providerMetadata !== 'object' || providerMetadata === null) {
    return false;
  }
  const verification = (providerMetadata as { verification?: unknown }).verification;
  return (
    typeof verification === 'object' &&
    verification !== null &&
    (verification as { started?: unknown }).started === true
  );
}

export function canStartProviderVerification(beneficiary: VerifiableBeneficiary): boolean {
  return (
    beneficiary.providerCode === 'mesta' &&
    (beneficiary.reviewStatus ?? 'IN_REVIEW') === 'IN_REVIEW' &&
    !verificationStarted(beneficiary.providerMetadata)
  );
}

export function StartProviderVerificationButton({
  beneficiary,
}: {
  beneficiary: VerifiableBeneficiary;
}) {
  const start = useStartProviderBeneficiaryVerification();

  if (!canStartProviderVerification(beneficiary)) return null;

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={start.isPending}
      onClick={() => start.mutate({ beneficiaryId: beneficiary.id })}
    >
      <Trans>Iniciar verificación en el proveedor</Trans>
    </Button>
  );
}
