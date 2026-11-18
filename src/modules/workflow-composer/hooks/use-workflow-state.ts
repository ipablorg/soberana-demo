import { useCallback, useState } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type OnNodesChange,
  type OnEdgesChange,
} from 'reactflow';
import type { WorkflowNode, WorkflowEdge, WorkflowNodeData, NodeExecutionStatus } from '../types/workflow.types';
import type { SavedFlow } from '../types/workflow.types';

export interface UseWorkflowStateReturn {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  selectedNode: WorkflowNode | null;
  isRunning: boolean;
  updateNodeConfig(id: string, key: string, value: string | number | boolean): void;
  updateNodeStatus(id: string, status: NodeExecutionStatus, output?: unknown): void;
  addNode(node: WorkflowNode): void;
  loadFlow(flow: SavedFlow): void;
  clearCanvas(): void;
  runFlow(): Promise<void>;
  resetExecution(): void;
}

export function useWorkflowState(): UseWorkflowStateReturn {
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const addNode = useCallback(
    (node: WorkflowNode) => setNodes((nds) => [...nds, node]),
    [setNodes],
  );

  const updateNodeConfig = useCallback(
    (id: string, key: string, value: string | number | boolean) =>
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? { ...n, data: { ...n.data, config: { ...n.data.config, [key]: value } } }
            : n,
        ),
      ),
    [setNodes],
  );

  const updateNodeStatus = useCallback(
    (id: string, status: NodeExecutionStatus, output?: unknown) =>
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? { ...n, data: { ...n.data, executionStatus: status, executionOutput: output } }
            : n,
        ),
      ),
    [setNodes],
  );

  const loadFlow = useCallback(
    (flow: SavedFlow) => {
      setNodes(flow.nodes);
      setEdges(flow.edges);
      setSelectedNodeId(null);
    },
    [setNodes, setEdges],
  );

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
  }, [setNodes, setEdges]);

  const resetExecution = useCallback(
    () =>
      setNodes((nds) =>
        nds.map((n) => ({ ...n, data: { ...n.data, executionStatus: 'idle' as const, executionOutput: undefined } })),
      ),
    [setNodes],
  );

  const runFlow = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);

    // Reset all to idle first
    setNodes((nds) =>
      nds.map((n) => ({ ...n, data: { ...n.data, executionStatus: 'idle' as const, executionOutput: undefined } })),
    );

    // BFS from trigger nodes (nodes with no incoming edges)
    const incomingMap = new Set(edges.map((e) => e.target));
    const triggerIds = nodes.filter((n) => !incomingMap.has(n.id)).map((n) => n.id);
    const visited = new Set<string>();
    const queue = [...triggerIds];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, executionStatus: 'running' as const } } : n,
        ),
      );

      await new Promise<void>((r) => setTimeout(r, 800));

      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, executionStatus: 'success' as const, executionOutput: { ok: true, nodeId } } }
            : n,
        ),
      );

      const nextIds = edges.filter((e) => e.source === nodeId).map((e) => e.target);
      queue.push(...nextIds);
    }

    setIsRunning(false);
  }, [isRunning, nodes, edges, setNodes]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectedNodeId,
    setSelectedNodeId,
    selectedNode,
    isRunning,
    updateNodeConfig,
    updateNodeStatus,
    addNode,
    loadFlow,
    clearCanvas,
    runFlow,
    resetExecution,
  };
}
