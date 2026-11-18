import { Shield, AlertTriangle, CheckCircle, Clock } from '@/shared/components/animated-icons';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { StatsCard } from '@/shared/components/common/StatsCard';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { mockCases } from '@/shared/lib/mock-data';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useLingui } from '@lingui/react/macro';

export default function Compliance() {
  const { t } = useLingui();
  const openCases = mockCases.filter((c) => c.status === 'open').length;
  const reviewCases = mockCases.filter((c) => c.status === 'review').length;

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      sanctions: t`Lista de sanciones`,
      pep: t`PEP (Persona Políticamente Expuesta)`,
      velocity: t`Velocidad anómala`,
      onchain_flag: t`Flag on-chain`,
    };
    return labels[reason] || reason;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-destructive/20 text-destructive';
      case 'review':
        return 'bg-warning/20 text-warning';
      case 'closed':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title={t`Cumplimiento`}
        subtitle={t`Monitorea casos y configura reglas.`}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title={t`Casos abiertos`}
          value={openCases}
          icon={AlertTriangle}
          change={t`Requieren atención inmediata`}
          changeType="neutral"
        />
        <StatsCard
          title={t`En revisión`}
          value={reviewCases}
          icon={Clock}
          change={t`Asignados a analistas`}
          changeType="neutral"
        />
        <StatsCard
          title={t`Tasa de aprobación`}
          value="98.5%"
          icon={CheckCircle}
          change={t`+0.3% vs mes anterior`}
          changeType="positive"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="tracking-tight"><span className="font-semibold text-foreground">{t`Casos.`}</span>{' '}<span className="font-normal text-muted-foreground">{t`Revisa y asigna.`}</span></CardTitle>
          <Button variant="outline" size="sm">
            {t`Configurar reglas`}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockCases.map((caso) => (
              <div
                key={caso.id}
                className="flex items-center justify-between py-4 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold">{caso.id}</span>
                      <Badge variant="outline" className={getStatusColor(caso.status)}>
                        {caso.status}
                      </Badge>
                      <Badge variant="outline">{getReasonLabel(caso.reason)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t`Creado`}: {format(new Date(caso.createdAt), "d 'de' MMMM, HH:mm", { locale: es })}
                    </p>
                    {caso.relatedOrderId && (
                      <p className="text-sm text-muted-foreground">
                        {t`Orden relacionada`}: {caso.relatedOrderId}
                      </p>
                    )}
                    {caso.assignedTo && (
                      <p className="text-sm text-primary">
                        {t`Asignado a`}: {caso.assignedTo}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    {t`Revisar`}
                  </Button>
                  {caso.status === 'open' && (
                    <Button size="sm">
                      {t`Asignar`}
                    </Button>
                  )}
                  {caso.status === 'review' && (
                    <>
                      <Button size="sm" variant="destructive">
                        {t`Escalar`}
                      </Button>
                      <Button size="sm" variant="default">
                        {t`Aprobar`}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="tracking-tight"><span className="font-semibold text-foreground">{t`Reglas.`}</span>{' '}<span className="font-normal text-muted-foreground">{t`Controles activos.`}</span></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">{t`Límite diario por cuenta`}</span>
                <Badge variant="outline" className="bg-warning/10 text-warning">
                  $50,000
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">{t`KYC obligatorio desde`}</span>
                <Badge variant="outline" className="bg-warning/10 text-warning">
                  $10,000
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">{t`Screening de wallets`}</span>
                <Badge variant="outline" className="bg-warning/10 text-warning">
                  {t`Automático`}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">{t`Bloqueo de países sancionados`}</span>
                <Badge variant="outline" className="bg-warning/10 text-warning">
                  {t`Activo`}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="tracking-tight"><span className="font-semibold text-foreground">{t`Listas.`}</span>{' '}<span className="font-normal text-muted-foreground">{t`Fuentes de verificación.`}</span></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">OFAC SDN</span>
                <span className="text-xs text-muted-foreground">{t`Actualizado hoy`}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">EU Sanctions</span>
                <span className="text-xs text-muted-foreground">{t`Actualizado hace 2h`}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">PEP Database</span>
                <span className="text-xs text-muted-foreground">{t`Actualizado hace 1d`}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">Chainalysis Risk Score</span>
                <span className="text-xs text-muted-foreground">{t`Integrado`}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
