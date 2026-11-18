import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Trans } from '@lingui/react/macro';
import ReactFlow, {
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  type ReactFlowInstance,
  type NodeTypes,
  type EdgeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { GitBranch } from '@/shared/components/animated-icons';
import { useWorkflowComposerStore } from '@/shared/stores/use-workflow-composer-store';
import { useFlowsStore } from '../stores/use-flows-store';
import { useWorkflowState } from '../hooks/use-workflow-state';
import { useFlowPersistence } from '../hooks/use-flow-persistence';
import { useNodeDefinitions } from '../components/node-palette';
import { WorkflowSplash } from '../components/workflow-splash';
import { WorkflowToolbar } from '../components/workflow-toolbar';
import { NodePalette } from '../components/node-palette';
import { NodeConfigPanel } from '../components/node-config-panel';
import { SoberanaNode } from '../components/nodes/soberana-node';
import { LoopayAppNode } from '../components/nodes/loopayapp-node';
import { FxNode } from '../components/nodes/fx-node';
import { ControlNode } from '../components/nodes/control-node';
import { AnimatedEdge } from '../components/edges/animated-edge';
import type { WorkflowNode, NodeCategory } from '../types/workflow.types';
import { BrandCurvesBackdrop } from '@/shared/components/brand/brand-curves-backdrop';

const NODE_TYPES: NodeTypes = {
  soberana:  SoberanaNode,
  loopayapp: LoopayAppNode,
  fx:        FxNode,
  control:   ControlNode,
};

const EDGE_TYPES: EdgeTypes = {
  animated: AnimatedEdge,
};

const MINIMAP_NODE_COLOR: Record<string, string> = {
  soberana:  'var(--primary)',
  loopayapp: 'var(--chart-2)',
  fx:        'var(--chart-3)',
  control:   'var(--muted-foreground)',
};

export function WorkflowCanvas() {
  const splashShown = useWorkflowComposerStore((s) => s.splashShown);
  const activeFlowId = useFlowsStore((s) => s.activeFlowId);
  const flows = useFlowsStore((s) => s.flows);
  const updateFlowNodes = useFlowsStore((s) => s.updateFlowNodes);

  const [flowName, setFlowName] = useState('Flujo sin título');
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const savedStateRef = useRef<string>('');

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNodeId,
    selectedNode,
    isRunning,
    updateNodeConfig,
    addNode,
    loadFlow,
    clearCanvas,
    runFlow,
  } = useWorkflowState();

  const definitions = useNodeDefinitions();

  useEffect(() => {
    if (!activeFlowId) return;
    const flow = flows.find((f) => f.id === activeFlowId);
    if (!flow) return;
    loadFlow(flow);
    setFlowName(flow.name);
    savedStateRef.current = JSON.stringify({ nodes: flow.nodes, edges: flow.edges });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFlowId]);

  const isDirty = useMemo(
    () => JSON.stringify({ nodes, edges }) !== savedStateRef.current,
    [nodes, edges],
  );

  const { save } = useFlowPersistence({ nodes, edges });

  const handleSave = useCallback(() => {
    if (activeFlowId) {
      updateFlowNodes(activeFlowId, nodes, edges);
      savedStateRef.current = JSON.stringify({ nodes, edges });
    } else {
      save();
      savedStateRef.current = JSON.stringify({ nodes, edges });
    }
  }, [activeFlowId, nodes, edges, save, updateFlowNodes]);

  const handleClear = useCallback(() => {
    clearCanvas();
    savedStateRef.current = JSON.stringify({ nodes: [], edges: [] });
  }, [clearCanvas]);

  const handleFlowNameChange = useCallback(
    (name: string) => {
      setFlowName(name);
      if (activeFlowId) {
        const flow = flows.find((f) => f.id === activeFlowId);
        if (flow) {
          updateFlowNodes(activeFlowId, flow.nodes, flow.edges);
        }
      }
    },
    [activeFlowId, flows, updateFlowNodes],
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const nodeType = e.dataTransfer.getData('nodeType');
      const nodeCategory = e.dataTransfer.getData('nodeCategory') as NodeCategory;
      const nodeLabel = e.dataTransfer.getData('nodeLabel');
      if (!nodeType) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      });

      const def = definitions.find((d) => d.type === nodeType);
      const newNode: WorkflowNode = {
        id: `${nodeType}-${Date.now()}`,
        type: nodeCategory,
        position,
        data: {
          label: nodeLabel,
          category: nodeCategory,
          nodeType,
          config: { ...(def?.defaultConfig ?? {}) },
          executionStatus: 'idle',
        },
      };

      addNode(newNode);
    },
    [reactFlowInstance, definitions, addNode],
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BrandCurvesBackdrop />
      <AnimatePresence>{!splashShown && <WorkflowSplash />}</AnimatePresence>

      <WorkflowToolbar
        flowName={flowName}
        isDirty={isDirty}
        isRunning={isRunning}
        onNameChange={handleFlowNameChange}
        onSave={handleSave}
        onRun={runFlow}
        onClear={handleClear}
        onShowLogs={() => {}}
      />

      <div className="flex flex-1 overflow-hidden">
        <NodePalette />

        <div ref={reactFlowWrapper} className="flex-1 overflow-hidden relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={NODE_TYPES}
            edgeTypes={EDGE_TYPES}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            fitView
            className="bg-transparent"
          >
            {/* Approved literal color: ReactFlow Background requires a color string, not a CSS class */}
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1.2}
              color="oklch(var(--border) / 0.6)"
            />
            <Controls
              className="[&>button]:bg-card [&>button]:border-border [&>button]:text-foreground [&>button:hover]:bg-muted [&>button]:rounded-lg [&>button]:transition-colors [&>button]:duration-150 flex flex-col gap-1 border-none shadow-none"
            />
            <MiniMap
              nodeColor={(node) =>
                MINIMAP_NODE_COLOR[node.type ?? ''] ?? 'var(--muted-foreground)'
              }
              style={{
                background:   'var(--card)',
                border:       '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
              }}
              maskColor="color-mix(in oklch, var(--background) 80%, transparent)"
            />
          </ReactFlow>

          {/* Empty state — pointer-events-none so it doesn't block drops */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="h-16 w-16 rounded-2xl border border-border/50 bg-muted/20 flex items-center justify-center">
                  <GitBranch className="h-7 w-7 text-muted-foreground/30" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground/50">
                    <Trans>Arrastra un nodo para empezar</Trans>
                  </p>
                  <p className="text-xs text-muted-foreground/30">
                    <Trans>Construye flujos de pago conectando nodos de las 4 APIs</Trans>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <NodeConfigPanel
          node={selectedNode}
          onConfigChange={updateNodeConfig}
        />
      </div>
    </div>
  );
}
