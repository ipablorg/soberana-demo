/**
 * Composer input for the Zentinel chat.
 *
 * Visual contract (Soberana §3 — Instagram-grade refresh):
 * - Wrapper: `rounded-xl border border-border bg-card shadow-sm` —
 *   the textarea and the send button share a single elevated card so
 *   the composer reads as one prominent affordance instead of two
 *   adjacent controls.
 * - Textarea: borderless inside the wrapper, transparent bg, focus
 *   ring suppressed (the wrapper owns the border treatment).
 *   Minimum height is 44px to match touch-target ergonomics.
 * - Send button: gradient when there is content (`variant="gradient"`,
 *   the only place in this view where the brand gradient appears as a
 *   "primary action"), ghost when empty/disabled. Animated entrance
 *   from `motion.div` so the button feels responsive without using
 *   spring physics (forbidden by §3.5).
 *
 * Accessibility:
 * - Hint line below the form is `<Trans>`-wrapped (i18n).
 * - Disabled state: button is dimmed via the existing `disabled:`
 *   utilities on `<Button>`; no aria changes needed.
 */
import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trans } from '@lingui/react/macro';
import { Send, Loader2 } from '@/shared/components/animated-icons';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled,
  placeholder = 'Escribe tu consulta sobre tesorería...',
}: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const has_text = input.trim().length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border/60 bg-background px-3 py-3"
    >
      <div
        className={cn(
          'flex items-end gap-2 rounded-xl border border-border bg-card px-2 py-1.5 shadow-sm transition-colors duration-150',
          'focus-within:border-ring/60',
        )}
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            'flex-1 resize-none border-0 bg-transparent px-2 py-2 text-[13px] leading-snug shadow-none',
            'focus-visible:ring-0 focus-visible:ring-offset-0',
            'min-h-[44px] max-h-[120px]',
          )}
        />

        <AnimatePresence mode="wait" initial={false}>
          {has_text && !disabled ? (
            <motion.div
              key="send-active"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="shrink-0"
            >
              <Button
                type="submit"
                size="icon"
                variant="gradient"
                className="h-9 w-9 rounded-lg"
                aria-label="Send"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="send-idle"
              initial={false}
              animate={{ opacity: 1 }}
              className="shrink-0"
            >
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                disabled={disabled || !has_text}
                className="h-9 w-9 rounded-lg text-muted-foreground"
                aria-label="Send"
              >
                {disabled ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-1.5 px-1 text-[10px] text-muted-foreground/70">
        <Trans>Enter para enviar · Shift+Enter para nueva línea</Trans>
      </p>
    </form>
  );
}
