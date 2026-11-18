import type { ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';

import type { IconComponent } from '@/shared/components/animated-icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { Button } from '@/shared/components/ui/button';

interface ConfirmActionProps {
  /** Trigger button text. */
  label: string;
  icon?: IconComponent;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  /** `data-testid` of the trigger; the confirm button gets `confirm-<testId>`. */
  testId: string;
  disabled?: boolean;
  variant?: 'destructive' | 'outline';
}

/** A button whose action only runs after an explicit confirmation dialog (destructive actions). */
export function ConfirmAction({
  label,
  icon: Icon,
  title,
  description,
  confirmLabel,
  onConfirm,
  testId,
  disabled,
  variant = 'destructive',
}: ConfirmActionProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size="sm" disabled={disabled} data-testid={testId}>
          {Icon ? <Icon className="h-4 w-4" /> : null}
          <span className={Icon ? 'ml-1.5' : undefined}>{label}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans>Cancel</Trans>
          </AlertDialogCancel>
          <AlertDialogAction data-testid={`confirm-${testId}`} onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
