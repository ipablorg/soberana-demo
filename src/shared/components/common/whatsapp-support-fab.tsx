import { Trans, useLingui } from '@lingui/react/macro';
import { motion } from 'framer-motion';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';

/**
 * Global WhatsApp customer-support FAB.
 *
 * Mounted once in AppProvider (sibling of <Toaster />) so it is visible on
 * every page — public landing, authenticated /suite, and backoffice. It is a
 * lightweight anchor (no data fetching, no server state): a single quick
 * contact point for onboarding/transaction issues.
 *
 * Positioned at z-40 so it sits above page content but below the z-50 modal
 * overlays (dialog/sheet) — it never covers an open dialog.
 *
 * `html[data-suite-dock]` is set by the client `AppLayout` while the floating
 * bottom dock is mounted; on mobile it raises the FAB above the dock.
 * `html[data-suite-flow-open]` is set by the dashboard while a Receive/Send
 * flow is open; on mobile the FAB hides so it never covers the flow panel.
 */

// Support line, normalized for the wa.me deep link (digits only, no '+').
const WHATSAPP_SUPPORT_NUMBER = '573003509694';

export function WhatsAppSupportFab() {
  // `@lingui/react/macro`: the deprecated `@lingui/macro` entry is not extracted,
  // so its strings never reached the catalogs and showed the stale English text.
  const { t } = useLingui();
  const prefilledMessage = t`Hola, necesito ayuda con Soberana`;
  const href = `https://wa.me/${WHATSAPP_SUPPORT_NUMBER}?text=${encodeURIComponent(prefilledMessage)}`;

  return (
    <motion.div
      className={cn(
        'fixed bottom-6 right-6 z-40 [html[data-surface=backoffice]_&]:hidden',
        // Client app on mobile: the floating dock owns the bottom edge, so lift
        // the FAB above it (dock = bottom-6 + ~58px + safe-area inset).
        '[html[data-suite-dock]_&]:max-md:bottom-[calc(7.25rem+env(safe-area-inset-bottom))]',
        '[html[data-suite-dock]_&]:max-md:right-4',
        // While a Receive/Send flow is open on a phone the panel spans the full
        // width, so the FAB hides instead of covering it (support stays one
        // close away).
        '[html[data-suite-flow-open]_&]:max-md:hidden'
      )}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            variant="gradient"
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg"
          >
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t`Soporte por WhatsApp`}
            >
              <svg
                viewBox="0 0 24 24"
                width={28}
                height={28}
                fill="currentColor"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <Trans>¿Tienes dudas? Escríbenos</Trans>
        </TooltipContent>
      </Tooltip>
    </motion.div>
  );
}
