import { useEffect, useRef, useState } from 'react';
import { useSovyStore } from '../stores/useSovyStore';
import { useSovyMock } from '../hooks/useSovyMock';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SuggestionChips } from './SuggestionChips';
import { AlertCircle } from '@/shared/components/animated-icons';

export function ChatContainer() {
  const { messages, addMessage } = useSovyStore();
  const { getInitialMessage, sendMockMessage, getSuggestions, isTyping, error } = useSovyMock();
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  // Initialize chat with greeting message
  useEffect(() => {
    if (!isInitialized.current && messages.length === 0) {
      const initialMessage = getInitialMessage();
      addMessage(initialMessage);
      setCurrentSuggestions(getSuggestions());
      isInitialized.current = true;
    }
  }, [getInitialMessage, addMessage, getSuggestions, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content,
      timestamp: new Date(),
      status: 'sent' as const,
    };
    addMessage(userMessage);

    // Add typing indicator
    const typingMessage = {
      id: 'typing',
      role: 'assistant' as const,
      content: '',
      timestamp: new Date(),
      status: 'typing' as const,
    };
    addMessage(typingMessage);

    try {
      // Get mock response
      const response = await sendMockMessage(content);
      
      // Remove typing indicator
      const messagesWithoutTyping = useSovyStore.getState().messages.filter(m => m.id !== 'typing');
      useSovyStore.setState({ messages: messagesWithoutTyping });
      
      // Add assistant response
      addMessage(response);
      
      // Update suggestions
      setCurrentSuggestions(getSuggestions(content));
    } catch (err) {
      // Remove typing indicator on error
      const messagesWithoutTyping = useSovyStore.getState().messages.filter(m => m.id !== 'typing');
      useSovyStore.setState({ messages: messagesWithoutTyping });
      
      // Add error message
      const errorMessage = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
        timestamp: new Date(),
        status: 'error' as const,
      };
      addMessage(errorMessage);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {currentSuggestions.length > 0 && !isTyping && (
        <div className="shrink-0 overflow-x-auto scrollbar-hide border-t border-border/50">
          <div className="flex gap-2 px-4 py-2">
            <SuggestionChips
              suggestions={currentSuggestions}
              onSelect={handleSuggestionClick}
              disabled={isTyping}
            />
          </div>
        </div>
      )}

      {/* Input area */}
      <ChatInput onSend={handleSendMessage} disabled={isTyping} />
    </div>
  );
}
