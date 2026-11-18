/**
 * IntegrationCard — marketplace card for an external API integration.
 *
 * Generic by design: Loopay X is the first real consumer, but the
 * same card pattern services future integrations (Bridge KYC,
 * Persona, Openfort, banking rails). The card composes existing
 * `ui/` primitives (`Card`, `Switch`, `Badge`, `Button`) — no new
 * styling system, no parallel components.
 *
 * The optional `highlight` prop swaps the underlying `<Card>` to
 * `variant="gradient-thin"` so an active brand integration reads as
 * a brand moment via the canonical 1px Loopay rim. No manual wrapper
 * — single source of truth lives in `card.tsx`.
 */

import type { ReactNode } from 'react';
import { useLingui } from '@lingui/react/macro';

import { ArrowRight, Loader2, type IconComponent } from '@/shared/components/animated-icons';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardFooter } from '@/shared/components/ui/card';
import { Switch } from '@/shared/components/ui/switch';
import { cn } from '@/shared/lib/utils';

export type IntegrationStatus = 'available' | 'connected' | 'coming-soon' | 'beta';

export interface IntegrationCardProps {
  id: string;
  name: string;
  /** Single-line value proposition. */
  tagline: string;
  /** 2-3 line longer description. */
  description: string;
  /** Hero image URL (16:9 aspect). */
  heroImage?: string;
  /**
   * Layout for the hero image.
   * - `cover` (default): photo-style, fills the area.
   * - `logo`: centered with padding on a solid background (good for
   *   brand marks rendered as SVG/PNG with transparency).
   */
  heroLayout?: 'cover' | 'logo';
  /**
   * Background applied behind the hero when `heroLayout="logo"`.
   * Accepts any valid CSS color or var. Defaults to the canonical
   * `var(--card)` token so brand marks read on-system without
   * introducing a hardcoded black plate.
   */
  heroBackground?: string;
  /** Logo URL (used as small chip; optional). */
  logo?: string;
  /** Lucide-animated icon used when no logo is provided. */
  fallbackIcon?: IconComponent;
  /** Custom content rendered inside the hero area. Takes priority over heroImage. */
  heroContent?: ReactNode;
  status: IntegrationStatus;
  enabled: boolean;
  busy?: boolean;
  onToggle?: (next: boolean) => void;
  onConfigure?: () => void;
  highlight?: boolean;
}

export function IntegrationCard({
  name,
  tagline,
  description,
  heroImage,
  heroLayout = 'cover',
  heroBackground,
  heroContent,
  logo,
  fallbackIcon: FallbackIcon,
  status,
  enabled,
  busy = false,
  onToggle,
  onConfigure,
  highlight = false,
}: IntegrationCardProps) {
  const { t } = useLingui();
  const isComingSoon = status === 'coming-soon';

  return (
    <Card
      variant={highlight ? 'gradient-thin' : 'default'}
      className={cn(
        // No `overflow-hidden` on the root: when `variant="gradient-thin"`
        // the rim sits 1px outside the bbox via `::before { inset: -1px }`
        // and would be clipped. The hero div below clips its own
        // background/image with `rounded-t-xl overflow-hidden`.
        'h-full flex flex-col',
        isComingSoon && 'opacity-70'
      )}
    >
      <div
        className={cn(
          'aspect-video relative overflow-hidden rounded-t-xl',
          heroLayout === 'logo' ? '' : 'bg-muted'
        )}
        style={
          heroLayout === 'logo' ? { backgroundColor: heroBackground ?? 'var(--card)' } : undefined
        }
      >
        {heroContent ? (
          <div className="h-full w-full flex items-center justify-center">{heroContent}</div>
        ) : heroImage ? (
          <img
            src={heroImage}
            alt={name}
            className={cn(
              'absolute inset-0',
              heroLayout === 'logo'
                ? 'm-auto h-1/2 w-auto max-w-[60%] object-contain'
                : 'h-full w-full object-cover'
            )}
          />
        ) : (
          <div className="absolute inset-0 bg-brand-gradient-soft" aria-hidden />
        )}
      </div>

      <CardContent className="flex-1 pt-6 pb-2 space-y-4">
        <div className="flex items-center gap-3">
          {logo ? (
            <img src={logo} alt="" className="h-8 w-8 rounded-md" />
          ) : FallbackIcon ? (
            <span className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
              <FallbackIcon className="h-4 w-4 text-foreground" />
            </span>
          ) : null}
          <h3 className="text-lg font-semibold leading-none tracking-tight flex-1">{name}</h3>
          <StatusBadge status={status} />
        </div>

        <p className="text-sm font-medium text-foreground">{tagline}</p>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-prose">{description}</p>
      </CardContent>

      <CardFooter className="border-t border-border/60 pt-5 pb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Switch
              checked={enabled}
              disabled={isComingSoon || !onToggle}
              onCheckedChange={(next) => onToggle?.(next)}
              aria-label={t`Activar integración`}
            />
          )}
          <span className="text-xs text-muted-foreground">
            {isComingSoon ? t`Próximamente` : enabled ? t`Activo` : t`Inactivo`}
          </span>
        </div>
        {onConfigure && !isComingSoon && (
          <Button variant="ghost" size="sm" onClick={onConfigure} className="gap-1">
            {t`Configurar`}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function StatusBadge({ status }: { status: IntegrationStatus }) {
  const { t } = useLingui();
  if (status === 'connected') {
    return <Badge variant="success">{t`Conectado`}</Badge>;
  }
  if (status === 'coming-soon') {
    return <Badge variant="secondary">{t`Pronto`}</Badge>;
  }
  if (status === 'beta') {
    return <Badge variant="warning">Beta</Badge>;
  }
  return <Badge variant="outline">{t`Disponible`}</Badge>;
}
