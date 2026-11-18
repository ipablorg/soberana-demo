import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { useLingui } from '@lingui/react/macro';
import {
  Settings, Webhook, Clock, GitBranch, Bell,
  type IconComponent,
} from '@/shared/components/animated-icons';
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

const TRIGGER_TYPES = new Set(['trigger-webhook', 'trigger-cron']);
const CONDITION_TYPES = new Set(['condition']);

function getHeaderIcon(nodeType: string): IconComponent {
  if (nodeType === 'trigger-webhook') return Webhook;
  if (nodeType === 'trigger-cron')    return Clock;
  if (nodeType === 'condition')       return GitBranch;
  if (nodeType === 'notification')    return Bell;
  return Settings;
}

function ControlNodeComponent({ data, selected }: NodeProps<WorkflowNodeData>) {
  const { t } = useLingui();
  const isTrigger = TRIGGER_TYPES.has(data.nodeType);
  const isCondition = CONDITION_TYPES.has(data.nodeType);
  const HeaderIcon = getHeaderIcon(data.nodeType);

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
        isTrigger && 'border-dashed',
      )}
    >
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-muted-foreground !rounded-full !border-2 !border-background"
        />
      )}

      <div className="rounded-t-xl px-3 py-2 bg-muted border-b border-border/50">
        <div className="flex items-center gap-1.5">
          <HeaderIcon className="h-3 w-3 opacity-80 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">
            {isTrigger ? t`Trigger` : t`Lógica`}
          </span>
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

      {isCondition ? (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            style={{ top: '35%' }}
            className="!w-3 !h-3 !bg-success !rounded-full !border-2 !border-background"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            style={{ top: '65%' }}
            className="!w-3 !h-3 !bg-destructive !rounded-full !border-2 !border-background"
          />
          <div className="px-3 pb-2 flex flex-col gap-0.5">
            <span className="text-[10px] text-success">↗ true</span>
            <span className="text-[10px] text-destructive">↘ false</span>
          </div>
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-muted-foreground !rounded-full !border-2 !border-background"
        />
      )}
    </div>
  );
}

export const ControlNode = memo(ControlNodeComponent);
