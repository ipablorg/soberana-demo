/**
 * MigrationBanner Component
 * 
 * Shows info banner for migrated users explaining the transition
 * to the new Bridge KYC system.
 */

import { Info } from '@/shared/components/animated-icons';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { motion } from 'framer-motion';

export function MigrationBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Alert className="bg-primary/10 border-primary/30 border-2">
        <Info className="h-5 w-5 text-primary" />
        <AlertTitle className="text-lg font-semibold">
          Migración al nuevo sistema de verificación
        </AlertTitle>
        <AlertDescription className="mt-2 text-sm text-muted-foreground">
          Tu cuenta está siendo migrada al nuevo sistema de verificación KYC.
          Recibirás un correo electrónico con el enlace de verificación en las próximas 24 horas.
          Mientras tanto, todas las funcionalidades permanecerán deshabilitadas por seguridad y cumplimiento.
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}
