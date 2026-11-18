import { motion } from 'framer-motion';
import { ArrowRight, ArrowDown } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';

export interface FlowNode {
  icon?: string;
  label: string;
  sublabel?: string;
}

export interface InteractiveFlowDiagramProps {
  nodes: FlowNode[];
  className?: string;
}

function NodeBox({ node, index }: { node: FlowNode; index: number }) {
  return (
    <motion.div
      className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.3, ease: 'easeOut' }}
    >
      {node.icon && <span className="text-xl shrink-0">{node.icon}</span>}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground leading-tight">
          {node.label}
        </p>
        {node.sublabel && (
          <p className="text-xs text-muted-foreground mt-0.5">{node.sublabel}</p>
        )}
      </div>
    </motion.div>
  );
}

function Connector({ index, vertical }: { index: number; vertical: boolean }) {
  return (
    <motion.div
      className={cn(
        'flex items-center justify-center text-muted-foreground/60',
        vertical ? 'py-1' : 'px-1',
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: index * 0.3 + 0.15 }}
    >
      {vertical ? (
        <ArrowDown className="h-5 w-5" />
      ) : (
        <ArrowRight className="h-5 w-5" />
      )}
    </motion.div>
  );
}

export function InteractiveFlowDiagram({
  nodes,
  className,
}: InteractiveFlowDiagramProps) {
  return (
    <div className={cn(className)}>
      {/* Desktop: horizontal */}
      <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-2">
        {nodes.map((node, i) => (
          <div key={i} className="contents">
            <NodeBox node={node} index={i} />
            {i < nodes.length - 1 && <Connector index={i} vertical={false} />}
          </div>
        ))}
      </div>

      {/* Mobile: vertical */}
      <div className="flex md:hidden flex-col items-stretch gap-1">
        {nodes.map((node, i) => (
          <div key={i} className="flex flex-col items-center">
            <NodeBox node={node} index={i} />
            {i < nodes.length - 1 && <Connector index={i} vertical />}
          </div>
        ))}
      </div>
    </div>
  );
}
