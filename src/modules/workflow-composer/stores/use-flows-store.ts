import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SavedFlow, WorkflowNode, WorkflowEdge } from '../types/workflow.types';

function generateId(): string {
  return `flow-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface FlowsState {
  flows: SavedFlow[];
  activeFlowId: string | null;
  saveFlow(flow: SavedFlow): void;
  deleteFlow(id: string): void;
  setActiveFlow(id: string | null): void;
  createFlow(name: string): SavedFlow;
  updateFlowNodes(id: string, nodes: WorkflowNode[], edges: WorkflowEdge[]): void;
}

export const useFlowsStore = create<FlowsState>()(
  persist(
    (set, get) => ({
      flows: [],
      activeFlowId: null,

      saveFlow: (flow) =>
        set((state) => {
          const exists = state.flows.some((f) => f.id === flow.id);
          if (exists) {
            return {
              flows: state.flows.map((f) =>
                f.id === flow.id ? { ...flow, updatedAt: new Date().toISOString() } : f,
              ),
            };
          }
          return { flows: [...state.flows, flow] };
        }),

      deleteFlow: (id) =>
        set((state) => ({
          flows: state.flows.filter((f) => f.id !== id),
          activeFlowId: state.activeFlowId === id ? null : state.activeFlowId,
        })),

      setActiveFlow: (id) => set({ activeFlowId: id }),

      createFlow: (name) => {
        const now = new Date().toISOString();
        const flow: SavedFlow = {
          id: generateId(),
          name,
          nodes: [],
          edges: [],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          flows: [...state.flows, flow],
          activeFlowId: flow.id,
        }));
        return flow;
      },

      updateFlowNodes: (id, nodes, edges) =>
        set((state) => ({
          flows: state.flows.map((f) =>
            f.id === id
              ? { ...f, nodes, edges, updatedAt: new Date().toISOString() }
              : f,
          ),
        })),

      getActiveFlow: () => {
        const { flows, activeFlowId } = get();
        return flows.find((f) => f.id === activeFlowId) ?? null;
      },
    }),
    { name: 'workflow-composer-flows' },
  ),
);
