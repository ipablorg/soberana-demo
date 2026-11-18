/**
 * "Documentos requeridos" for a customer whose KYC is already approved (N3):
 * the KYC banner is not mounted then, but a VA provider can still ask for
 * documents or values. Shows the notice and the upload dialog while any
 * requirement is REQUESTED or REJECTED; nothing otherwise.
 */

import { useState } from 'react';

import { useBridgeKYC } from '@/modules/suite-user/features/account';
import { useCustomerProviderRequirements } from '@/shared/hooks/use-provider-requirements';
import { requirementsAwaitingCustomer } from '@/shared/lib/provider-requirements';

import { ProviderRequirementsDialog } from './provider-requirements-dialog';
import { ProviderRequirementsNotice } from './provider-requirements-notice';

export function CustomerProviderRequirementsBanner() {
  const { customerId } = useBridgeKYC();
  const { data } = useCustomerProviderRequirements(customerId);
  const [isOpen, setIsOpen] = useState(false);
  const awaiting = requirementsAwaitingCustomer(data?.customers_providerRequirements ?? []);

  if (!customerId || awaiting.length === 0) return null;

  return (
    <>
      <ProviderRequirementsNotice requirements={awaiting} onOpen={() => setIsOpen(true)} />
      <ProviderRequirementsDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        customerId={customerId}
        requirements={awaiting}
      />
    </>
  );
}
