/**
 * Shows the one-time password setup link right after a staff user is created.
 * The link is never persisted: closing the dialog discards it.
 */

import { Trans } from '@lingui/react/macro';

import { Copy } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

import { withSetupLinkLanguage } from '../lib/setup-link-language';

/** Language of the Firebase action page the new staff member lands on. */
const SETUP_LINK_LANGUAGE = 'es';

interface PasswordSetupLinkNoticeProps {
  email: string;
  /** Null when the Firebase user already existed (no link was generated). */
  link: string | null;
  onClose: () => void;
}

export function PasswordSetupLinkNotice({
  email,
  link: rawLink,
  onClose,
}: PasswordSetupLinkNoticeProps) {
  const link = rawLink ? withSetupLinkLanguage(rawLink, SETUP_LINK_LANGUAGE) : null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            <Trans>Usuario staff creado</Trans>
          </DialogTitle>
          <DialogDescription>
            {link ? (
              <Trans>
                Envíe este enlace a {email} para que defina su contraseña. Este enlace no se volverá
                a mostrar.
              </Trans>
            ) : (
              <Trans>
                {email} ya tenía acceso con su cuenta existente: no se generó enlace. Puede ingresar
                con su contraseña actual.
              </Trans>
            )}
          </DialogDescription>
        </DialogHeader>

        {link ? (
          <div className="space-y-2">
            <p
              data-testid="password-setup-link"
              className="break-all rounded-lg border bg-muted p-3 font-mono text-xs"
            >
              {link}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                void navigator.clipboard?.writeText(link);
              }}
            >
              <Copy className="mr-2 h-3.5 w-3.5" />
              <Trans>Copiar enlace</Trans>
            </Button>
          </div>
        ) : null}

        <DialogFooter>
          <Button onClick={onClose}>
            <Trans>Listo</Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
