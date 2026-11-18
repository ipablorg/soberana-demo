import { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import { runHistory } from '@/shared/lib/suite-data';
import { RunHistory as RunHistoryType } from '@/shared/types/suite';
import { Clock, CheckCircle2, XCircle, AlertCircle, Search, Filter, ExternalLink } from '@/shared/components/animated-icons';

export default function RunHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRun, setSelectedRun] = useState<RunHistoryType | null>(null);

  const filteredRuns = runHistory.filter((run) => {
    const matchesSearch = run.flowName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         run.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || run.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-success';
      case 'failed': return 'bg-destructive';
      case 'partial': return 'bg-warning';
      case 'running': return 'bg-primary';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'partial': return <AlertCircle className="w-4 h-4" />;
      case 'running': return <Clock className="w-4 h-4 animate-spin" />;
      default: return null;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatTimestamp = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return `Hace ${Math.floor(diff / 60000)} min`;
    if (hours < 24) return `Hace ${hours} horas`;
    return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading">Historial de Ejecuciones</h1>
          <p className="text-muted-foreground mt-1">
            Monitorea y analiza todas las ejecuciones de flujos de trabajo
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <ExternalLink className="w-4 h-4" />
          Ver Logs Completos
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Ejecuciones Recientes</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar flujos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="success">Éxito</SelectItem>
                  <SelectItem value="failed">Fallido</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                  <SelectItem value="running">En curso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredRuns.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p><Trans>Ninguna ejecución coincide con estos filtros</Trans></p>
              </div>
            ) : (
              filteredRuns.map((run) => (
                <Card
                  key={run.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setSelectedRun(run)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold truncate">{run.flowName}</h3>
                          <Badge variant="outline" className={`${getStatusColor(run.status)} text-primary-foreground gap-1`}>
                            {getStatusIcon(run.status)}
                            {run.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(run.startedAt)}
                          </span>
                          <span>Duración: {formatDuration(run.durationMs)}</span>
                          {run.triggeredBy && <span>Trigger: {run.triggeredBy}</span>}
                          {run.totalCost && <span>Costo: <span className="font-mono tabular-nums">${run.totalCost.toFixed(2)}</span></span>}
                        </div>
                        {run.connectors && run.connectors.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {run.connectors.slice(0, 5).map((connector, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {connector}
                              </Badge>
                            ))}
                            {run.connectors.length > 5 && (
                              <Badge variant="secondary" className="text-xs">
                                +{run.connectors.length - 5}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        Ver Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!selectedRun} onOpenChange={() => setSelectedRun(null)}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          {selectedRun && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  {selectedRun.flowName}
                  <Badge variant="outline" className={`${getStatusColor(selectedRun.status)} text-primary-foreground gap-1`}>
                    {getStatusIcon(selectedRun.status)}
                    {selectedRun.status}
                  </Badge>
                </SheetTitle>
                <SheetDescription>
                  Ejecutado {formatTimestamp(selectedRun.startedAt)} • Duración: {formatDuration(selectedRun.durationMs)}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Resumen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Run ID:</span>
                      <span className="font-mono">{selectedRun.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Flow ID:</span>
                      <span className="font-mono">{selectedRun.flowId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trigger:</span>
                      <span>{selectedRun.triggeredBy || 'Manual'}</span>
                    </div>
                    {selectedRun.totalCost && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Costo Total:</span>
                        <span className="font-semibold font-mono tabular-nums">${selectedRun.totalCost.toFixed(2)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div>
                  <h3 className="font-semibold mb-3">Ejecución de Nodos</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedRun.nodeStats).map(([nodeId, stats]) => (
                      <Card key={nodeId} className={stats.status === 'failed' ? 'border-destructive' : ''}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(stats.status)}
                              <div>
                                <p className="font-medium">Node {nodeId}</p>
                                <p className="text-sm text-muted-foreground">{formatDuration(stats.durationMs)}</p>
                              </div>
                            </div>
                            <Badge variant={stats.status === 'success' ? 'default' : 'destructive'}>
                              {stats.status}
                            </Badge>
                          </div>
                          {stats.error && (
                            <div className="mt-3 p-3 bg-destructive/10 rounded text-sm text-destructive">
                              {stats.error}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {selectedRun.connectors && selectedRun.connectors.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Connectors Utilizados</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRun.connectors.map((connector, idx) => (
                        <Badge key={idx} variant="secondary">
                          {connector}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRun.whyLogs && selectedRun.whyLogs.length > 0 && (
                  <Accordion type="single" collapsible>
                    <AccordionItem value="why-logs">
                      <AccordionTrigger>Why Logs (Explicabilidad)</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {selectedRun.whyLogs.map((log, idx) => (
                            <div key={idx} className="p-3 bg-muted rounded text-sm">
                              {log}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
