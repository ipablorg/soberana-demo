import { useState } from 'react';
import { Search, Info, Shield, Zap, DollarSign, Clock } from '@/shared/components/animated-icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Switch } from '@/shared/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import { connectors } from '@/shared/lib/suite-data';
import { useSuiteStore } from '@/shared/stores/useSuiteStore';
import { optimizeRoute, explainRoute } from '@/shared/lib/route-optimizer';
import { toast } from 'sonner';
import { Trans, useLingui } from '@lingui/react/macro';
import { PageHeader } from '@/shared/components/common/PageHeader';

export default function ConnectorsMarketplace() {
  const { isIntegrationEnabled, toggleIntegration } = useSuiteStore();
  const { t } = useLingui();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Route optimizer state
  const [amount, setAmount] = useState('1000');
  const [currency, setCurrency] = useState('USD');
  const [destination, setDestination] = useState('BR');
  const [urgency, setUrgency] = useState<'instant' | 'fast' | 'standard'>('standard');

  const filteredConnectors = connectors.filter(connector => {
    const matchesSearch = connector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connector.nameES.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connector.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || connector.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(connectors.map(c => c.category)))];

  const handleToggle = (connectorId: string) => {
    toggleIntegration(connectorId);
    toast.success(
      isIntegrationEnabled(connectorId)
        ? t`Conector deshabilitado`
        : t`Conector habilitado`
    );
  };

  const enabledConnectors = connectors.filter(c => isIntegrationEnabled(c.id));
  const routes = optimizeRoute(
    {
      amount: parseFloat(amount) || 1000,
      currency,
      destination,
      urgency,
    },
    enabledConnectors
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title={t`Conectores`}
          subtitle={t`Tus rieles de pago.`}
        />
        <Sheet>
          <SheetTrigger asChild>
            <Button className="gap-2">
              <Zap className="w-4 h-4" />
              <Trans>Optimizador de Rutas</Trans>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle><Trans>Optimizador de Rutas</Trans></SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label><Trans>Monto</Trans></Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000"
                />
              </div>
              <div className="space-y-2">
                <Label><Trans>Moneda</Trans></Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="BRL">BRL</SelectItem>
                    <SelectItem value="MXN">MXN</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label><Trans>Destino</Trans></Label>
                <Select value={destination} onValueChange={setDestination}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BR"><Trans>Brasil</Trans></SelectItem>
                    <SelectItem value="MX"><Trans>México</Trans></SelectItem>
                    <SelectItem value="US"><Trans>Estados Unidos</Trans></SelectItem>
                    <SelectItem value="EU"><Trans>Europa</Trans></SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label><Trans>Urgencia</Trans></Label>
                <Select value={urgency} onValueChange={(v: any) => setUrgency(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant"><Trans>Instantáneo (&lt;10min)</Trans></SelectItem>
                    <SelectItem value="fast"><Trans>Rápido (&lt;2h)</Trans></SelectItem>
                    <SelectItem value="standard"><Trans>Estándar (24h)</Trans></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="font-semibold"><Trans>Rutas Recomendadas</Trans></h3>
                {routes.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground text-center">
                        <Trans>Sin rutas disponibles. Habilita conectores para ver opciones.</Trans>
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  routes.map((route, idx) => (
                    <Card key={route.id} className={idx === 0 ? 'border-primary' : ''}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base"><Trans>Ruta {idx + 1}</Trans></CardTitle>
                          {idx === 0 && <Badge><Trans>Recomendada</Trans></Badge>}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">${route.estimatedCost.toFixed(2)}</span>
                          <span className="text-muted-foreground">
                            ({((route.estimatedCost / parseFloat(amount)) * 10000).toFixed(1)} bps)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {route.estimatedEtaMins < 60
                              ? `${route.estimatedEtaMins} min`
                              : `${(route.estimatedEtaMins / 60).toFixed(1)}h`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {t`Riesgo`}:{' '}
                            {route.riskScore < 0.2 ? t`Bajo` : route.riskScore < 0.5 ? t`Medio` : t`Alto`}
                          </span>
                        </div>
                        <Separator />
                        <div className="text-xs text-muted-foreground whitespace-pre-wrap">
                          {explainRoute(route)}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={t`Buscar conectores...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={String(cat)} value={String(cat)}>
                {cat === 'all' ? t`Todas las categorías` : String(cat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all"><Trans>Todos ({filteredConnectors.length})</Trans></TabsTrigger>
          <TabsTrigger value="enabled">
            <Trans>Habilitados ({filteredConnectors.filter(c => isIntegrationEnabled(c.id)).length})</Trans>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredConnectors.map((connector) => (
              <Card key={connector.id} className="hover:shadow-lg transition-shadow relative overflow-hidden">
                <CardHeader className="text-center pb-3">
                  {/* Logo Container */}
                  <div className="flex justify-center mb-4">
                    <div className="relative w-20 h-20 rounded-xl bg-muted/50 border border-border flex items-center justify-center overflow-hidden">
                      {connector.logo ? (
                        <img 
                          src={connector.logo} 
                          alt={connector.name}
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xl font-bold text-primary">
                            {connector.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <Badge 
                    variant={isIntegrationEnabled(connector.id) ? "default" : "secondary"} 
                    className="absolute top-2 right-2 text-xs"
                  >
                    {isIntegrationEnabled(connector.id) ? t`ON` : t`OFF`}
                  </Badge>
                  
                  {/* Title */}
                  <CardTitle className="text-lg font-semibold">{connector.name}</CardTitle>
                  <CardDescription className="text-xs mt-1">{connector.nameES}</CardDescription>
                  
                  {/* Category Badge */}
                  <Badge variant="outline" className="w-fit mx-auto mt-2 text-xs">
                    {connector.category}
                  </Badge>
                </CardHeader>
                
                <CardContent className="space-y-3 pt-0">
                  <p className="text-sm text-muted-foreground text-center line-clamp-2">
                    {connector.description}
                  </p>
                  
                  {/* Cost Info */}
                  {connector.costModel && (
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">
                        {connector.costModel.bps ? `${connector.costModel.bps} bps` : 
                         connector.costModel.type === 'fixed' ? `$${connector.costModel.value}` :
                         `${connector.costModel.value}%`}
                      </span>
                    </div>
                  )}
                  
                  {/* ETA Info */}
                  {connector.etaMins && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">{connector.etaMins.min}-{connector.etaMins.max} min</span>
                    </div>
                  )}
                  
                  {/* Toggle Button */}
                  <div className="pt-2">
                    <Button
                      variant={isIntegrationEnabled(connector.id) ? "outline" : "default"}
                      size="sm"
                      className="w-full"
                      onClick={() => handleToggle(connector.id)}
                    >
                      {isIntegrationEnabled(connector.id) ? t`Deshabilitar` : t`Habilitar`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="enabled" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredConnectors
              .filter((c) => isIntegrationEnabled(c.id))
              .map((connector) => (
                <Card key={connector.id} className="border-primary relative overflow-hidden">
                  <CardHeader className="text-center pb-3">
                    {/* Logo Container */}
                    <div className="flex justify-center mb-4">
                      <div className="relative w-20 h-20 rounded-xl bg-primary/10 border-2 border-primary flex items-center justify-center overflow-hidden">
                        {connector.logo ? (
                          <img 
                            src={connector.logo} 
                            alt={connector.name}
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-xl font-bold text-primary">
                              {connector.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <Badge 
                      variant="default" 
                      className="absolute top-2 right-2 text-xs bg-primary"
                    >
                      {t`ON`}
                    </Badge>
                    
                    {/* Title */}
                    <CardTitle className="text-lg font-semibold">{connector.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">{connector.nameES}</CardDescription>
                    
                    {/* Category Badge */}
                    <Badge variant="outline" className="w-fit mx-auto mt-2 text-xs border-primary/50">
                      {connector.category}
                    </Badge>
                  </CardHeader>
                  
                  <CardContent className="space-y-3 pt-0">
                    <p className="text-sm text-muted-foreground text-center line-clamp-2">
                      {connector.description}
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 gap-2"
                      >
                        <Info className="w-4 h-4" />
                        <Trans>Detalles</Trans>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggle(connector.id)}
                      >
                        <Switch
                          checked={true}
                          className="pointer-events-none"
                        />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
