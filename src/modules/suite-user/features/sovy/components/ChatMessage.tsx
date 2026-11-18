import { ChatMessage as ChatMessageType } from '../types';
import { cn } from '@/shared/lib/utils';
import { Bot, User, Loader2 } from '@/shared/components/animated-icons';
import Markdown from 'react-markdown';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';
  const isTyping = message.status === 'typing';

  return (
    <div
      className={cn(
        'flex gap-3 mb-4 animate-fade-in duration-300',
        isAssistant ? 'justify-start' : 'justify-end'
      )}
    >
      {isAssistant && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-xl px-4 py-3 shadow-sm',
          isAssistant
            ? 'bg-card border border-border'
            : 'bg-primary text-primary-foreground'
        )}
      >
        {isTyping ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Zentinel está pensando...</span>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <Markdown>{message.content}</Markdown>
          </div>
        )}

        <div
          className={cn(
            'text-xs mt-2 opacity-60',
            isAssistant ? 'text-muted-foreground' : 'text-primary-foreground'
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

      {!isAssistant && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-md">
          <User className="w-5 h-5 text-accent-foreground" />
        </div>
      )}
    </div>
  );
}
