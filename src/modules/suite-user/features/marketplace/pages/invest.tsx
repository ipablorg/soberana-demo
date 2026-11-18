import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { 
  TrendingUp, 
  Shield, 
  Clock, 
  DollarSign,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight
} from '@/shared/components/animated-icons';
import { InvestmentProduct, InvestmentPosition } from '@/shared/types/investment';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trans, useLingui } from '@lingui/react/macro';
import { PageHeader } from '@/shared/components/common/PageHeader';

const mockProducts: InvestmentProduct[] = [
  {
    id: 'prod-1',
    name: 'USDC Yield',
    kind: 'stable_yield',
    risk: 'low',
    apr: 5.2,
    currency: 'USDC',
    provider: 'loopay_core',
    description: 'Rendimiento estable en USDC con liquidez diaria',
    minInvestment: 1000,
  },
  {
    id: 'prod-2',
    name: 'Treasury Token 90d',
    kind: 'treasury_token',
    risk: 'low',
    apr: 4.8,
    lockDays: 90,
    currency: 'USD',
    provider: 'partner',
    description: 'Token respaldado por bonos del tesoro de EE.UU.',
    minInvestment: 5000,
  },
  {
    id: 'prod-3',
    name: 'Money Market USD',
    kind: 'money_market',
    risk: 'low',
    apr: 4.5,
    currency: 'USD',
    provider: 'loopay_core',
    description: 'Fondo del mercado monetario con acceso inmediato',
    minInvestment: 500,
  },
  {
    id: 'prod-4',
    name: 'Depósito a plazo 180d',
    kind: 'term_deposit',
    risk: 'low',
    apr: 6.0,
    lockDays: 180,
    currency: 'USD',
    provider: 'loopay_core',
    description: 'Depósito a plazo fijo con tasa garantizada',
    minInvestment: 10000,
  },
];

const mockPositions: InvestmentPosition[] = [
  {
    id: 'pos-1',
    productId: 'prod-1',
    accountId: 'acc-usd-1',
    principal: 50000,
    accrued: 216.67,
    openedAt: '2025-01-15T10:00:00Z',
    status: 'active',
  },
  {
    id: 'pos-2',
    productId: 'prod-3',
    accountId: 'acc-usd-1',
    principal: 25000,
    accrued: 93.75,
    openedAt: '2025-02-01T10:00:00Z',
    status: 'active',
  },
];

