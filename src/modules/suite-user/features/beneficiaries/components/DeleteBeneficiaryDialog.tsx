import { Trans } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Trash2, Loader2 } from '@/shared/components/animated-icons';
import { fadeInUp } from '@/shared/lib/motion';

interface DeleteBeneficiaryDialogProps {
  open: boolean;
  beneficiaryName: string | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteBeneficiaryDialog({
  open,
  beneficiaryName,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteBeneficiaryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl border border-border bg-card">
        <motion.div {...fadeInUp}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-base">
                  <Trans>
                    Delete{' '}
                    <span className="font-semibold text-foreground">
                      {beneficiaryName}
                    </span>
                    ?
                  </Trans>
                </DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  <Trans>
                    We will remove it from this beneficiary list and from the provider when connected.
                    You can add it again later.
                  </Trans>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="rounded-lg min-h-11"
              onClick={onClose}
              disabled={isDeleting}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button
              variant="destructive"
              className="rounded-lg min-h-11"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Trans>Delete beneficiary</Trans>
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
