import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Progress } from '@/shared/components/ui/progress';
import { 
  CreditCard, 
  TrendingUp, 
  Lock, 
  Zap, 
  Settings,
  Eye,
  EyeOff,
  ArrowUpRight,
  DollarSign,
  Wallet,
  Activity,
  ShieldCheck,
  Plus,
  ChevronRight,
  Sparkles
} from '@/shared/components/animated-icons';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMobile } from '@/shared/hooks/use-mobile';
import { useLingui } from '@lingui/react/macro';

const mockCardData = {
  tier: 'PRO' as 'BASIC' | 'PRO' | 'ELITE',
  cardNumber: '4532 1234 5678 9012',
  cvv: '***',
  expiry: '12/28',
  balance: 75310.42,
  creditAvailable: 25000,
  linkedVaults: [
    { id: '1', name: 'USDC Yield', balance: 50000, percentage: 60, apr: 5.2 },
    { id: '2', name: 'Money Market', balance: 25310.42, percentage: 40, apr: 4.5 }
  ],
  monthlyEarnings: {
    yieldGenerated: 310.42,
    routesOptimizerSaved: 124.50,
    rewardsEarned: 89.20
  }
};

const mockTransactions = [
  { 
    id: '1', 
    merchant: 'Amazon', 
    amount: -142.50, 
    currency: 'USD', 
    date: '2025-10-28T14:30:00Z',
    category: 'Shopping',
    optimizerSaving: 2.40,
    status: 'completed'
  },
  { 
    id: '2', 
    merchant: 'Stripe', 
    amount: -2499.00, 
    currency: 'USD', 
    date: '2025-10-27T09:15:00Z',
    category: 'Software',
    optimizerSaving: 18.50,
    status: 'completed'
  },
  { 
    id: '3', 
    merchant: 'AWS', 
    amount: -850.00, 
    currency: 'USD', 
    date: '2025-10-26T16:45:00Z',
    category: 'Cloud Services',
    optimizerSaving: 12.30,
    status: 'completed'
  }
];

