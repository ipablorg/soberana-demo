import { create } from 'zustand';
import type { AgentMessage } from '@/shared/types/agentic';

export interface ResearchStep {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  timestamp: Date;
  details?: string;
}

export interface Operation {
  id: string;
  title: string;
  timestamp: Date;
  messages: AgentMessage[];
  steps: ResearchStep[];
}

interface AgenticChatState {
  isOpen: boolean;
  currentOperationId: string | null;
  operations: Operation[];
  open: () => void;
  close: () => void;
  toggle: () => void;
  toggleChat: () => void;
  addMessage: (message: Omit<AgentMessage, 'id' | 'timestamp'>) => void;
  addStep: (step: Omit<ResearchStep, 'id' | 'timestamp'>) => void;
  updateStep: (stepId: string, updates: Partial<ResearchStep>) => void;
  createOperation: (title: string) => void;
  setCurrentOperation: (id: string) => void;
  deleteOperation: (id: string) => void;
  clear: () => void;
  clearHistory: () => void;
}

const defaultOperation: Operation = {
  id: 'default',
  title: 'Nueva Operación',
  timestamp: new Date(),
  messages: [],
  steps: [],
};

export const useAgenticChat = create<AgenticChatState>((set, _get) => ({
  isOpen: false,
  currentOperationId: 'default',
  operations: [defaultOperation],
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  toggleChat: () => set((s) => ({ isOpen: !s.isOpen })),
  
  addMessage: (msg) =>
    set((state) => {
      const currentId = state.currentOperationId || 'default';
      const operations = state.operations.map((op) =>
        op.id === currentId
          ? {
              ...op,
              messages: [
                ...op.messages,
                {
                  ...msg,
                  id: `msg-${Date.now()}`,
                  timestamp: new Date(),
                },
              ],
            }
          : op
      );
      return { operations };
    }),
    
  addStep: (step) =>
    set((state) => {
      const currentId = state.currentOperationId || 'default';
      const operations = state.operations.map((op) =>
        op.id === currentId
          ? {
              ...op,
              steps: [
                ...op.steps,
                {
                  ...step,
                  id: `step-${Date.now()}`,
                  timestamp: new Date(),
                },
              ],
            }
          : op
      );
      return { operations };
    }),
    
  updateStep: (stepId, updates) =>
    set((state) => {
      const currentId = state.currentOperationId || 'default';
      const operations = state.operations.map((op) =>
        op.id === currentId
          ? {
              ...op,
              steps: op.steps.map((step) =>
                step.id === stepId ? { ...step, ...updates } : step
              ),
            }
          : op
      );
      return { operations };
    }),
    
  createOperation: (title) =>
    set((state) => {
      const newOp: Operation = {
        id: `op-${Date.now()}`,
        title,
        timestamp: new Date(),
        messages: [],
        steps: [],
      };
      return {
        operations: [newOp, ...state.operations],
        currentOperationId: newOp.id,
      };
    }),
    
  setCurrentOperation: (id) => set({ currentOperationId: id }),
  
  deleteOperation: (id) =>
    set((state) => {
      const filteredOps = state.operations.filter(op => op.id !== id);
      // If we're deleting the current operation, switch to another one
      const newCurrentId = state.currentOperationId === id 
        ? (filteredOps.length > 0 ? filteredOps[0].id : 'default')
        : state.currentOperationId;
      
      // If no operations left, create a default one
      if (filteredOps.length === 0) {
        return { 
          operations: [defaultOperation], 
          currentOperationId: 'default' 
        };
      }
      
      return { 
        operations: filteredOps, 
        currentOperationId: newCurrentId 
      };
    }),
  
  clear: () =>
    set((state) => {
      const currentId = state.currentOperationId || 'default';
      const operations = state.operations.map((op) =>
        op.id === currentId
          ? { ...op, messages: [defaultOperation.messages[0]], steps: [] }
          : op
      );
      return { operations };
    }),
    
  clearHistory: () => set({ operations: [defaultOperation], currentOperationId: 'default' }),
}));


