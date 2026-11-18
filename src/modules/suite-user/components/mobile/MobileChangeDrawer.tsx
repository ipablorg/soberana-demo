import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/shared/components/ui/drawer';
import { Button } from '@/shared/components/ui/button';
import { Repeat, ArrowRightLeft } from '@/shared/components/animated-icons';
import { useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface MobileChangeDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileChangeDrawer({ isOpen, onOpenChange }: MobileChangeDrawerProps) {
  const { t } = useLingui();
  const navigate = useNavigate();

  const handleAction = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  const changeOptions = [
    {
      icon: Repeat,
      label: t`Cambio FX`,
      description: t`Convierte entre divisas fiat`,
      path: '/suite/convert/fx',
      iconColor: 'text-success',
    },
    {
      icon: ArrowRightLeft,
      label: t`Bridge`,
      description: t`Conversión cripto-fiat`,
      path: '/suite/convert/bridge',
      iconColor: 'text-warning',
    },
  ];

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} modal={false}>
      <DrawerContent side="bottom" className="h-[55vh] rounded-t-xl p-6 border-t-2 border-border/20">
        {/* Drag Handle */}
        <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
        
        <DrawerHeader className="text-left mb-6 -mt-2">
          <DrawerTitle className="text-2xl font-bold">{t`Cambiar`}</DrawerTitle>
          <DrawerDescription className="text-sm">{t`Convierte tus fondos entre divisas`}</DrawerDescription>
        </DrawerHeader>

        <div className="grid grid-cols-1 gap-3">
          {changeOptions.map((option, index) => (
            <motion.div key={index}>
              <Button
                variant="outline"
                className="w-full h-20 flex items-start justify-start gap-4 text-left rounded-xl border-2 hover:border-primary hover:bg-primary/5 active:bg-primary/10 transition-colors duration-150 p-4 shadow-sm"
                onClick={() => handleAction(option.path)}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${option.iconColor.replace('text-', 'bg-')}/10`}>
                  <option.icon className={`w-6 h-6 ${option.iconColor}`} />
                </div>
                <div className="flex-1 pt-1">
                  <div className="font-semibold text-base">{option.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{option.description}</div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

