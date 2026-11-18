import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Settings, Shield, Zap, Webhook } from '@/shared/components/animated-icons';
import { PAYMENT_RAILS } from '../config/rails-catalog';
import type { PaymentRail } from '../types';

function RailRow({ rail, last }: { rail: PaymentRail; last: boolean }) {
  return (
    <>
      <div className="flex items-center justify-between py-2.5 gap-4">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-foreground">{rail.label}</p>
            <Badge variant="outline" className="font-mono text-xs px-1.5">
              {rail.currency}
            </Badge>
            {rail.recommended && (
              <Badge variant="secondary" className="text-xs px-1.5">
                <Trans>Recomendado</Trans>
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{rail.description}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-muted-foreground font-mono">{rail.fee}</span>
            <span className="text-muted-foreground/40 text-xs">·</span>
            <span className="text-xs text-muted-foreground">{rail.estimatedTime}</span>
          </div>
        </div>
        <Badge variant="success" className="text-xs shrink-0">
          <Trans>Activo</Trans>
        </Badge>
      </div>
      {!last && <Separator />}
    </>
  );
}

export function ElementsSettings() {
  const cryptoRails = PAYMENT_RAILS.filter(r => r.category === 'crypto');
  const fiatRails = PAYMENT_RAILS.filter(r => r.category === 'fiat');

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
          <Settings className="h-5 w-5 text-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            <Trans>Configuración</Trans>
          </h1>
          <p className="text-sm text-muted-foreground">
            <Trans>Soberana Elements · Entorno de producción</Trans>
          </p>
        </div>
      </div>

      {/* Environment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <Trans>Entorno y credenciales</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-foreground">
                <Trans>CDN URL</Trans>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t`Configura VITE_ELEMENTS_CDN_URL en tu entorno de producción.`}
              </p>
            </div>
            <Badge variant="outline" className="font-mono text-xs shrink-0">
              VITE_ELEMENTS_CDN_URL
            </Badge>
          </div>

          <Separator />

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-foreground">
                <Trans>SRI Hash</Trans>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t`Hash SHA-384 del bundle Elements para Subresource Integrity.`}
              </p>
            </div>
            <Badge variant="outline" className="font-mono text-xs shrink-0">
              VITE_ELEMENTS_SRI_HASH
            </Badge>
          </div>

          <Separator />

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-foreground">
                <Trans>Demo Data</Trans>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t`Activa VITE_ELEMENTS_ENABLE_DEMO_DATA=true para precargar widgets de ejemplo en desarrollo.`}
              </p>
            </div>
            <Badge variant="secondary" className="text-xs shrink-0">
              <Trans>Solo desarrollo</Trans>
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* KYC */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <Trans>Integraciones</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-foreground">
                <Trans>Soberana KYC</Trans>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                <Trans>Verificación de identidad para flujos KYC regulados.</Trans>
              </p>
            </div>
            <Badge variant="success" className="text-xs">
              <Trans>Activo</Trans>
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Crypto rails */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <Trans>Rieles crypto / Stablecoins</Trans>
            <Badge variant="secondary" className="ml-auto text-xs font-mono">
              {cryptoRails.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
          {cryptoRails.map((rail, i) => (
            <RailRow key={rail.id} rail={rail} last={i === cryptoRails.length - 1} />
          ))}
        </CardContent>
      </Card>

      {/* Fiat rails */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <Trans>Rieles fiat / Bancarios</Trans>
            <Badge variant="secondary" className="ml-auto text-xs font-mono">
              {fiatRails.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
          {fiatRails.map((rail, i) => (
            <RailRow key={rail.id} rail={rail} last={i === fiatRails.length - 1} />
          ))}
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Webhook className="h-4 w-4 text-muted-foreground" />
            <Trans>Webhooks</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/30 border border-border px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              <Trans>La configuración de endpoints webhook estará disponible próximamente.</Trans>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
