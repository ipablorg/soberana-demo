import { create } from 'zustand';
import { ChatMessage } from '../types';

interface SovyState {
  messages: ChatMessage[];
  isOpen: boolean;
  sessionId: string;
  addMessage: (message: ChatMessage) => void;
  updateMessageStatus: (id: string, status: ChatMessage['status']) => void;
  clearMessages: () => void;
  setIsOpen: (isOpen: boolean) => void;
  initializeSession: () => void;
}

export const useSovyStore = create<SovyState>((set) => ({
  messages: [],
  isOpen: false,
  sessionId: crypto.randomUUID(),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateMessageStatus: (id, status) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, status } : msg
      ),
    })),

  clearMessages: () =>
    set({
      messages: [],
      sessionId: crypto.randomUUID(),
    }),

  setIsOpen: (isOpen) => set({ isOpen }),

  initializeSession: () =>
    set({
      sessionId: crypto.randomUUID(),
      messages: [],
    }),
}));
