import { Key, Webhook, FileCode, Copy, Eye, EyeOff } from '@/shared/components/animated-icons';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { toast } from 'sonner';
import { useLingui } from '@lingui/react/macro';

export default function Developers() {
  const { t } = useLingui();
  const [showSecret, setShowSecret] = useState(false);
  const apiKey = 'pk_live_51KqT8rLLUHg...';
  const secretKey = 'sk_live_51KqT8rLLUHg...';

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t`${label} copiada al portapapeles`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title={t`Desarrolladores`}
        subtitle={t`Claves, webhooks y documentación.`}
      />

      <Tabs defaultValue="keys" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="keys">{t`API Keys`}</TabsTrigger>
          <TabsTrigger value="webhooks">{t`Webhooks`}</TabsTrigger>
          <TabsTrigger value="docs">{t`Documentación`}</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="tracking-tight"><span className="font-semibold text-foreground">{t`API Keys.`}</span>{' '}<span className="font-normal text-muted-foreground">{t`Conecta tu producto a Soberana.`}</span></CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t`Public Key`}</Label>
                  <div className="flex gap-2">
                    <Input value={apiKey} readOnly className="font-mono" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(apiKey, t`Public key`)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t`Usa esta clave en tu frontend, es segura para exponer públicamente`}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t`Secret Key`}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={showSecret ? secretKey : '••••••••••••••••••••'}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(secretKey, t`Secret key`)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-destructive">
                    {t`Nunca expongas esta clave en tu frontend`}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <Key className="w-4 h-4 mr-2" />
                  {t`Crear nueva key`}
                </Button>
                <Button variant="outline">
                  {t`Rotar keys`}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="tracking-tight"><span className="font-semibold text-foreground">{t`Keys activas.`}</span>{' '}<span className="font-normal text-muted-foreground">{t`Credenciales en uso.`}</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium">{t`Production API Key`}</p>
                    <p className="text-sm text-muted-foreground">{t`Último uso: hace 2 minutos`}</p>
                  </div>
                  <Badge variant="outline" className="bg-warning/10 text-warning">
                    {t`Activa`}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium">{t`Staging API Key`}</p>
                    <p className="text-sm text-muted-foreground">{t`Último uso: hace 1 hora`}</p>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {t`Activa`}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="tracking-tight"><span className="font-semibold text-foreground">{t`Webhooks.`}</span>{' '}<span className="font-normal text-muted-foreground">{t`Notificaciones en tiempo real.`}</span></CardTitle>
              <Button>
                <Webhook className="w-4 h-4 mr-2" />
                {t`Agregar webhook`}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t`URL del endpoint`}</Label>
                <Input placeholder={t`https://tu-app.com/webhook`} />
              </div>
              <div className="space-y-2">
                <Label>{t`Eventos`}</Label>
                <div className="grid gap-2 md:grid-cols-2">
                  <label className="flex items-center gap-2">
                    <Checkbox />
                    <span className="text-sm">order.created</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox />
                    <span className="text-sm">order.settled</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox />
                    <span className="text-sm">conversion.completed</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox />
                    <span className="text-sm">compliance.case_opened</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="tracking-tight"><span className="font-semibold text-foreground">{t`Webhooks activos.`}</span>{' '}<span className="font-normal text-muted-foreground">{t`Endpoints configurados.`}</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium font-mono text-sm">
                      https://api.loopay.dev/webhooks
                    </p>
                    <Badge variant="outline" className="bg-warning/10 text-warning">
                      {t`Activo`}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {t`Eventos`}: order.*, conversion.*, compliance.*
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      {t`Editar`}
                    </Button>
                    <Button variant="outline" size="sm">
                      {t`Ver logs`}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="tracking-tight"><span className="font-semibold text-foreground">{t`Ejemplo.`}</span>{' '}<span className="font-normal text-muted-foreground">{t`Código listo para copiar.`}</span></CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t`Crear un pago (cURL)`}</Label>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
{`curl -X POST https://api.loopay.dev/v1/payouts \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 1000,
    "currency": "USD",
    "beneficiary_id": "cp_123",
    "from_account": "acc_456"
  }'`}
                </pre>
              </div>

              <div className="space-y-2">
                <Label>{t`Respuesta exitosa`}</Label>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
{`{
  "id": "ord_789",
  "status": "processing",
  "amount": 1000,
  "currency": "USD",
  "created_at": "2025-01-15T10:30:00Z",
  "eta_minutes": 30
}`}
                </pre>
              </div>

              <Button variant="outline" className="w-full">
                <FileCode className="w-4 h-4 mr-2" />
                {t`Ver documentación completa`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
