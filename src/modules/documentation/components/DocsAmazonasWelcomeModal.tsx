/**
 * DocsAmazonasWelcomeModal - Mensaje de bienvenida Banco Amazonas en /docs
 * Estrategia: overlay fijo en el árbol de docs (sin Dialog/portal). Una vez por sesión (sessionStorage).
 */

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Handshake, ArrowRight, X } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import SoberanaLogoLight from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png';
import SoberanaLogoDark from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png';
import LogoAmazonas from '@/shared/assets/Logos-clientes/amazonas.png';

const STORAGE_KEY = 'soberana-amazonas-welcome-seen';

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export interface DocsAmazonasWelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

function WelcomeOverlayContent({ onClose }: { onClose: () => void }) {
  const handleExplore = () => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, '1');
    }
    onClose();
    requestAnimationFrame(() => {
      document.querySelector('main')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleBackdrop = () => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, '1');
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="relative z-101 w-full max-w-xl rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-sm p-6 sm:p-8 mx-4"
    >
      <button
        type="button"
        onClick={handleBackdrop}
        className="absolute right-4 top-4 rounded-sm p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        aria-label="Cerrar"
      >
        <X className="h-4 w-4" />
      </button>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="flex flex-col items-center text-center gap-4 pb-0">
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-3 sm:gap-4 py-2 px-4 rounded-xl bg-muted/30 w-full"
          >
            <img
              src={LogoAmazonas}
              alt="Banco Amazonas"
              className="h-9 w-auto object-contain"
            />
            <Handshake className="h-6 w-6 text-primary shrink-0" />
            <img src={SoberanaLogoLight} alt="Soberana" className="h-8 w-auto object-contain dark:hidden" />
            <img src={SoberanaLogoDark} alt="Soberana" className="h-8 w-auto object-contain hidden dark:block" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Hola Banco Amazonas
            </h2>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="space-y-4 py-0">
          <div className="text-sm text-muted-foreground leading-relaxed space-y-3 text-left">
            <p>
              A continuación te presentamos cómo vamos a cambiar el futuro de la banca en el
              mundo, juntos.
            </p>
            <p>
              Explora toda la documentación de nuestra tecnología única en el mercado y
              descubre cómo la integraremos para llevar a Banco Amazonas a la vanguardia de
              las finanzas autónomas.
            </p>
          </div>
        </motion.div>

        <div className="flex justify-center pt-2">
          <motion.div variants={itemVariants}>
            <Button
              onClick={handleExplore}
              variant="gradient"
              className="font-semibold px-6 min-w-[200px]"
            >
              Explorar documentación
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Overlay de bienvenida (sin Dialog): overlay fijo + card centrada */
export function DocsAmazonasWelcomeModal({ open, onClose }: DocsAmazonasWelcomeModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-100 bg-background/80 backdrop-blur-md"
            onClick={() => {
              if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(STORAGE_KEY, '1');
              onClose();
            }}
            aria-hidden
          />
          <div
            key="content-wrap"
            className="fixed inset-0 z-100 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <WelcomeOverlayContent onClose={onClose} />
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Provider: muestra el mensaje de bienvenida una vez por sesión al entrar en /docs */
export function DocsAmazonasWelcomeProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!pathname.startsWith('/docs')) return;
    if (typeof sessionStorage === 'undefined') return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    setOpen(true);
  }, [pathname]);

  return (
    <>
      {children}
      <DocsAmazonasWelcomeModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
