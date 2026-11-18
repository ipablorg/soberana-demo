import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import type {
  RichBlock,
  FlowNode,
  MetricData,
  StepData,
  ToolData,
  InfoCardData,
  RiskPairData,
  ChatBubbleData,
  TimelineStateData,
} from '../knowledge/types';

function BlockLabel({ text }: { text: string }) {
  return (
    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
      {text}
    </p>
  );
}

function FlowDiagram({ nodes }: { nodes: FlowNode[] }) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-0 overflow-x-auto">
      {nodes.map((node, i) => (
        <div key={i} className="flex flex-col sm:flex-row items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="flex items-center gap-2 sm:flex-col sm:gap-1 rounded-xl border border-border/40 bg-card/60 px-3 py-2 sm:px-3 sm:py-2.5 sm:text-center sm:min-w-[90px] w-full sm:w-auto"
          >
            <span className="text-lg shrink-0">{node.icon}</span>
            <div className="sm:space-y-0.5">
              <p className="text-xs font-semibold text-foreground leading-tight">{node.label}</p>
              {node.sublabel && (
                <p className="text-[10px] text-muted-foreground">{node.sublabel}</p>
              )}
            </div>
          </motion.div>
          {i < nodes.length - 1 && (
            <span className="text-muted-foreground/40 text-xs hidden sm:block mx-1">→</span>
          )}
        </div>
      ))}
    </div>
  );
}

function MetricCards({ metrics }: { metrics: MetricData[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {metrics.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
          className="rounded-xl border border-border/40 bg-card/60 p-2.5 text-center"
        >
          <p className="text-lg font-bold text-foreground font-mono tabular-nums">
            {m.prefix ?? ''}{m.value.toFixed(m.decimals ?? 0)}{m.suffix ?? ''}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{m.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

function StepList({ steps }: { steps: StepData[] }) {
  return (
    <div className="flex flex-col gap-1">
      {steps.map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.12 }}
          className="flex items-start gap-2.5 rounded-xl border border-border/40 bg-card/60 px-3 py-2"
        >
          <span className="text-base shrink-0 mt-0.5">{step.icon}</span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground">{step.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{step.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ToolGrid({ tools }: { tools: ToolData[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
      {tools.map((tool, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.05 }}
          className="rounded-xl border border-border/40 bg-card/60 px-2.5 py-2 group hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm">{tool.icon}</span>
            <h4 className="text-[11px] font-semibold text-foreground">{tool.name}</h4>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">{tool.description}</p>
          <p className="text-[10px] text-primary/70 italic mt-0.5">"{tool.example}"</p>
        </motion.div>
      ))}
    </div>
  );
}

function InfoCards({ cards }: { cards: InfoCardData[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
          className="rounded-xl border border-border/40 bg-card/60 p-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{card.icon}</span>
            <h4 className="text-xs font-semibold text-foreground">{card.title}</h4>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{card.description}</p>
          {card.metric && (
            <p className="text-[11px] font-semibold text-primary mt-1.5">{card.metric}</p>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function RiskGrid({ pairs }: { pairs: RiskPairData[] }) {
  return (
    <div className="flex flex-col gap-2">
      {pairs.map((pair, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
          className="grid grid-cols-2 gap-1.5"
        >
          <div className="rounded-xl bg-destructive/5 border border-destructive/10 p-2.5">
            <p className="text-[11px] font-semibold text-destructive">{pair.risk}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{pair.riskDescription}</p>
          </div>
          <div className="rounded-xl bg-success/5 border border-success/10 p-2.5">
            <p className="text-[11px] font-semibold text-success">{pair.safeguard}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{pair.safeguardDescription}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ConversationExample({ messages }: { messages: ChatBubbleData[] }) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/40 p-2.5">
      <div className="flex flex-col gap-1.5">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-relaxed whitespace-pre-line',
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground self-end rounded-br-sm'
                : 'bg-muted border border-border/30 self-start rounded-bl-sm',
            )}
          >
            {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
}

function StateTimeline({ states }: { states: TimelineStateData[] }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto py-1">
      {states.map((state, i) => (
        <div key={i} className="flex items-center">
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium whitespace-nowrap border',
              state.status === 'completed' && 'bg-success/10 text-success border-success/20',
              state.status === 'active' && 'bg-primary/10 text-primary border-primary/30 ring-1 ring-primary/20',
              state.status === 'pending' && 'bg-muted/50 text-muted-foreground border-border/30',
            )}
          >
            {state.status === 'completed' && '✓'}
            {state.status === 'active' && '●'}
            {state.label}
          </div>
          {i < states.length - 1 && (
            <span className="text-muted-foreground/30 text-[10px] mx-0.5">→</span>
          )}
        </div>
      ))}
    </div>
  );
}

export function OsRichBlock({ block }: { block: RichBlock }) {
  return (
    <div className="my-3">
      {block.label && <BlockLabel text={block.label} />}

      {block.type === 'flow-diagram' && <FlowDiagram nodes={block.data as FlowNode[]} />}
      {block.type === 'metric-cards' && <MetricCards metrics={block.data as MetricData[]} />}
      {block.type === 'step-list' && <StepList steps={block.data as StepData[]} />}
      {block.type === 'tool-grid' && <ToolGrid tools={block.data as ToolData[]} />}
      {block.type === 'info-cards' && <InfoCards cards={block.data as InfoCardData[]} />}
      {block.type === 'risk-grid' && <RiskGrid pairs={block.data as RiskPairData[]} />}
      {block.type === 'conversation' && <ConversationExample messages={block.data as ChatBubbleData[]} />}
      {block.type === 'state-timeline' && <StateTimeline states={block.data as TimelineStateData[]} />}
    </div>
  );
}
