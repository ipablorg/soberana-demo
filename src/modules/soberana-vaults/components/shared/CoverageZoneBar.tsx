/**
 * CoverageZoneBar — Visual LP range with zones
 * Shows DEAD_ZONE / VIGILANCIA / HEDGE_LONG / HEDGE_SHORT zones
 */

import { cn } from '@/shared/lib/utils';
import type { CoverageZonesSection } from '../../types/vaults.types';

interface CoverageZoneBarProps {
  zones: CoverageZonesSection;
  className?: string;
}

function pct(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

export function CoverageZoneBar({ zones, className }: CoverageZoneBarProps) {
  const {
    lower_bound: lb,
    upper_bound: ub,
    precio_actual: price,
    hedge_long_activation_price: longAct,
    hedge_short_activation_price: shortAct,
    zona_actual: zona,
  } = zones;

  if (!lb || !ub || !price) {
    return (
      <div className={cn('h-10 animate-pulse rounded-lg bg-muted', className)} />
    );
  }

  const pricePct = pct(price, lb, ub);
  const longActPct = longAct ? pct(longAct, lb, ub) : null;
  const shortActPct = shortAct ? pct(shortAct, lb, ub) : null;

  const zonaBadgeClass =
    zona === 'DEAD_ZONE'
      ? 'bg-muted text-muted-foreground'
      : zona === 'HEDGE_LONG'
        ? 'bg-success/20 text-success'
        : zona === 'HEDGE_SHORT'
          ? 'bg-destructive/20 text-destructive'
          : 'bg-warning/20 text-warning';

  return (
    <div className={cn('space-y-2', className)}>
      {/* Zone labels */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>${lb.toFixed(2)}</span>
        <span
          className={cn(
            'rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide',
            zonaBadgeClass,
          )}
        >
          {zona ?? 'MONITOREO'}
        </span>
        <span>${ub.toFixed(2)}</span>
      </div>

      {/* Bar */}
      <div className="relative h-8 overflow-visible rounded-lg bg-muted">
        {/* HEDGE_SHORT zone (left — near lower bound) */}
        {shortActPct !== null && (
          <div
            className="absolute inset-y-0 left-0 rounded-l-lg bg-destructive/20"
            style={{ width: `${shortActPct}%` }}
          />
        )}

        {/* HEDGE_LONG zone (right — near upper bound) */}
        {longActPct !== null && (
          <div
            className="absolute inset-y-0 right-0 rounded-r-lg bg-success/20"
            style={{ width: `${100 - longActPct}%` }}
          />
        )}

        {/* SHORT activation line */}
        {shortActPct !== null && (
          <div
            className="absolute inset-y-0 w-px bg-destructive/50"
            style={{ left: `${shortActPct}%` }}
          />
        )}

        {/* LONG activation line */}
        {longActPct !== null && (
          <div
            className="absolute inset-y-0 w-px bg-success/50"
            style={{ left: `${longActPct}%` }}
          />
        )}

        {/* Price marker */}
        <div
          className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transition-colors duration-150"
          style={{ left: `${pricePct}%` }}
        >
          <div className="relative">
            <div className="h-6 w-1.5 rounded-full bg-foreground shadow-sm" />
          </div>
        </div>
      </div>

      {/* Sub-labels */}
      <div className="flex items-end justify-between text-[10px] text-muted-foreground">
        {shortActPct !== null && shortAct ? (
          <span className="text-destructive/70">
            SHORT act. ${shortAct.toFixed(2)}
          </span>
        ) : (
          <span />
        )}
        <span
          className="font-mono font-semibold text-foreground"
          style={{ marginLeft: `calc(${pricePct}% - 24px)` }}
        >
          ${price.toFixed(2)}
        </span>
        {longActPct !== null && longAct ? (
          <span className="text-success/70">
            LONG act. ${longAct.toFixed(2)}
          </span>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
