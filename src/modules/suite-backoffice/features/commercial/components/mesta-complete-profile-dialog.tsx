/**
 * "Completar perfil y reintentar": asks only the company data Mesta reported as
 * missing, pre-filled with what is stored, then retries the onboarding.
 */

import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import type { OnboardingProfileInput } from '@/graphql/mutations/admin-commercial';
import { Loader2 } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Skeleton } from '@/shared/components/ui/skeleton';

import { describeMissingMestaFields } from '../lib/mesta-labels';
import { useClientOnboardingMetadata } from '../lib/mesta-profile-hooks';
import {
  buildMestaProfileInput,
  formFieldsFrom,
  mestaFormFromMetadata,
  missingMestaFields,
  type MestaProfileFieldKey,
  type MestaProfileForm as MestaProfileFormState,
} from '../lib/mesta-profile';
import { MestaProfileForm } from './mesta-profile-form';

interface MestaCompleteProfileDialogProps {
  clientId: string;
  /** Backend names reported missing by the failed attempt. */
  missingFields: readonly string[];
  isPending: boolean;
  onClose: () => void;
  onSubmit: (profile: OnboardingProfileInput) => void;
}

function Body({
  stored,
  fields,
  isPending,
  onClose,
  onSubmit,
}: {
  stored: MestaProfileFormState;
  fields: readonly MestaProfileFieldKey[];
  isPending: boolean;
  onClose: () => void;
  onSubmit: (profile: OnboardingProfileInput) => void;
}) {
  const [form, setForm] = useState(stored);
  // Everything Mesta asked for must be filled before retrying.
  const stillMissing = missingMestaFields(form).filter((key) => fields.includes(key));

  return (
    <>
      <MestaProfileForm value={form} onChange={setForm} idPrefix="mesta-retry" fields={fields} />
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isPending}>
          <Trans>Cancelar</Trans>
        </Button>
        <Button
          disabled={isPending || stillMissing.length > 0}
          onClick={() => onSubmit(buildMestaProfileInput(form))}
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          <Trans>Guardar y reintentar</Trans>
        </Button>
      </DialogFooter>
    </>
  );
}

export function MestaCompleteProfileDialog({
  clientId,
  missingFields,
  isPending,
  onClose,
  onSubmit,
}: MestaCompleteProfileDialogProps) {
  const { t } = useLingui();
  const { data, isLoading } = useClientOnboardingMetadata(clientId);
  const fields = formFieldsFrom(missingFields);
  const clientTaxIdMissing = missingFields.includes('taxId');

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>
            <Trans>Completar perfil y reintentar</Trans>
          </DialogTitle>
          <DialogDescription>
            {describeMissingMestaFields(missingFields, (d) => t(d))}
          </DialogDescription>
        </DialogHeader>

        {clientTaxIdMissing ? (
          <p role="alert" className="text-sm text-destructive">
            <Trans>El cliente no tiene ID fiscal: edítalo en el cliente antes de reintentar.</Trans>
          </p>
        ) : null}

        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : (
          <Body
            stored={mestaFormFromMetadata(data?.adminLoopay_getClient.metadata)}
            fields={fields}
            isPending={isPending}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
