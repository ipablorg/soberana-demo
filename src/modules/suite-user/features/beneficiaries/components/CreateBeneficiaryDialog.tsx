/**
 * CreateBeneficiaryDialog
 *
 * Thin wrapper around `CreateBeneficiaryForm` that adds modal chrome.
 * The form itself lives in `CreateBeneficiaryForm.tsx`; this file
 * exists only to preserve the classic "click Crear → modal opens"
 * experience on the standalone `/suite/beneficiaries` page.
 *
 * The dashboard's inline SendFlow bypasses this wrapper entirely and
 * renders the form directly as a flow step — that's why the form was
 * extracted in the first place (see notes on CreateBeneficiaryForm).
 */

import { Trans, useLingui } from '@lingui/react/macro';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

import { CreateBeneficiaryForm } from './CreateBeneficiaryForm';

interface CreateBeneficiaryDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateBeneficiaryDialog({
  open,
  onClose,
}: CreateBeneficiaryDialogProps) {
  const { t } = useLingui();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl flex flex-col max-h-[78dvh] gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle className="text-lg">
            <Trans>Agrega a alguien.</Trans>
          </DialogTitle>
          <DialogDescription className="text-sm">
            <Trans>
              Dinos a quién, a dónde y con qué datos. Lo guardamos para la
              próxima.
            </Trans>
          </DialogDescription>
        </DialogHeader>

        {/* Header stays fixed; form owns internal scroll so footer buttons stay pinned. */}
        <div className="px-6 py-1">
          <div className="px-2 py-2">
            <CreateBeneficiaryForm
              className="max-h-[calc(78dvh-8.5rem)]"
              hideHeader
              hideInlineError
              onSuccess={(created) => {
                toast.success(t`Guardamos a ${created.beneficiary_name}.`);
                onClose();
              }}
              onError={(message) => {
                toast.error(message);
              }}
              onCancel={onClose}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
