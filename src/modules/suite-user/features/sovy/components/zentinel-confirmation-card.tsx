/**
 * Inline plan-confirmation card rendered inside the Zentinel chat
 * stream, below the assistant message that produced the plan.
 *
 * UX principles (CLAUDE.md §3 + §4):
 * - NOT a modal: it's an operational bubble, same width as chat
 *   content, so the conversation flow is not interrupted.
 * - `rounded-xl border-border bg-card` — card treatment; no brand
 *   gradient rim (brand moments stay on the phone frame).
 * - Primary CTA: `<Button variant="gradient">Confirmar</Button>`;
 *   secondary: `<Button variant="ghost">Cancelar</Button>` (§4).
 * - Countdown uses `font-mono tabular-nums` for stable digits.
 * - All strings are `t` / `<Trans>` wrapped for i18n.
 *
 * The card is *not* in charge of the confirm/cancel lifecycle —
 * `use-zentinel-pending-action` owns it. This component is pure:
 * it displays `action`, shows `time_left_ms`, and emits two callbacks.
 */

import { useMemo } from 'react';
import { Loader2 } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { useLingui } from '@lingui/react/macro';
import type { PendingAction } from '@/shared/lib/zentinel-client';

interface ZentinelConfirmationCardProps {
  action: PendingAction;
  time_left_ms: number;
  is_executing: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Flatten `input_params` into a list of `[label, value]` pairs. The
 * backend nests user-intended inputs under `input.*` for GraphQL
 * mutations, so we walk one level deep when we see that shape. For
 * anything else we show top-level keys as-is.
 *
 * Primitive leaves render directly; objects render their JSON so the
 * user at least sees the shape (this is the plan preview, not the
 * final UI of the operation). We avoid deep recursion on purpose:
 * readability > completeness for a 5-minute decision surface.
 */
function flattenParams(
  input_params: Record<string, unknown>,
): Array<{ label: string; value: string }> {
  const pairs: Array<{ label: string; value: string }> = [];

  const push = (label: string, raw: unknown): void => {
    if (raw == null) return;
    const value =
      typeof raw === 'object' ? JSON.stringify(raw) : String(raw);
    pairs.push({ label, value });
  };

  const top_level = input_params as Record<string, unknown>;
  const maybe_input =
    typeof top_level.input === 'object' && top_level.input != null
      ? (top_level.input as Record<string, unknown>)
      : null;

  if (maybe_input) {
    for (const [k, v] of Object.entries(maybe_input)) push(k, v);
    for (const [k, v] of Object.entries(top_level)) {
      if (k !== 'input') push(k, v);
    }
  } else {
    for (const [k, v] of Object.entries(top_level)) push(k, v);
  }

  return pairs;
}

function formatCountdown(ms: number): string {
  const total_s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total_s / 60);
  const s = total_s - m * 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ZentinelConfirmationCard({
  action,
  time_left_ms,
  is_executing,
  error,
  onConfirm,
  onCancel,
}: ZentinelConfirmationCardProps) {
  const { t } = useLingui();
  const pairs = useMemo(
    () => flattenParams(action.preview.input_params ?? {}),
    [action.preview.input_params],
  );
  const countdown = formatCountdown(time_left_ms);
  const expiring_soon = time_left_ms > 0 && time_left_ms < 30_000;

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4',
        'transition-colors duration-150',
      )}
      role="region"
      aria-label={t`Confirmación de acción`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {t`Plan pendiente`}
          </p>
          <p className="text-sm font-heading font-medium text-foreground mt-1">
            {action.preview.summary}
          </p>
        </div>
        <span
          className={cn(
            'shrink-0 font-mono tabular-nums text-xs px-2 py-1 rounded-md',
            expiring_soon
              ? 'bg-warning/10 text-warning'
              : 'bg-muted text-muted-foreground',
          )}
          aria-live="polite"
        >
          {t`Expira en ${countdown}`}
        </span>
      </div>

      {pairs.length > 0 && (
        <dl className="mt-3 grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-xs">
          {pairs.map(({ label, value }) => (
            <div key={label} className="contents">
              <dt className="text-muted-foreground">
                {humanizeKey(label)}
              </dt>
              <dd className="font-mono tabular-nums text-foreground truncate">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {error && (
        <p className="mt-3 text-xs text-destructive">{error}</p>
      )}

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={is_executing}
        >
          {t`Cancelar`}
        </Button>
        <Button
          type="button"
          variant="gradient"
          size="sm"
          onClick={onConfirm}
          disabled={is_executing || time_left_ms <= 0}
        >
          {is_executing && <Loader2 className="animate-spin" />}
          {t`Confirmar`}
        </Button>
      </div>
    </div>
  );
}
