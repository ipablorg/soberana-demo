import { motion } from 'framer-motion';
import { Bot } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';

export interface Message {
  role: 'user' | 'sovy';
  content: string;
}

export interface ConversationExampleProps {
  messages: Message[];
  className?: string;
}

const bubbleVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.15, ease: 'easeOut' as const },
  }),
};

export function ConversationExample({
  messages,
  className,
}: ConversationExampleProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {messages.map((msg, i) => {
        const isUser = msg.role === 'user';

        return (
          <motion.div
            key={i}
            className={cn(
              'flex items-end gap-2 max-w-[85%]',
              isUser ? 'self-end flex-row-reverse' : 'self-start',
            )}
            variants={bubbleVariants}
            initial="hidden"
            animate="visible"
            custom={i}
          >
            {!isUser && (
              <div className="shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                <Bot className="h-4 w-4 text-muted-foreground" />
              </div>
            )}

            <div
              className={cn(
                'rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line',
                isUser
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-card border border-border text-card-foreground rounded-bl-md',
              )}
            >
              {msg.content}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
