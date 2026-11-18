import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, CheckCircle2, XCircle, Filter, Search, Plus, Sparkles, Edit, ArrowLeft } from '@/shared/components/animated-icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { flowTemplates, runHistory } from '@/shared/lib/suite-data';
import { useSuiteStore } from '@/shared/stores/useSuiteStore';
import { WorkflowBuilder } from '@/shared/components/common/WorkflowBuilder';
import { FlowTemplate, ProductKey } from '@/shared/types/suite';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { useLingui } from '@lingui/react/macro';

export default function Automations() {
  const navigate = useNavigate();
  const { t } = useLingui();
  const [searchQuery, setSearchQuery] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<FlowTemplate | undefined>();
  const { isProductEnabled } = useSuiteStore();

  const getProductBadgeColor = (product: string) => {
    const colors: Record<string, string> = {
      move: 'bg-primary/20 text-primary border-primary/30',
      change: 'bg-chart-5/20 text-chart-5 border-chart-5/30',
      account: 'bg-success/20 text-success border-success/30',
      marketplace: 'bg-warning/20 text-warning border-warning/30',
      pos: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
      global: 'bg-muted/20 text-muted-foreground border-muted/30',
    };
    return colors[product] || colors.global;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'partial':
        return <Clock className="w-4 h-4 text-warning" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const filteredTemplates = flowTemplates.filter((template) =>
    template.nameES.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = runHistory.filter((run) =>
    run.flowName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = (flow: FlowTemplate) => {
    setIsBuilding(false);
  };

  const handleNewFlow = () => {
    setSelectedFlow(undefined);
    setIsBuilding(true);
  };

  const handleEditTemplate = (template: FlowTemplate) => {
    setSelectedFlow(template);
    setIsBuilding(true);
  };

  // Show WorkflowBuilder when building
  if (isBuilding) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight"><span className="font-semibold text-foreground">{t`Constructor.`}</span>{' '}<span className="font-normal text-muted-foreground">{t`Diseña automatizaciones.`}</span></h1>
            <p className="text-muted-foreground">
              {selectedFlow ? t`Editando: ${selectedFlow.nameES}` : t`Nuevo flujo de trabajo`}
            </p>
          </div>
          <Button variant="outline" onClick={() => setIsBuilding(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t`Volver`}
          </Button>
        </div>
        <WorkflowBuilder
          category={selectedFlow?.product === 'move' ? 'move' : selectedFlow?.product === 'change' ? 'convert' : 'account'}
          initialFlow={selectedFlow ? {
            id: selectedFlow.id,
            name: selectedFlow.name,
            category: 'custom',
            description: selectedFlow.description,
            nodes: selectedFlow.nodes.map(node => ({
              id: node.id,
              type: node.type,
              position: node.position,
              data: node.data as Record<string, any>,
            })),
            edges: selectedFlow.edges,
            status: selectedFlow.status,
          } : undefined}
          onSave={(flow) => {
            handleSave({
              ...selectedFlow!,
              nodes: flow.nodes.map(node => ({
                id: node.id,
                type: node.type,
                position: node.position,
                data: {
                  label: typeof node.data === 'object' && node.data !== null && 'label' in node.data 
                    ? String(node.data.label) 
                    : 'Node',
                  product: typeof node.data === 'object' && node.data !== null && 'product' in node.data 
                    ? node.data.product as ProductKey 
                    : undefined,
                  connector: typeof node.data === 'object' && node.data !== null && 'connector' in node.data 
                    ? String(node.data.connector) 
                    : undefined,
                  config: typeof node.data === 'object' && node.data !== null && 'config' in node.data 
                    ? node.data.config as Record<string, any> 
                    : undefined,
                },
              })),
              edges: flow.edges,
            });
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <PageHeader 
              title={t`Automatización`}
              subtitle={t`Diseña y ejecuta flujos automáticos.`}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/build')}>
              <Sparkles className="w-4 h-4 mr-2" />
              {t`Crear con IA`}
            </Button>
            <Button onClick={handleNewFlow}>
              <Plus className="w-4 h-4 mr-2" />
              {t`Nuevo flujo`}
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t`Buscar flujos...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          {t`Filtros`}
        </Button>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">{t`Templates`} ({flowTemplates.length})</TabsTrigger>
          <TabsTrigger value="history">{t`Historial`} ({runHistory.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4">
            {filteredTemplates.map((template) => {
              const productEnabled = template.product === 'global' || 
                isProductEnabled(template.product as any);
              const missingProducts = template.requires.products.filter(
                (p) => !isProductEnabled(p as any)
              );

              return (
                <Card key={template.id} className={!productEnabled ? 'opacity-50' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{template.nameES}</CardTitle>
                          <Badge className={getProductBadgeColor(template.product)}>
                            {template.product}
                          </Badge>
                          {template.status === 'active' && (
                            <Badge className="bg-success/20 text-success border-success/30">
                              {t`Activo`}
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {productEnabled ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditTemplate(template)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              {t`Editar`}
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleEditTemplate(template)}
                            >
                              <Play className="w-3 h-3 mr-1" />
                              {t`Usar`}
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" disabled>
                            {t`Producto deshabilitado`}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {t`Requiere`}:
                      </span>
                      {template.requires.products.map((product) => (
                        <Badge 
                          key={product} 
                          variant="outline"
                          className={missingProducts.includes(product) ? 'border-destructive/30 text-destructive' : ''}
                        >
                          {product}
                          {missingProducts.includes(product) && t` (deshabilitado)`}
                        </Badge>
                      ))}
                      {template.requires.connectors.length > 0 && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          {template.requires.connectors.map((connector) => (
                            <Badge key={connector} variant="outline">
                              {connector}
                            </Badge>
                          ))}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="grid gap-4">
            {filteredHistory.map((run) => (
              <Card key={run.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(run.status)}
                      <div>
                        <CardTitle className="text-base">{run.flowName}</CardTitle>
                        <CardDescription>
                          {new Date(run.startedAt).toLocaleString('es-ES')} • 
                          {run.durationMs}ms • 
                          {t`Trigger`}: {run.triggeredBy}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      className={
                        run.status === 'success'
                          ? 'bg-success/20 text-success border-success/30'
                          : run.status === 'failed'
                          ? 'bg-destructive/20 text-destructive border-destructive/30'
                          : 'bg-warning/20 text-warning border-warning/30'
                      }
                    >
                      {run.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {Object.entries(run.nodeStats).map(([nodeId, stats]) => (
                      <div key={nodeId} className="flex items-center gap-2">
                        {getStatusIcon(stats.status)}
                        <div>
                          <div className="font-medium">Node {nodeId}</div>
                          <div className="text-xs text-muted-foreground">
                            {stats.durationMs}ms
                          </div>
                        </div>
                      </div>
                    ))}
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