export default function LoopayCardPro() {
  const isMobile = useMobile();
  const { t } = useLingui();
  const [showCVV, setShowCVV] = useState(false);
  const [showCardNumber, setShowCardNumber] = useState(false);

  const totalSpendingPower = mockCardData.balance + mockCardData.creditAvailable;
  const totalMonthlyEarnings = Object.values(mockCardData.monthlyEarnings).reduce((a, b) => a + b, 0);
  const creditUtilization = 0;
  const avgApr = mockCardData.linkedVaults.reduce((sum, v) => sum + v.apr * (v.percentage / 100), 0);

  return (
    <div className={isMobile ? "p-4 space-y-4" : "p-6 space-y-6 max-w-7xl mx-auto"}>
      {!isMobile && (
        <PageHeader 
          title={t`Loopay Card PRO`}
          subtitle={t`Gasta desde tus inversiones.`}
        />
      )}

      {/* Hero Card Display */}
      <div className="border border-border rounded-xl">
        <Card className={isMobile ? "p-4 bg-card rounded-xl" : "p-6 bg-card rounded-xl"}>
          <div className={isMobile ? "space-y-6" : "grid lg:grid-cols-2 gap-8"}>
            {/* Left: Card Visual */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <div className="aspect-[1.586/1] rounded-xl bg-foreground p-6 text-background relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-background/10 rounded-full -mr-20 -mt-20" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-background/5 rounded-full -ml-16 -mb-16" />
                  
                  <div className="relative h-full flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-8 h-8" />
                        <span className="font-bold text-lg">Loopay</span>
                      </div>
                      <Badge className="bg-background/20 text-background border-0 backdrop-blur-sm">
                        {mockCardData.tier}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs opacity-70">{t`Número de tarjeta`}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xl font-mono tracking-wider">
                          {showCardNumber ? mockCardData.cardNumber : '•••• •••• •••• 9012'}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-background hover:bg-background/20"
                          onClick={() => setShowCardNumber(!showCardNumber)}
                        >
                          {showCardNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div className="space-y-1">
                        <p className="text-xs opacity-70">{t`Válida hasta`}</p>
                        <p className="font-mono text-sm">{mockCardData.expiry}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs opacity-70">CVV</p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm">{showCVV ? '123' : mockCardData.cvv}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-background hover:bg-background/20"
                            onClick={() => setShowCVV(!showCVV)}
                          >
                            {showCVV ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex gap-1">
                          <div className="w-8 h-6 rounded bg-background/30" />
                          <div className="w-8 h-6 rounded bg-background/50" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    <Lock className="w-4 h-4 mr-2" />
                    {t`Bloquear`}
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    {t`Ajustes`}
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    {t`Nueva`}
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Right: Balance and Stats */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t`Balance disponible`}</p>
                  <h2 className="text-4xl font-bold text-foreground font-mono tabular-nums">
                    ${mockCardData.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </h2>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">{t`Crédito disponible`}</p>
                    <p className="text-sm font-medium">{creditUtilization}% {t`utilizado`}</p>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold text-success font-mono tabular-nums">
                      ${mockCardData.creditAvailable.toLocaleString('es-MX')}
                    </span>
                    <span className="text-sm text-muted-foreground font-mono tabular-nums">{t`de`} ${mockCardData.creditAvailable.toLocaleString('es-MX')}</span>
                  </div>
                  <Progress value={creditUtilization} className="h-2" />
                </div>

                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{t`Capacidad total de gasto`}</p>
                    <p className="text-2xl font-bold font-mono tabular-nums">
                      ${totalSpendingPower.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {t`Bóvedas vinculadas`} ({mockCardData.linkedVaults.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">{t`APR promedio`}: <span className="font-mono tabular-nums">{avgApr.toFixed(2)}%</span></p>
                </div>
                <div className="space-y-2">
                  {mockCardData.linkedVaults.map((vault) => (
                    <div key={vault.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-success" />
                        <div>
                          <p className="text-sm font-medium">{vault.name}</p>
                          <p className="text-xs text-muted-foreground">{vault.percentage}% {t`asignado`}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold font-mono tabular-nums">${vault.balance.toLocaleString('es-MX')}</p>
                        <p className="text-xs text-success font-mono tabular-nums">{vault.apr}% APR</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  <Plus className="w-4 h-4 mr-2" />
                  {t`Vincular otra bóveda`}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Monthly Earnings */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t`Ganado este mes`}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-success font-mono tabular-nums">+${totalMonthlyEarnings.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {t`Rendimiento generado`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums">+${mockCardData.monthlyEarnings.yieldGenerated.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{t`Desde bóvedas vinculadas`}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4" />
              {t`Optimizador de rutas`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums">+${mockCardData.monthlyEarnings.routesOptimizerSaved.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{t`Ahorro vs. tradicional`}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {t`Recompensas`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums">+${mockCardData.monthlyEarnings.rewardsEarned.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{t`1% cashback en USDC`}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">{t`Transacciones`}</TabsTrigger>
          <TabsTrigger value="credit">{t`Línea de crédito`}</TabsTrigger>
          <TabsTrigger value="settings">{t`Ajustes`}</TabsTrigger>
          <TabsTrigger value="upgrade">{t`Mejorar plan`}</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg tracking-tight"><span className="font-semibold text-foreground">{t`Transacciones.`}</span>{' '}<span className="font-normal text-muted-foreground">{t`Tu historial reciente.`}</span></h3>
            <Button variant="outline" size="sm">
              {t`Exportar`}
            </Button>
          </div>

          <div className="space-y-2">
            {mockTransactions.map((tx) => (
              <Card key={tx.id} className="transition-colors duration-150">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{tx.merchant}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{format(new Date(tx.date), "d 'de' MMM, HH:mm", { locale: es })}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">{tx.category}</Badge>
                          <span>•</span>
                          <span className="text-success flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {t`Ahorro`} <span className="font-mono tabular-nums">${tx.optimizerSaving.toFixed(2)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold font-mono tabular-nums">{tx.amount.toFixed(2)} {tx.currency}</p>
                      <Badge variant="outline" className="text-xs">
                        {tx.status === 'completed' ? t`Completado` : tx.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button variant="outline" className="w-full">
            {t`Ver todas las transacciones`}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </TabsContent>

        <TabsContent value="credit" className="space-y-4 mt-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl tracking-tight mb-2"><span className="font-semibold text-foreground">{t`Línea de crédito.`}</span>{' '}<span className="font-normal text-muted-foreground">{t`Tu poder de compra.`}</span></h3>
                <p className="text-muted-foreground">
                  {t`Usa tu saldo como garantía sin vender tus inversiones`}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">{t`Colateral disponible`}</p>
                  <p className="text-2xl font-bold font-mono tabular-nums">${mockCardData.balance.toLocaleString('es-MX')}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">{t`Crédito máximo (50% LTV)`}</p>
                  <p className="text-2xl font-bold text-success font-mono tabular-nums">${(mockCardData.balance * 0.5).toLocaleString('es-MX')}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">{t`Tasa de interés`}</p>
                  <p className="text-2xl font-bold font-mono tabular-nums">8.0% APR</p>
                </div>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  {t`Cómo funciona`}
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                  <li>{t`Tu saldo en bóvedas se usa como colateral`}</li>
                  <li>{t`Puedes pedir hasta el 50% del valor de tu colateral`}</li>
                  <li>{t`El interés se paga automáticamente con tus rendimientos`}</li>
                  <li>{t`No es un evento fiscal — no estás vendiendo tus inversiones`}</li>
                </ul>
              </div>

              <Button variant="gradient" className="w-full" size="lg">
                {t`Solicitar línea de crédito`}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t`Controles de tarjeta`}</CardTitle>
              <CardDescription>{t`Gestiona la seguridad y los límites de gasto`}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t`Configura límites de transacción, restricciones de comercio y más...`}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upgrade" className="space-y-4 mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2">
              <CardHeader>
                <Badge variant="outline" className="w-fit mb-2">BASIC</Badge>
                <CardTitle>{t`Gratis`}</CardTitle>
                <CardDescription>{t`Ideal para empezar`}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    {t`Vinculada a cuentas fiat`}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    {t`0.5% spread FX`}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    {t`0.5% cashback`}
                  </li>
                </ul>
                <Button variant="outline" className="w-full" disabled>
                  {t`Plan actual`}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardHeader>
                <Badge className="w-fit mb-2 bg-primary text-primary-foreground border-0">PRO</Badge>
                <CardTitle>$9.99/{t`mes`}</CardTitle>
                <CardDescription>{t`Para quienes exigen más`}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    {t`Vinculada a bóvedas (rendimiento)`}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    {t`0.2% spread FX`}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    {t`1% cashback en USDC`}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    {t`Línea de crédito 50% LTV`}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    {t`Optimizador de rutas`}
                  </li>
                </ul>
                <Button variant="default" className="w-full" disabled>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  {t`Activo`}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <Badge variant="outline" className="w-fit mb-2">ELITE</Badge>
                <CardTitle>$29.99/{t`mes`}</CardTitle>
                <CardDescription>{t`Control y rendimiento máximo`}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    {t`Custodia propia`}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    {t`0.1% spread FX`}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    {t`2% recompensas`}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    {t`Línea de crédito 75% LTV`}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    {t`Optimización IA prioritaria`}
                  </li>
                </ul>
                <Button variant="gradient" className="w-full">
                  {t`Mejorar a ELITE`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
