/**
 * MobileMoveSheet
 * 
 * Drawer with quick move actions (Transfer, Collect, Payout).
 * Opens from bottom, provides quick access to payment features.
 * 
 * Following SRP: Only handles Move actions drawer UI.
 */

import { useNavigate } from 'react-router-dom';
import { 
  ArrowDownLeft, 
  ArrowUpRight
} from '@/shared/components/animated-icons';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/shared/components/ui/drawer';
import { Button } from '@/shared/components/ui/button';
import { motion } from 'framer-motion';
import { useLingui } from '@lingui/react/macro';

interface MobileMoveSheetProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface MoveAction {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  color: string;
}

export function MobileMoveSheet({ isOpen = false, onOpenChange = () => {} }: MobileMoveSheetProps) {
  const navigate = useNavigate();
  const { t } = useLingui();

  const moveActions: MoveAction[] = [
    // {
    //   id: 'transfer',
    //   label: t`Transferir`,
    //   description: t`Envía dinero a otras cuentas`,
    //   icon: ArrowLeftRight,
    //   path: '/suite/move/transfers',
    //   color: 'text-primary',
    // },
    {
      id: 'collect',
      label: t`Cobrar`,
      description: t`Recibe pagos y transferencias`,
      icon: ArrowDownLeft,
      path: '/suite/move/payins',
      color: 'text-success',
    },
    {
      id: 'payout',
      label: t`Pagar`,
      description: t`Realiza pagos masivos`,
      icon: ArrowUpRight,
      path: '/suite/move/payouts',
      color: 'text-destructive',
    },
  ];

  const handleActionClick = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} modal={false}>
      <DrawerContent className="h-[65vh] rounded-t-[32px] p-6 border-t-2 border-border/20">
        {/* Drag Handle */}
        <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
        
        <DrawerHeader className="text-left mb-6 -mt-2">
          <DrawerTitle className="text-2xl font-bold">{t`Mover`}</DrawerTitle>
          <DrawerDescription className="text-sm">{t`Envía, recibe y gestiona pagos`}</DrawerDescription>
        </DrawerHeader>

        <div className="grid grid-cols-1 gap-3">
          {moveActions.map((action) => {
            const Icon = action.icon;
            
            return (
              <motion.div key={action.id}>
                <Button
                  variant="outline"
                  onClick={() => handleActionClick(action.path)}
                  className="w-full h-20 flex items-start justify-start gap-4 text-left rounded-lg border-2 hover:border-primary hover:bg-primary/5 active:bg-primary/10 transition-colors duration-150 p-4 shadow-sm"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${action.color.replace('text-', 'bg-')}/10`}>
                    <Icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="font-semibold text-base">{action.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{action.description}</div>
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

