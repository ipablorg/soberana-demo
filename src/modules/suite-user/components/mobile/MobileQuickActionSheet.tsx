/**
 * MobileQuickActionSheet
 * 
 * Sheet with most frequently used actions.
 * Triggered by center FAB button.
 * 
 * Following SRP: Only handles quick actions sheet UI.
 */

import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  Repeat,
  CreditCard,
  TrendingUp,
  X
} from '@/shared/components/animated-icons';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { Button } from '@/shared/components/ui/button';
import { useMobileStore } from '@/shared/stores/useMobileStore';
import { cn } from '@/shared/lib/utils';
import { Trans, useLingui } from '@lingui/react/macro';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  color: string;
  bgColor: string;
}

export function MobileQuickActionSheet() {
  const navigate = useNavigate();
  const { activeSheet, closeSheet } = useMobileStore();
  const { t } = useLingui();
  const isOpen = activeSheet === 'quickAction';

  const quickActions: QuickAction[] = [
    {
      id: 'transfer',
      label: t`Transferir`,
      icon: ArrowLeftRight,
      path: '/suite/move/transfers',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      id: 'convert',
      label: t`Convertir`,
      icon: Repeat,
      path: '/suite/convert/fx',
      color: 'text-chart-5',
      bgColor: 'bg-chart-5/10',
    },
    {
      id: 'cards',
      label: t`Tarjetas`,
      icon: CreditCard,
      path: '/suite/account/cards',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      id: 'marketplace',
      label: 'Vaults',
      icon: TrendingUp,
      path: '/suite/marketplace',
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10',
    },
  ];

  const handleActionClick = (path: string) => {
    closeSheet();
    navigate(path);
  };

  return (
    <Sheet open={isOpen} onOpenChange={closeSheet}>
      <SheetContent
        side="bottom"
        className="h-[450px] rounded-t-3xl border-t-2 border-border/40"
      >
        <SheetHeader className="space-y-1 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl"><Trans>Acciones Rápidas</Trans></SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeSheet}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="grid grid-cols-3 gap-4 mt-6">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Button
                key={action.id}
                variant="ghost"
                onClick={() => handleActionClick(action.path)}
                className={cn(
                  'flex flex-col items-center justify-center gap-3 p-4 h-auto',
                  'rounded-xl border-2 border-border/40',
                  'hover:border-primary/50 hover:bg-transparent active:scale-95 transition-colors duration-150'
                )}
              >
                <div className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center',
                  action.bgColor
                )}>
                  <Icon className={cn('w-7 h-7', action.color)} />
                </div>

                <span className="text-xs font-medium text-center leading-tight">
                  {action.label}
                </span>
              </Button>
            );
          })}
        </div>

        <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border/40">
          <p className="text-xs text-muted-foreground text-center">
            <Trans>Mantén presionado cualquier botón para más opciones</Trans>
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

