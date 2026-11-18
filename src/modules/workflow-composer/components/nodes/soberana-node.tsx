import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { useLingui } from '@lingui/react/macro';
import { DollarSign } from '@/shared/components/animated-icons';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import type { WorkflowNodeData, NodeExecutionStatus } from '../../types/workflow.types';

const STATUS_VARIANT: Record<NodeExecutionStatus, 'default' | 'secondary' | 'warning' | 'success' | 'destructive'> = {
  idle:    'secondary',
  pending: 'secondary',
  running: 'warning',
  success: 'success',
  error:   'destructive',
};

function SoberanaNodeComponent({ data, selected }: NodeProps<WorkflowNodeData>) {
  const { t } = useLingui();

  const statusLabel: Record<NodeExecutionStatus, string> = {
    idle:    '',
    pending: t`Esperando`,
    running: t`Ejecutando`,
    success: t`OK`,
    error:   t`Error`,
  };

  return (
    <div
      className={cn(
        'relative rounded-xl border border-border bg-card shadow-sm min-w-[200px] max-w-[240px]',
        selected && 'ring-2 ring-ring',
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-primary !rounded-full !border-2 !border-background"
      />

      <div className="rounded-t-xl px-3 py-2 bg-primary/10 border-b border-border/50">
        <div className="flex items-center gap-1.5">
          <DollarSign className="h-3 w-3 opacity-80 text-primary" />
          <span className="text-xs font-semibold text-primary">Soberana</span>
        </div>
      </div>

      <div className="px-3 py-2.5">
        <p className="text-sm font-medium text-foreground leading-tight">{data.label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{data.nodeType}</p>
      </div>

      {data.executionStatus !== 'idle' && (
        <div className="absolute -top-2.5 -right-2.5">
          <Badge variant={STATUS_VARIANT[data.executionStatus]} className="text-[10px] h-4 px-1.5">
            {statusLabel[data.executionStatus]}
          </Badge>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-primary !rounded-full !border-2 !border-background"
      />
    </div>
  );
}

export const SoberanaNode = memo(SoberanaNodeComponent);
