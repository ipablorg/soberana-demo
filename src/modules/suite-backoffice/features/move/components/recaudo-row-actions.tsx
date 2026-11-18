/**
 * Row actions of the manual deposit queue: compact circular icon buttons.
 *
 * Approve (check) and reject (X) show on pending deposits; reverse (undo) shows
 * only on credited ones. Every button is labelled for assistive tech and
 * repeats the label in a tooltip because the glyph alone is not self-evident.
 */

import { useLingui } from '@lingui/react/macro';

import {
  Check,
  RotateCcw,
  X,
  type IconComponent,
} from '@/shared/components/animated-icons';
import type { AdminRecaudo } from '@/graphql/types/admin-loopay';
import { Button, type ButtonProps } from '@/shared/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';

import {
  availableRecaudoActions,
  type RecaudoAction,
} from '../lib/recaudo-actions';

interface ActionAppearance {
  variant: ButtonProps['variant'];
  Icon: IconComponent;
}

const ACTION_APPEARANCE: Record<RecaudoAction, ActionAppearance> = {
  approve: { variant: 'success', Icon: Check },
  reject: { variant: 'destructive', Icon: X },
  reverse: { variant: 'secondary', Icon: RotateCcw },
};

interface RecaudoRowActionsProps {
  recaudo: AdminRecaudo;
  disabled: boolean;
  onAction: (action: RecaudoAction, recaudo: AdminRecaudo) => void;
}

export function RecaudoRowActions({
  recaudo,
  disabled,
  onAction,
}: RecaudoRowActionsProps) {
  const { t } = useLingui();

  const labels: Record<RecaudoAction, string> = {
    approve: t`Aprobar`,
    reject: t`Rechazar`,
    reverse: t`Reversar`,
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center gap-2">
        {availableRecaudoActions(recaudo.status).map((action) => {
          const { variant, Icon } = ACTION_APPEARANCE[action];

          return (
            <Tooltip key={action}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={variant}
                  size="icon-sm"
                  className="rounded-full"
                  aria-label={labels[action]}
                  disabled={disabled}
                  onClick={() => onAction(action, recaudo)}
                >
                  <Icon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{labels[action]}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
