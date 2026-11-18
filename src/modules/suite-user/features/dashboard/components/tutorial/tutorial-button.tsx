/**
 * TutorialButton
 *
 * "Ver tour" button for the AppTopbar rightSlot. Renders only on the
 * dashboard route. Clicking it opens the DashboardTutorial from the
 * beginning, regardless of previous completion state (on-demand reopen).
 *
 * On-demand behavior:
 * - If tutorial is in progress → re-open from step 0.
 * - If tutorial was completed/skipped → still re-opens (on-demand is always available).
 *   The completion/skip flags only prevent AUTO-triggering on the next visit.
 */

import { Trans } from '@lingui/react/macro';
import { Sparkles } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { useTutorialStore } from '../../stores/useTutorialStore';

export function TutorialButton() {
  const open = useTutorialStore((s) => s.open);

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5 text-header-foreground hover:bg-white/10 h-8 px-2"
      onClick={open}
      aria-label="Abrir tutorial guiado"
    >
      <Sparkles className="h-3.5 w-3.5" aria-hidden />
      <span className="hidden sm:inline text-xs">
        <Trans>Ver tour</Trans>
      </span>
    </Button>
  );
}