export default function Invest() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const { t } = useLingui();

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-success/10 text-success border-success/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getKindLabel = (kind: string) => {
    switch (kind) {
      case 'stable_yield':
        return t`Yield estable`;
      case 'money_market':
        return t`Money Market`;
      case 'treasury_token':
        return t`Treasury Token`;
      case 'term_deposit':
        return t`Plazo fijo`;
      default:
        return kind;
    }
  };

  const totalInvested = mockPositions.reduce((sum, pos) => sum + pos.principal, 0);
  const totalAccrued = mockPositions.reduce((sum, pos) => sum + pos.accrued, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <PageHeader 
        title={t`Inversiones`}
        subtitle={t`Tu capital trabajando.`}
      />

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium"><Trans>Total invertido</Trans></CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums">${totalInvested.toLocaleString('es-MX')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {mockPositions.length} {t`posiciones activas`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium"><Trans>Intereses acumulados</Trans></CardTitle>
            <TrendingUp className="w-4 h-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums text-warning">
              ${totalAccrued.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground font-mono tabular-nums mt-1">
              +{((totalAccrued / totalInvested) * 100).toFixed(2)}% rendimiento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium"><Trans>APR promedio</Trans></CardTitle>
            <ArrowUpRight className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums text-primary">5.1%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t`Ponderado por capital`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products"><Trans>Productos</Trans></TabsTrigger>
          <TabsTrigger value="positions"><Trans>Mis posiciones</Trans></TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {mockProducts.map((product) => (
              <Card
                key={product.id}
                className={`cursor-pointer transition-colors duration-150 ${
                  selectedProduct === product.id
                    ? 'border-primary'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedProduct(product.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription className="mt-1">{product.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className={getRiskColor(product.risk)}>
                      {product.risk}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono tabular-nums text-warning">{product.apr}%</span>
                    <span className="text-sm text-muted-foreground">APR</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Shield className="w-4 h-4" />
                        <span><Trans>Tipo</Trans></span>
                      </div>
                      <div className="font-medium">{getKindLabel(product.kind)}</div>
                    </div>

                    {product.lockDays && (
                      <div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Clock className="w-4 h-4" />
                          <span><Trans>Plazo</Trans></span>
                        </div>
                        <div className="font-medium">{product.lockDays} días</div>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span><Trans>Mínimo</Trans></span>
                      </div>
                      <div className="font-medium font-mono tabular-nums">
                        {product.minInvestment?.toLocaleString()} {product.currency}
                      </div>
                    </div>

                    <div>
                      <div className="text-muted-foreground mb-1"><Trans>Proveedor</Trans></div>
                      <div className="font-medium">
                        {product.provider === 'loopay_core' ? 'Loopay' : 'Partner'}
                      </div>
                    </div>
                  </div>

                  <Button variant="gradient" className="w-full" size="sm">
                    <Trans>Invertir ahora</Trans>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4 mt-6">
          {mockPositions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground"><Trans>Aún no tienes posiciones</Trans></p>
                <Button variant="gradient" className="mt-4" onClick={() => document.querySelector('[value="products"]')?.dispatchEvent(new Event('click'))}>
                  <Trans>Explorar productos</Trans>
                </Button>
              </CardContent>
            </Card>
          ) : (
            mockPositions.map((position) => {
              const product = mockProducts.find(p => p.id === position.productId);
              if (!product) return null;

              const daysOpen = Math.floor(
                (Date.now() - new Date(position.openedAt).getTime()) / (1000 * 60 * 60 * 24)
              );
              const progress = product.lockDays
                ? Math.min((daysOpen / product.lockDays) * 100, 100)
                : 100;

              return (
                <Card key={position.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{product.name}</CardTitle>
                        <CardDescription>
                          {t`Abierta`}: {format(new Date(position.openedAt), "d 'de' MMMM, yyyy", { locale: es })}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-warning/20 text-warning">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        <Trans>Activa</Trans>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1"><Trans>Principal</Trans></div>
                        <div className="text-lg font-semibold font-mono tabular-nums">
                          ${position.principal.toLocaleString('es-MX')}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1"><Trans>Intereses</Trans></div>
                        <div className="text-lg font-semibold font-mono tabular-nums text-warning">
                          +${position.accrued.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1"><Trans>Total</Trans></div>
                        <div className="text-lg font-semibold font-mono tabular-nums">
                          ${(position.principal + position.accrued).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    {product.lockDays && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground"><Trans>Progreso</Trans></span>
                          <span className="font-medium">
                            {daysOpen} / {product.lockDays} {t`días`}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Trans>Ver detalles</Trans>
                      </Button>
                      {!product.lockDays || progress >= 100 ? (
                        <Button variant="gradient" size="sm" className="flex-1">
                          <Trans>Retirar fondos</Trans>
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="flex-1" disabled>
                          <Trans>Retirar (bloqueado)</Trans>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Rebalancing Rules (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle><Trans>Rebalanceo automático</Trans></CardTitle>
          <CardDescription>
            <Trans>Define umbrales para invertir o redimir automáticamente</Trans>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
            <div className="text-center space-y-1">
              <p className="text-lg font-semibold text-foreground"><Trans>Aún sin reglas.</Trans></p>
              <p className="text-sm text-muted-foreground"><Trans>Configura tu primera regla de auto-inversión.</Trans></p>
            </div>
            <Button variant="outline" size="sm">
              <Trans>Crear primera regla</Trans>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
