import { Trans, useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Node, Edge } from 'reactflow';
import { Workflow, Plus, Trash2, Edit } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useFlowsStore } from '../stores/use-flows-store';

const CATEGORY_COLORS: Record<string, string> = {
  soberana:  'var(--primary)',
  loopayapp: 'var(--chart-2)',
  fx:        'var(--chart-3)',
  control:   'var(--muted-foreground)',
};

const THUMB_W = 300;
const THUMB_H = 110;
const PAD = 24;
const NODE_W = 56;
const NODE_H = 18;

function FlowThumbnail({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
  if (nodes.length === 0) {
    return (
      <div className="w-full h-[110px] flex items-center justify-center bg-muted/20 rounded-t-xl border-b border-border/40">
        <Workflow className="h-8 w-8 text-muted-foreground/20" />
      </div>
    );
  }

  const xs = nodes.map((n) => n.position.x);
  const ys = nodes.map((n) => n.position.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const scaleX = (THUMB_W - PAD * 2 - NODE_W) / rangeX;
  const scaleY = (THUMB_H - PAD * 2 - NODE_H) / rangeY;
  const scale  = Math.min(scaleX, scaleY, 0.5);

  const cx = (x: number) => PAD + (x - minX) * scale + NODE_W / 2;
  const cy = (y: number) => PAD + (y - minY) * scale + NODE_H / 2;

  return (
    <div className="w-full rounded-t-xl overflow-hidden border-b border-border/40 bg-muted/10">
      <svg
        viewBox={`0 0 ${THUMB_W} ${THUMB_H}`}
        width="100%"
        height={THUMB_H}
        aria-hidden
      >
        {/* Edges */}
        {edges.map((edge) => {
          const src = nodes.find((n) => n.id === edge.source);
          const tgt = nodes.find((n) => n.id === edge.target);
          if (!src || !tgt) return null;
          return (
            <line
              key={edge.id}
              x1={cx(src.position.x)}
              y1={cy(src.position.y)}
              x2={cx(tgt.position.x)}
              y2={cy(tgt.position.y)}
              stroke="var(--border)"
              strokeWidth={1}
              strokeDasharray="3 2"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const color = CATEGORY_COLORS[node.type ?? ''] ?? 'var(--muted-foreground)';
          const x = cx(node.position.x) - NODE_W / 2;
          const y = cy(node.position.y) - NODE_H / 2;
          return (
            <g key={node.id}>
              <rect
                x={x}
                y={y}
                width={NODE_W}
                height={NODE_H}
                rx={4}
                fill={`color-mix(in oklch, ${color} 12%, transparent)`}
                stroke={color}
                strokeWidth={0.8}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function WorkflowFlows() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const flows       = useFlowsStore((s) => s.flows);
  const deleteFlow  = useFlowsStore((s) => s.deleteFlow);
  const createFlow  = useFlowsStore((s) => s.createFlow);
  const setActiveFlow = useFlowsStore((s) => s.setActiveFlow);

  const handleNewFlow = () => {
    createFlow(t`Flujo sin título`);
    navigate('/workflow');
  };

  const handleEdit = (id: string) => {
    setActiveFlow(id);
    navigate('/workflow');
  };

  const handleDelete = (id: string) => {
    deleteFlow(id);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              <Trans>Mis Flujos</Trans>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {flows.length > 0
                ? t`${flows.length} flujos guardados`
                : t`Sin flujos guardados aún`}
            </p>
          </div>
          <Button variant="gradient" onClick={handleNewFlow} className="gap-1.5">
            <Plus className="h-4 w-4" />
            <Trans>Nuevo flujo</Trans>
          </Button>
        </div>

        {/* Empty state */}
        {flows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center">
              <Workflow className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="text-center space-y-1.5">
              <p className="text-lg font-semibold text-foreground">
                <Trans>Crea tu primer flujo de pagos</Trans>
              </p>
              <p className="text-sm text-muted-foreground max-w-xs">
                <Trans>
                  Diseña pipelines de pagos visuales conectando APIs de Soberana y FX.
                </Trans>
              </p>
            </div>
            <Button variant="gradient" onClick={handleNewFlow} size="lg" className="gap-1.5">
              <Plus className="h-4 w-4" />
              <Trans>Nuevo flujo</Trans>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {flows.map((flow) => (
              <div key={flow.id} className="gradient-border gradient-border-always rounded-xl">
                <Card className="flex flex-col overflow-hidden rounded-xl border-0">
                  <FlowThumbnail nodes={flow.nodes} edges={flow.edges} />

                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground leading-tight break-words">
                        {flow.name}
                      </h3>
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        {flow.nodes.length} <Trans>nodos</Trans>
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 pb-2">
                    <p className="text-xs text-muted-foreground">
                      <Trans>Actualizado</Trans>{' '}
                      {formatDistanceToNow(new Date(flow.updatedAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {flow.edges.length} <Trans>conexiones</Trans>
                    </p>
                  </CardContent>

                  <CardFooter className="border-t border-border/60 pt-4 pb-4 gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 gap-1.5 text-xs"
                      onClick={() => handleEdit(flow.id)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <Trans>Editar</Trans>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(flow.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <Trans>Eliminar</Trans>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
