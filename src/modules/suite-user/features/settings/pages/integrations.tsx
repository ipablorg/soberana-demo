import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Settings, ExternalLink, Play } from '@/shared/components/animated-icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Switch } from '@/shared/components/ui/switch';
import { Separator } from '@/shared/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { connectors } from '@/shared/lib/suite-data';
import { useSuiteStore } from '@/shared/stores/useSuiteStore';
import { useLingui } from '@lingui/react/macro';

export default function SettingsIntegrations() {
  const { t } = useLingui();
  const { toggleIntegration, isIntegrationEnabled } = useSuiteStore();

  const groupedConnectors = {
    rail: connectors.filter((c) => c.category === 'rail'),
    custody: connectors.filter((c) => c.category === 'custody'),
    bridge: connectors.filter((c) => c.category === 'bridge'),
    stablecoin_platform: connectors.filter((c) => c.category === 'stablecoin_platform'),
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link to="/settings">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t`Volver a configuración`}
          </Button>
        </Link>
        <PageHeader
          title={t`Integraciones`}
          subtitle={t`Conectores, rieles y proveedores.`}
        />
      </div>

      <Tabs defaultValue="rail" className="space-y-6">
        <TabsList>
          <TabsTrigger value="rail">{t`Rieles de pago`}</TabsTrigger>
          <TabsTrigger value="custody">{t`Custodia`}</TabsTrigger>
          <TabsTrigger value="bridge">{t`Bridges`}</TabsTrigger>
          <TabsTrigger value="stablecoin_platform">{t`Stablecoins`}</TabsTrigger>
        </TabsList>

        {Object.entries(groupedConnectors).map(([category, categoryConnectors]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-4">
              {categoryConnectors.map((connector) => {
                const enabled = isIntegrationEnabled(connector.id);

                return (
                  <Card key={connector.id} className={enabled ? 'border-primary/30' : 'opacity-70'}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">{connector.nameES}</CardTitle>
                            {connector.status === 'enabled' && enabled && (
                              <Badge className="bg-success/20 text-success border-success/30">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {t`Habilitado`}
                              </Badge>
                            )}
                            {connector.status === 'error' && (
                              <Badge className="bg-destructive/20 text-destructive border-destructive/30">
                                <XCircle className="w-3 h-3 mr-1" />
                                {t`Error`}
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="text-base">{connector.description}</CardDescription>
                        </div>
                        <Switch
                          checked={enabled}
                          onCheckedChange={() => toggleIntegration(connector.id)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-medium mb-2">{t`Capacidades`}</div>
                          <div className="grid grid-cols-2 gap-4">
                            {connector.capabilities.triggers.length > 0 && (
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">{t`Triggers`}</div>
                                <div className="flex flex-wrap gap-1">
                                  {connector.capabilities.triggers.map((trigger) => (
                                    <Badge key={trigger} variant="outline" className="text-xs">
                                      {trigger}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {connector.capabilities.actions.length > 0 && (
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">{t`Actions`}</div>
                                <div className="flex flex-wrap gap-1">
                                  {connector.capabilities.actions.map((action) => (
                                    <Badge key={action} variant="outline" className="text-xs">
                                      {action}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {connector.capabilities.constraints && (
                          <>
                            <Separator />
                            <div>
                              <div className="text-sm font-medium mb-2">{t`Restricciones`}</div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                {connector.capabilities.constraints.supportedCurrencies && (
                                  <div>
                                    <div className="text-xs text-muted-foreground">{t`Monedas`}</div>
                                    <div className="font-medium">
                                      {connector.capabilities.constraints.supportedCurrencies.join(', ')}
                                    </div>
                                  </div>
                                )}
                                {connector.capabilities.constraints.supportedNetworks && (
                                  <div>
                                    <div className="text-xs text-muted-foreground">{t`Redes`}</div>
                                    <div className="font-medium">
                                      {connector.capabilities.constraints.supportedNetworks.join(', ')}
                                    </div>
                                  </div>
                                )}
                                {connector.capabilities.constraints.minAmount !== undefined && (
                                  <div>
                                    <div className="text-xs text-muted-foreground">{t`Monto mínimo`}</div>
                                    <div className="font-medium">
                                      ${connector.capabilities.constraints.minAmount.toLocaleString()}
                                    </div>
                                  </div>
                                )}
                                {connector.capabilities.constraints.maxAmount !== undefined && (
                                  <div>
                                    <div className="text-xs text-muted-foreground">{t`Monto máximo`}</div>
                                    <div className="font-medium">
                                      ${connector.capabilities.constraints.maxAmount.toLocaleString()}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}

                        {(connector.sla || connector.costModel) && (
                          <>
                            <Separator />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              {connector.sla && (
                                <>
                                  <div>
                                    <div className="text-xs text-muted-foreground">{t`Uptime SLA`}</div>
                                    <div className="font-medium">{connector.sla.uptime}%</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground">{t`Tiempo de respuesta`}</div>
                                    <div className="font-medium">{connector.sla.responseTime}ms</div>
                                  </div>
                                </>
                              )}
                              {connector.costModel && (
                                <div>
                                  <div className="text-xs text-muted-foreground">{t`Costo`}</div>
                                  <div className="font-medium">
                                    {connector.costModel.type === 'percentage' 
                                      ? `${connector.costModel.value}%` 
                                      : `$${connector.costModel.value}`}
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        <Separator />
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" disabled={!enabled}>
                            <Settings className="w-3 h-3 mr-1" />
                            {t`Configurar`}
                          </Button>
                          <Button size="sm" variant="outline" disabled={!enabled}>
                            <Play className="w-3 h-3 mr-1" />
                            {t`Probar conexión`}
                          </Button>
                          {connector.docs && (
                            <a href={connector.docs} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="ghost">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                {t`Docs`}
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
