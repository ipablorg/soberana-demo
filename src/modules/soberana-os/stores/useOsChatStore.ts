import { create } from 'zustand';
import type { ConversationMessage, RichBlock } from '../knowledge/types';
import { knowledgeBase } from '../knowledge/knowledge-base';
import { findBestMatch } from '../knowledge/topic-matcher';

interface OsChatState {
  messages: ConversationMessage[];
  isTyping: boolean;
  isStreaming: boolean;
  streamingMessageId: string | null;
  currentTopic: string | null;
  language: 'en' | 'es';
  hasStarted: boolean;
  sendMessage: (text: string) => void;
  selectSuggestion: (entryId: string) => void;
  setLanguage: (lang: 'en' | 'es') => void;
  reset: () => void;
}

const CHARS_PER_TICK = 3;
const TICK_MS = 12;

function streamResponse(
  fullContent: string,
  messageId: string,
  suggestions: string[],
  topic: string | null,
  richBlocks: RichBlock[] | undefined,
  set: (fn: (state: OsChatState) => Partial<OsChatState>) => void,
) {
  let charIndex = 0;

  const placeholder: ConversationMessage = {
    id: messageId,
    role: 'soberana',
    content: '',
    timestamp: new Date(),
    suggestions: [],
  };

  set((state) => ({
    messages: [...state.messages, placeholder],
    isTyping: false,
    isStreaming: true,
    streamingMessageId: messageId,
  }));

  const interval = setInterval(() => {
    charIndex += CHARS_PER_TICK;
    const isDone = charIndex >= fullContent.length;
    const visibleContent = isDone ? fullContent : fullContent.slice(0, charIndex);

    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId
          ? {
              ...m,
              content: visibleContent,
              suggestions: isDone ? suggestions : [],
              richBlocks: isDone ? richBlocks : undefined,
            }
          : m,
      ),
      isStreaming: !isDone,
      streamingMessageId: isDone ? null : messageId,
      currentTopic: isDone ? topic : state.currentTopic,
    }));

    if (isDone) clearInterval(interval);
  }, TICK_MS);
}

export const useOsChatStore = create<OsChatState>((set, get) => ({
  messages: [],
  isTyping: false,
  isStreaming: false,
  streamingMessageId: null,
  currentTopic: null,
  language: 'en',
  hasStarted: false,

  setLanguage: (lang) => set({ language: lang }),

  sendMessage: (text: string) => {
    const { language } = get();

    const userMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isTyping: true,
      hasStarted: true,
    }));

    const match = findBestMatch(text, knowledgeBase);
    const delay = 600 + Math.random() * 400;

    setTimeout(() => {
      const messageId = crypto.randomUUID();

      if (!match) {
        const fallback = knowledgeBase.find((e) => e.id === 'fallback');
        const fullContent = language === 'es' ? (fallback?.responseEs ?? '') : (fallback?.response ?? '');
        streamResponse(fullContent, messageId, fallback?.followUps ?? [], null, undefined, set);
        return;
      }

      const fullContent = language === 'es' ? match.responseEs : match.response;
      const blocks = language === 'es' ? (match.richBlocksEs ?? match.richBlocks) : match.richBlocks;
      streamResponse(fullContent, messageId, match.followUps, match.topic, blocks, set);
    }, delay);
  },

  selectSuggestion: (entryId: string) => {
    const { language } = get();
    const entry = knowledgeBase.find((e) => e.id === entryId);
    if (!entry) return;

    const questionText = language === 'es' ? entry.questionEs : entry.question;

    const userMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: questionText || entryId,
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isTyping: true,
      hasStarted: true,
    }));

    const delay = 600 + Math.random() * 400;

    setTimeout(() => {
      const messageId = crypto.randomUUID();
      const fullContent = language === 'es' ? entry.responseEs : entry.response;
      const blocks = language === 'es' ? (entry.richBlocksEs ?? entry.richBlocks) : entry.richBlocks;
      streamResponse(fullContent, messageId, entry.followUps, entry.topic, blocks, set);
    }, delay);
  },

  reset: () =>
    set({
      messages: [],
      isTyping: false,
      isStreaming: false,
      streamingMessageId: null,
      currentTopic: null,
      hasStarted: false,
    }),
}));
