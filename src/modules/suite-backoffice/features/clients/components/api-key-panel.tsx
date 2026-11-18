/**
 * API key section of one client: stored identifier, rotation info and a
 * confirmed "Generate / Regenerate" flow that shows the new key exactly once.
 *
 * Shared by `/backoffice/clients` (tenant management) and the commercial client
 * detail so OPS_COMMERCIAL never needs the tenant list to issue a key.
 */

import { useState } from 'react';
import { Trans } from '@lingui/react/macro';

import { Copy, Key, Loader2, RefreshCw } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';

import { formatOpsDateTime, formatOpsText } from '../../ops-review/lib/ops-formatting';
import { useRegenerateClientApiKey } from '../hooks/use-clients';
import type { RegenerateClientApiKeyMutation } from '@/graphql/mutations/admin-loopay';

/** Backend default grace window for the previous key (`graceMinutes`). */
const GRACE_MINUTES = 60;

interface ApiKeyPanelProps {
  clientId: string;
  prefix: string | null | undefined;
  rotatedAt?: string | null;
  expiresAt?: string | null;
  /** Extra actions rendered next to "Regenerar" (e.g. revoke). */
  extraActions?: React.ReactNode;
  onRegenerated?: (result: RegenerateClientApiKeyMutation) => void;
}

export function ApiKeyPanel({
  clientId,
  prefix,
  rotatedAt,
  expiresAt,
  extraActions,
  onRegenerated,
}: ApiKeyPanelProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);

  const regenerate = useRegenerateClientApiKey((result) => {
    setConfirmOpen(false);
    setNewApiKey(result.adminLoopay_regenerateClientApiKey.api_key);
    onRegenerated?.(result);
  });

  // createClient always stores a prefix nobody saw; when the caller passes
  // `rotatedAt`, only a key issued by "Generar" (rotatedAt set) counts (#411).
  const hasKey = !!prefix && prefix.trim() !== '' && (rotatedAt === undefined || !!rotatedAt);

  return (
    <div className="space-y-3 pt-4 border-t border-border">
      <div className="flex items-center gap-2">
        <Key className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">
          <Trans>API Key</Trans>
        </h3>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            <Trans>Identificador</Trans>
          </Label>
          <p className="text-sm font-mono tabular-nums">{formatOpsText(prefix)}</p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            <Trans>Última rotación</Trans>
          </Label>
          <p className="text-sm">{formatOpsDateTime(rotatedAt)}</p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            <Trans>Vence</Trans>
          </Label>
          <p className="text-sm">
            {expiresAt ? formatOpsDateTime(expiresAt) : <Trans>No vence</Trans>}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={regenerate.isPending}
          onClick={() => setConfirmOpen(true)}
        >
          {regenerate.isPending ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
          )}
          {hasKey ? <Trans>Regenerar</Trans> : <Trans>Generar</Trans>}
        </Button>
        {extraActions}
      </div>
      <p className="text-xs text-muted-foreground">
        <Trans>
          Las API keys empiezan por soberana_. El identificador es un hash que sirve para ubicar la
          key; no es el inicio de la key.
        </Trans>
      </p>

      {/* Confirmation: regenerating invalidates the current key */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              <Trans>¿Regenerar la API key?</Trans>
            </DialogTitle>
            <DialogDescription>
              <Trans>
                La key actual dejará de funcionar. Seguirá activa {GRACE_MINUTES} minutos como
                periodo de gracia para que el cliente migre y luego dejará de funcionar. La nueva
                key se mostrará una sola vez.
              </Trans>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={regenerate.isPending}
            >
              <Trans>Cancelar</Trans>
            </Button>
            <Button
              variant="destructive"
              disabled={regenerate.isPending}
              onClick={() => regenerate.mutate({ clientId })}
            >
              {regenerate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Trans>Sí, regenerar</Trans>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New API key (shown once) */}
      <Dialog
        open={newApiKey !== null}
        onOpenChange={(open) => {
          if (!open) setNewApiKey(null);
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              <Trans>Nueva API key</Trans>
            </DialogTitle>
            <DialogDescription>
              <Trans>
                Copia esta key ahora. Solo se mostrará esta vez y no se podrá recuperar.
              </Trans>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-border bg-muted/50 p-3">
              <p className="text-sm font-mono break-all">{newApiKey}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (newApiKey) void navigator.clipboard?.writeText(newApiKey);
              }}
            >
              <Copy className="mr-2 h-3.5 w-3.5" />
              <Trans>Copiar</Trans>
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setNewApiKey(null)}>
              <Trans>Entendido</Trans>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
