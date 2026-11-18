import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Copy, Zap, Shield, AlertCircle } from '@/shared/components/animated-icons';
import { useDeepLink } from '../../hooks/use-deep-link';

interface DeepLinkGeneratorProps {
  widgetId: string;
  secret?: string;
}

export function DeepLinkGenerator({ widgetId, secret }: DeepLinkGeneratorProps) {
  const {
    rawPayload,
    setRawPayload,
    encodedUrl,
    isGenerating,
    isValid,
    validationError,
    httpsRequired,
    secretTooShort,
    cryptoAvailable,
    generate,
  } = useDeepLink(widgetId, secret);

  return (
    <div className="flex flex-col gap-3">
      {/* Payload input */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-mono"><Trans>Payload JSON</Trans></span>
          {isValid === true && (
            <Badge variant="success" className="text-xs"><Trans>JSON válido</Trans></Badge>
          )}
          {isValid === false && (
            <Badge variant="destructive" className="text-xs"><Trans>JSON inválido</Trans></Badge>
          )}
        </div>
        <Textarea
          value={rawPayload}
          onChange={e => setRawPayload(e.target.value)}
          className="font-mono text-xs min-h-[80px] resize-none"
          placeholder='{ "invoice_id": "INV-001", "amount": 1500, "currency": "USD" }'
        />
        {validationError && (
          <p className="text-xs text-destructive">{validationError}</p>
        )}
      </div>

      {/* Error alerts */}
      {httpsRequired && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <Trans>HTTPS requerido. Los deep links cifrados solo funcionan en dominios HTTPS. Usa un secreto de prueba en localhost con la bandera de demo.</Trans>
          </AlertDescription>
        </Alert>
      )}
      {secretTooShort && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <Trans>El secreto debe tener al menos 16 caracteres. Usa un secreto más largo para garantizar la seguridad del cifrado AES-GCM.</Trans>
          </AlertDescription>
        </Alert>
      )}

      {/* Generate button */}
      <Button
        variant="outline"
        onClick={generate}
        disabled={isGenerating}
        className="w-full"
      >
        <Zap className="mr-2 h-4 w-4" />
        {isGenerating ? t`Generando...` : t`Generar Deep Link`}
      </Button>

      {/* Encoded URL */}
      {encodedUrl && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground"><Trans>URL generada</Trans></span>
          <div className="flex items-center gap-2">
            <Input
              value={encodedUrl}
              readOnly
              className="font-mono text-xs h-8 flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => navigator.clipboard.writeText(encodedUrl)}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Security notice */}
      <div className="flex items-start gap-2 rounded-lg bg-muted/30 px-3 py-2">
        <Shield className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          {cryptoAvailable
            ? <Trans>Payload cifrado con AES-GCM. Requiere HTTPS en producción para SRI.</Trans>
            : <Trans>Crypto API no disponible. Codificado en Base64 (solo para demo). Usa HTTPS en producción.</Trans>
          }
        </p>
      </div>
    </div>
  );
}
