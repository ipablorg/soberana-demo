import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { ShieldCheck } from 'lucide-react';
import { useLingui } from '@lingui/react/macro';

export default function PolicyCenter() {
  const { t } = useLingui();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title={t`Políticas`}
        subtitle={t`Reglas y aprobaciones.`}
      />

      <Tabs defaultValue="policies">
        <TabsList>
          <TabsTrigger value="policies">{t`Políticas`}</TabsTrigger>
          <TabsTrigger value="approvals">{t`Aprobaciones`}</TabsTrigger>
          <TabsTrigger value="screening">{t`Screening`}</TabsTrigger>
        </TabsList>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>{t`Políticas activas`}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between p-2 border border-border rounded-lg">
                <span>{t`Límite diario`}: <span className="font-mono tabular-nums">$50,000</span></span>
                <Badge>{t`Activo`}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 border border-border rounded-lg">
                <span>{t`Doble aprobación para`} &gt; <span className="font-mono tabular-nums">$10,000</span></span>
                <Badge>{t`Activo`}</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>{t`Solicitudes pendientes`}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <ShieldCheck className="h-12 w-12 text-muted-foreground/50" />
                <div className="text-center space-y-1">
                  <p className="text-lg font-semibold text-foreground">{t`Todo en orden.`}</p>
                  <p className="text-sm text-muted-foreground">{t`No hay solicitudes pendientes.`}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screening">
          <Card>
            <CardHeader>
              <CardTitle>{t`Resultados de screening`}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t`Todos los screenings fueron aprobados`}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
