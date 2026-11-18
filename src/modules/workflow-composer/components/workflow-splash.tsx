import { Trans } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import { Workflow } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { useWorkflowComposerStore } from '@/shared/stores/use-workflow-composer-store';

export function WorkflowSplash() {
  const markSplashShown = useWorkflowComposerStore((s) => s.markSplashShown);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed inset-0 z-50 bg-background flex items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: 'easeOut', delay: 0.05 }}
        className="flex flex-col items-center gap-6 text-center max-w-md px-6"
      >
        <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center">
          <Workflow className="h-8 w-8 text-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-4xl font-bold text-foreground tracking-tight">
            Workflow Composer
          </h1>
          <p className="text-lg text-muted-foreground font-body font-light leading-relaxed">
            <Trans>Diseña y automatiza flujos de pago</Trans>
          </p>
        </div>

        <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground text-left w-full max-w-xs">
          <li className="flex items-center gap-2.5">
            <span className="h-5 w-5 rounded-md bg-muted flex items-center justify-center text-[11px] font-bold text-foreground shrink-0">1</span>
            <Trans>Conecta APIs de Soberana y FX</Trans>
          </li>
          <li className="flex items-center gap-2.5">
            <span className="h-5 w-5 rounded-md bg-muted flex items-center justify-center text-[11px] font-bold text-foreground shrink-0">2</span>
            <Trans>Arrastra nodos y conecta el flujo visualmente</Trans>
          </li>
          <li className="flex items-center gap-2.5">
            <span className="h-5 w-5 rounded-md bg-muted flex items-center justify-center text-[11px] font-bold text-foreground shrink-0">3</span>
            <Trans>Ejecuta y monitorea cada paso en tiempo real</Trans>
          </li>
        </ul>

        <Button variant="gradient" size="lg" onClick={markSplashShown}>
          <Trans>Empezar a construir</Trans>
        </Button>
      </motion.div>
    </motion.div>
  );
}
