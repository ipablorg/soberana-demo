/**
 * "Vincular ID del proveedor" dialog — `adminLoopay_linkBeneficiaryProviderId`.
 *
 * Records the identifiers ops created by hand in the provider console for a
 * beneficiary that already exists locally.
 */

import { useEffect, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import type { AdminBeneficiaryQueueItem } from '@/graphql/types/admin-loopay';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import { OptionSelect } from '../../../components/option-select';
import { useProviderOptions } from '../../platform-config/hooks/use-catalog-options';

interface LinkBeneficiaryProviderDialogProps {
  beneficiary: AdminBeneficiaryQueueItem | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: (providerCode: string, providerBeneficiaryId: string) => void;
}

export function LinkBeneficiaryProviderDialog({
  beneficiary,
  loading,
  onClose,
  onConfirm,
}: LinkBeneficiaryProviderDialogProps) {
  const { t } = useLingui();
  const providerOptions = useProviderOptions();
  const [providerCode, setProviderCode] = useState('');
  const [providerBeneficiaryId, setProviderBeneficiaryId] = useState('');

  useEffect(() => {
    if (beneficiary) {
      setProviderCode('');
      setProviderBeneficiaryId('');
    }
  }, [beneficiary]);

  const canSubmit =
    providerCode.trim().length > 0 && providerBeneficiaryId.trim().length > 0;

  return (
    <Dialog open={beneficiary !== null} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            <Trans>Vincular ID del proveedor</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>
              Registre el beneficiario que ya fue creado manualmente en la
              consola del proveedor.
            </Trans>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="beneficiary-provider-code">
              <Trans>Código de proveedor</Trans>
            </Label>
            <OptionSelect
              id="beneficiary-provider-code"
              value={providerCode}
              onChange={setProviderCode}
              options={providerOptions}
              placeholder={t`Seleccione un proveedor`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="beneficiary-provider-id">
              <Trans>ID del beneficiario en el proveedor</Trans>
            </Label>
            <Input
              id="beneficiary-provider-id"
              value={providerBeneficiaryId}
              onChange={(event) =>
                setProviderBeneficiaryId(event.target.value)
              }
              placeholder={t`Identificador externo`}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            <Trans>Cancelar</Trans>
          </Button>
          <Button
            disabled={loading || !canSubmit}
            onClick={() => onConfirm(providerCode, providerBeneficiaryId)}
          >
            {loading ? <Trans>Un momento...</Trans> : <Trans>Vincular</Trans>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
