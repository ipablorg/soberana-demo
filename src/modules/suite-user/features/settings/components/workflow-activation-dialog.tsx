import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { Eye, EyeOff, Lock, Loader2 } from '@/shared/components/animated-icons';

/** SHA-256 of the activation code — never store plaintext. */
const ACCESS_HASH = 'dc150183227ee936f9115426544e1e415a5aaed2094ab6c6f43487577f544f9b';

async function verifyCode(input: string): Promise<boolean> {
  const encoded = new TextEncoder().encode(input);
  const buffer  = await crypto.subtle.digest('SHA-256', encoded);
  const hex = Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hex === ACCESS_HASH;
}

export interface WorkflowActivationDialogProps {
  open: boolean;
  onClose(): void;
  onSuccess(): void;
}

export function WorkflowActivationDialog({
  open,
  onClose,
  onSuccess,
}: WorkflowActivationDialogProps) {
  const { t } = useLingui();
  const [code, setCode]               = useState('');
  const [showCode, setShowCode]       = useState(false);
  const [error, setError]             = useState(false);
  const [loading, setLoading]         = useState(false);

  const reset = () => {
    setCode('');
    setError(false);
    setShowCode(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(false);
    const valid = await verifyCode(code);
    setLoading(false);
    if (valid) {
      reset();
      onSuccess();
    } else {
      setError(true);
      setCode('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex justify-center mb-3">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <DialogTitle className="text-center">
            <Trans>Activar Workflow Composer</Trans>
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            <Trans>
              Función en beta. Ingresa el código de acceso para activarla.
            </Trans>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="wf-access-code">
              <Trans>Código de acceso</Trans>
            </Label>
            <div className="relative">
              <Input
                id="wf-access-code"
                type={showCode ? 'text' : 'password'}
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(false); }}
                className={error ? 'border-destructive pr-10' : 'pr-10'}
                placeholder="••••••••••••"
                autoFocus
                autoComplete="off"
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={showCode ? t`Ocultar código` : t`Mostrar código`}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150 focus-visible:outline-none"
                onClick={() => setShowCode((v) => !v)}
              >
                {showCode
                  ? <EyeOff className="h-4 w-4" />
                  : <Eye    className="h-4 w-4" />}
              </button>
            </div>
            {error && (
              <p className="text-xs text-destructive" role="alert">
                <Trans>Código incorrecto. Inténtalo de nuevo.</Trans>
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={loading}
            >
              <Trans>Cancelar</Trans>
            </Button>
            <Button
              type="submit"
              variant="gradient"
              className="flex-1"
              disabled={!code.trim() || loading}
            >
              {loading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Trans>Activar</Trans>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
