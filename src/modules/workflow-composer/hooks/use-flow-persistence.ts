import { useCallback, useRef } from 'react';
import { useFlowsStore } from '../stores/use-flows-store';
import type { WorkflowNode, WorkflowEdge, SavedFlow } from '../types/workflow.types';

interface UseFlowPersistenceOptions {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onFlowCreated?: (flow: SavedFlow) => void;
}

export interface UseFlowPersistenceReturn {
  save(): void;
  saveAs(name: string): void;
}

export function useFlowPersistence({
  nodes,
  edges,
  onFlowCreated,
}: UseFlowPersistenceOptions): UseFlowPersistenceReturn {
  const activeFlowId = useFlowsStore((s) => s.activeFlowId);
  const saveFlow = useFlowsStore((s) => s.saveFlow);
  const createFlow = useFlowsStore((s) => s.createFlow);
  const flows = useFlowsStore((s) => s.flows);

  const lastSavedRef = useRef<string>('');

  const save = useCallback(() => {
    const existing = flows.find((f) => f.id === activeFlowId);
    if (existing) {
      const updated: SavedFlow = {
        ...existing,
        nodes,
        edges,
        updatedAt: new Date().toISOString(),
      };
      saveFlow(updated);
      lastSavedRef.current = JSON.stringify({ nodes, edges });
    } else {
      const flow = createFlow('Flujo sin título');
      const complete: SavedFlow = {
        ...flow,
        nodes,
        edges,
        updatedAt: new Date().toISOString(),
      };
      saveFlow(complete);
      lastSavedRef.current = JSON.stringify({ nodes, edges });
      onFlowCreated?.(complete);
    }
  }, [activeFlowId, flows, nodes, edges, saveFlow, createFlow, onFlowCreated]);

  const saveAs = useCallback(
    (name: string) => {
      const flow = createFlow(name);
      const complete: SavedFlow = {
        ...flow,
        nodes,
        edges,
        updatedAt: new Date().toISOString(),
      };
      saveFlow(complete);
      lastSavedRef.current = JSON.stringify({ nodes, edges });
      onFlowCreated?.(complete);
    },
    [nodes, edges, createFlow, saveFlow, onFlowCreated],
  );

  return { save, saveAs };
}
