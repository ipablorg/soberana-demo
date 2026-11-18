import { motion } from 'framer-motion';
import type { ConversationMessage } from '../knowledge/types';
import { OsMarkdownRenderer } from './OsMarkdownRenderer';
import { OsRichBlock } from './OsRichBlock';

interface OsMessageProps {
  message: ConversationMessage;
  isStreaming?: boolean;
}

export function OsMessage({ message, isStreaming }: OsMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' as const }}
      className={`flex gap-3 px-4 py-2 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="shrink-0 mt-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm">
            ✨
          </div>
        </div>
      )}

      <div
        className={
          isUser
            ? 'bg-primary text-primary-foreground rounded-xl rounded-br-sm px-4 py-3 max-w-[80%]'
            : 'bg-secondary/50 rounded-xl rounded-bl-sm px-4 py-3 max-w-[85%]'
        }
      >
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <div className="relative">
            <OsMarkdownRenderer content={message.content} />
            {!isStreaming && message.richBlocks && message.richBlocks.length > 0 && (
              <div className="mt-2">
                {message.richBlocks.map((block, i) => (
                  <OsRichBlock key={i} block={block} />
                ))}
              </div>
            )}
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-primary/70 ml-0.5 animate-pulse rounded-sm align-text-bottom" />
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="shrink-0 mt-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
            You
          </div>
        </div>
      )}
    </motion.div>
  );
}
