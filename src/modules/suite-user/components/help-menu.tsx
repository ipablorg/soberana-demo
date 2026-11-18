/**
 * HelpMenu
 *
 * Topbar entry-point for cross-cutting guidance:
 *  - "Cómo transferir desde tu banco" → opens BankTransferGuide,
 *    pre-populated with the user's USD virtual account when one
 *    exists, so the steps show live values.
 *  - "Tutorial del dashboard" → fires the existing tutorial store.
 *
 * Lives under `suite-user/components/` (not `shared/`) because it
 * consumes authenticated user data (wallets + deposit instructions),
 * which `shared/` is not allowed to depend on per the module
 * boundaries.
 */

import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { HelpCircle } from '@/shared/components/animated-icons';
import { useAuth } from '@/shared/hooks/use-auth';
import { useWallets } from '@/shared/hooks/use-wallets';
import { useDepositInstructions } from '@/shared/hooks/use-deposit-instructions';
import { useTutorialStore } from '@/modules/suite-user/features/dashboard/stores/useTutorialStore';
import { BankTransferGuide } from '@/shared/components/bank-transfer-guide';

export function HelpMenu() {
  const { t } = useLingui();
  const [guideOpen, setGuideOpen] = useState(false);
  const openTutorial = useTutorialStore((s) => s.open);

  const { user } = useAuth();
  const customerId = user?.customer_profile_id ?? undefined;
  const { wallets } = useWallets();
  const walletId = wallets[0]?.id;
  const { virtualAccounts } = useDepositInstructions(walletId, customerId);

  const preferredAccount =
    virtualAccounts.find(
      (va) => va.currency === 'USD' && va.payment_rail.toLowerCase() === 'ach',
    ) ??
    virtualAccounts[0] ??
    null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-header-foreground hover:bg-white/10"
            aria-label={t`Ayuda`}
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            <Trans>Ayuda rápida</Trans>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => setGuideOpen(true)}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm">
                <Trans>Cómo transferir desde tu banco</Trans>
              </span>
              <span className="text-xs text-muted-foreground">
                <Trans>USD, MXN, COP, EUR, BRL y más</Trans>
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => openTutorial()}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm">
                <Trans>Tutorial del dashboard</Trans>
              </span>
              <span className="text-xs text-muted-foreground">
                <Trans>Tour guiado por las acciones principales</Trans>
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BankTransferGuide
        open={guideOpen}
        onOpenChange={setGuideOpen}
        account={preferredAccount}
        accounts={virtualAccounts}
      />
    </>
  );
}
