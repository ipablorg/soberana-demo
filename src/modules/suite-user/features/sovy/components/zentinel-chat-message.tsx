/**
 * Renders a single message from the real Zentinel chat.
 *
 * Difference from the legacy `<ChatMessage>`:
 * - Accepts our `ZentinelChatMessage` (includes `tools_used`,
 *   `pending_action`, `plan_resolution`).
 * - When `message.pending_action` is set and unresolved, defers
 *   rendering to `<ZentinelConfirmationCard>` (rendered by the view,
 *   not this component — see view for rationale). Here we render the
 *   normal bubble with its preamble text; the card sits *after* it.
 * - On `plan_resolution === 'executed' | 'cancelled' | 'expired'` the
 *   bubble tacks on a small semantic footer so history reads cleanly.
 *
 * Visual contract (Soberana §3 — Instagram-grade refresh):
 * - Assistant bubble: `bg-card border border-border` (unchanged) — the
 *   asymmetry (gradient vs surface) is what makes the chat read like
 *   Instagram/iMessage.
 * - User bubble: `bg-brand-gradient text-white` with `rounded-br-md`
 *   so the corner "anchors" toward the avatar. Hour stamp uses
 *   `text-white/70` (still tabular-nums) so it remains legible on the
 *   gradient without competing with the message body.
 * - Assistant avatar: gradient brand circle, white Bot icon.
 * - Streaming state: `<ZentinelThinkingIndicator>` — typing dots that
 *   dance + a rotating copy line that cycles every 2.5s. Respects
 *   `useReducedMotion()` (no dot bounce / no copy rotation).
 */

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Bot, User } from '@/shared/components/animated-icons';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import Markdown from 'react-markdown';
import { useLingui } from '@lingui/react/macro';
import type { ZentinelChatMessage as ZentinelChatMessageData } from '../stores/use-zentinel-chat-store';
import { ZentinelSecurityCard } from './zentinel-security-card';
// Alias the data type to avoid shadowing the component's own identifier
// which is also exported as `ZentinelChatMessage` (value namespace).

interface ZentinelChatMessageProps {
  message: ZentinelChatMessageData;
}

/**
 * Streaming-state indicator: three dancing dots (iMessage / Instagram
 * cadence) plus a rotating copy line so the wait feels alive instead
 * of generic. Co-located here because it has no other consumer.
 *
 * The copy rotates every 2500ms via a single `setInterval` with a
 * cleanup. We freeze the copy list per-mount with `useMemo` so the
 * locale catalog only resolves once per stream instead of on every
 * render. With reduced-motion preference active we drop the dots'
 * bounce, the rotation, and the copy reshuffle — only the first
 * line is shown, untouched.
 */
function ZentinelThinkingIndicator() {
  const { t } = useLingui();
  const reducedMotion = useReducedMotion() ?? false;

  const states = useMemo(
    () => [
      t`Zentinel está pensando…`,
      t`Consultando tu tesorería…`,
      t`Analizando movimientos…`,
      t`Preparando respuesta…`,
    ],
    [t],
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % states.length);
    }, 2500);
    return () => window.clearInterval(id);
  }, [reducedMotion, states.length]);

  return (
    <div className="flex items-center gap-2 py-0.5">
      <div className="flex gap-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block h-1.5 w-1.5 rounded-full bg-muted-foreground"
            animate={
              reducedMotion
                ? { y: 0, opacity: 0.7 }
                : { y: [0, -3, 0], opacity: [0.4, 1, 0.4] }
            }
            transition={
              reducedMotion
                ? { duration: 0 }
                : {
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeInOut',
                  }
            }
          />
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={reducedMotion ? 'static' : index}
          className="text-[12px] italic text-muted-foreground"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {states[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export function ZentinelChatMessage({ message }: ZentinelChatMessageProps) {
  const { t } = useLingui();
  const is_assistant = message.role === 'assistant';
  const is_streaming =
    message.status === 'streaming' && message.content.length === 0;
  const resolution = message.plan_resolution;
  const security_block = message.security_block;

  // Charlie incident — render the dedicated card in place of the
  // Markdown bubble. We keep the assistant avatar so the transcript
  // still reads as "from Zentinel", but the security card is wider
  // (no max-w cap on bubbles, only the standard 82%) and uses its own
  // surface tokens. See FRONTEND_PRODUCTION_CONNECTION.md §4 / Check 4.
  if (is_assistant && security_block) {
    return (
      <div className="flex gap-2 animate-fade-in duration-300 justify-start">
        <div className="shrink-0 w-7 h-7 rounded-full bg-brand-gradient flex items-center justify-center">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="max-w-[82%]">
          <ZentinelSecurityCard block={security_block} />
          <div className="text-[10px] mt-1 tabular-nums text-muted-foreground opacity-60">
            {new Date(message.timestamp).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-2 animate-fade-in duration-300',
        is_assistant ? 'justify-start' : 'justify-end',
      )}
    >
      {is_assistant && (
        <div className="shrink-0 w-7 h-7 rounded-full bg-brand-gradient flex items-center justify-center">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[82%] rounded-xl px-3 py-2 font-body text-[13px] leading-snug shadow-sm',
          is_assistant
            ? 'bg-card border border-border text-card-foreground rounded-bl-md'
            : 'bg-brand-gradient text-white rounded-br-md',
          message.status === 'error' &&
            'border-destructive/40 bg-destructive/10 text-destructive shadow-none',
        )}
      >
        {is_streaming ? (
          <ZentinelThinkingIndicator />
        ) : (
          <div
            className={cn(
              'max-w-none',
              // Compact markdown: tight line-height, smaller headings,
              // bullet indent trimmed, no oversized paragraph margins.
              '[&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
              '[&_strong]:font-semibold [&_strong]:text-foreground',
              '[&_ul]:my-1.5 [&_ul]:pl-4 [&_ol]:my-1.5 [&_ol]:pl-4',
              '[&_li]:my-0.5 [&_li]:marker:text-muted-foreground',
              '[&_h1]:text-sm [&_h1]:font-semibold [&_h1]:mt-2 [&_h1]:mb-1',
              '[&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-2 [&_h2]:mb-1',
              '[&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1',
              '[&_code]:font-mono [&_code]:text-[12px] [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded',
              '[&_a]:underline [&_a]:decoration-dotted',
              !is_assistant && '[&_strong]:text-white',
            )}
          >
            <Markdown>{message.content}</Markdown>
          </div>
        )}

        {message.tools_used && message.tools_used.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {message.tools_used.map((tool, i) => (
              <Badge
                key={`${tool}-${i}`}
                variant="secondary"
                className="text-[9px] font-mono h-4 px-1.5"
              >
                {tool}
              </Badge>
            ))}
          </div>
        )}

        {resolution && (
          <div
            className={cn(
              'mt-1.5 text-[11px]',
              resolution === 'executed'
                ? 'text-success'
                : resolution === 'cancelled'
                  ? 'text-muted-foreground'
                  : 'text-warning',
            )}
          >
            {resolution === 'executed' && t`Plan ejecutado.`}
            {resolution === 'cancelled' && t`Plan cancelado.`}
            {resolution === 'expired' && t`El plan expiró.`}
          </div>
        )}

        <div
          className={cn(
            'text-[10px] mt-1 tabular-nums',
            is_assistant ? 'text-muted-foreground opacity-60' : 'text-white/70',
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

      {!is_assistant && (
        <div className="shrink-0 w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-foreground" />
        </div>
      )}
    </div>
  );
}
