import { motion } from 'framer-motion';
import { Zap } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { useAgenticChat } from '@/shared/stores/useAgenticChat';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { useLingui } from '@lingui/react/macro';

export function AgentChatFAB() {
  const { toggleChat, isOpen } = useAgenticChat();
  const { t } = useLingui();

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className="fixed bottom-6 right-6 z-250"
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <Button
              onClick={toggleChat}
              className="h-auto px-5 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm flex items-center gap-2 transition-colors duration-150"
              aria-label={isOpen ? t`Cerrar optimizador de rutas` : t`Abrir optimizador de rutas`}
            >
              <Zap className="h-5 w-5" />
              <span>Routes Optimizer</span>
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-popover text-popover-foreground border">
          <p className="text-sm font-medium">
            {isOpen ? t`Cerrar optimizador` : t`Encuentra las mejores rutas y ahorra en cada operación`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

