/**
 * ZentinelSecurityCard — renders a Charlie guardrail incident inline
 * inside the chat transcript.
 *
 * Origin contract (FRONTEND_PRODUCTION_CONNECTION.md §4):
 *  - The backend returns 200 OK with a `securityBlock` field on
 *    `/chat/message`, OR an `event: security_block` SSE frame on
 *    `/chat/stream`. Either path lands in `message.security_block` via
 *    `useZentinelChat` and triggers this component instead of the
 *    Markdown bubble.
 *  - `block.message` is pre-redacted by Charlie — render it verbatim
 *    (no Markdown processing, no t() wrapping). Header/footer chrome
 *    is the only translatable surface.
 *  - `block.incident_id` is the support escalation handle — Check 5
 *    of the audit explicitly requires it to be visible AND copiable.
 *
 * Visual contract (Soberana §3.1 / §3.3 / §3.5):
 *  - Severity → tone mapping:
 *      low / medium                   → warning  (border-warning/40,
 *                                         bg-warning/10, text-warning)
 *      high / critical / malicious   → destructive (border-destructive
 *                                         /40, bg-destructive/10,
 *                                         text-destructive)
 *  - rounded-xl (cards), border, no shadow-glow.
 *  - transition-colors duration-150 — never `transition-all` or
 *    `hover:scale-*`.
 *  - Icon `ShieldAlert` from `@/shared/components/animated-icons`.
 */

import { useState } from 'react';
import { ShieldAlert } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { useLingui } from '@lingui/react/macro';
import type { SecurityBlock } from '@/shared/lib/zentinel-client';

interface ZentinelSecurityCardProps {
  block: SecurityBlock;
  className?: string;
}

type ToneClasses = {
  border: string;
  surface: string;
  text: string;
  icon: string;
  /** Footer (incidentId + severity) text colour. */
  meta: string;
};

const WARNING_TONE: ToneClasses = {
  border: 'border-warning/40',
  surface: 'bg-warning/10',
  text: 'text-foreground',
  icon: 'text-warning',
  meta: 'text-warning',
};

const DESTRUCTIVE_TONE: ToneClasses = {
  border: 'border-destructive/40',
  surface: 'bg-destructive/10',
  text: 'text-foreground',
  icon: 'text-destructive',
  meta: 'text-destructive',
};

function toneFor(severity: SecurityBlock['severity']): ToneClasses {
  // low / medium ride the warning palette so they don't visually scream
  // for a benign forbidden-topic block. high+ jumps to destructive so
  // the user understands the agent flagged a real risk.
  if (severity === 'low' || severity === 'medium') return WARNING_TONE;
  return DESTRUCTIVE_TONE;
}

export function ZentinelSecurityCard({
  block,
  className,
}: ZentinelSecurityCardProps) {
  const { t } = useLingui();
  const tone = toneFor(block.severity);
  const [copied, setCopied] = useState(false);

  const short_id = block.incident_id
    ? block.incident_id.slice(0, 8)
    : 'unknown';

  const handle_copy = async () => {
    if (!block.incident_id) return;
    try {
      await navigator.clipboard.writeText(block.incident_id);
      setCopied(true);
      // Reset the visual feedback after a short window so the button
      // is re-actionable if the user accidentally cleared the clipboard.
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail in non-secure contexts or sandboxed
      // iframes; we silently no-op rather than surface a toast,
      // because the id is already on screen for manual copy.
    }
  };

  return (
    <div
      className={cn(
        'rounded-xl border px-3 py-2.5 transition-colors duration-150',
        tone.border,
        tone.surface,
        tone.text,
        className,
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <ShieldAlert
          className={cn('h-4 w-4 shrink-0', tone.icon)}
          aria-hidden
        />
        <div className="font-body text-[12px] font-semibold leading-snug">
          {t`Charlie · Incidente de seguridad`}
        </div>
      </div>

      <p className="mt-1.5 font-body text-[13px] leading-snug whitespace-pre-line">
        {block.message}
      </p>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span
          className={cn(
            'font-mono text-[10px] tabular-nums',
            tone.meta,
          )}
        >
          {t`Incidente #${short_id} · ${block.severity}`}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handle_copy}
          disabled={!block.incident_id}
          className="h-6 px-2 text-[11px] font-medium"
        >
          {copied ? t`ID copiado` : t`Copiar ID`}
        </Button>
      </div>
    </div>
  );
}
