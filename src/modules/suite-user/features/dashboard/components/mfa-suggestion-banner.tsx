/**
 * MfaSuggestionBanner
 *
 * Optional post-registration 2FA enrollment invitation, rendered on
 * the conversational home. TOTP enrollment is skippable by spec for
 * non-staff customers — this banner invites, never blocks: it is an
 * inline card, navigation stays free, and dismissing it persists via
 * localStorage so it does not nag on every visit.
 *
 * "Configurar 2FA ahora" expands the invitation into the full inline
 * enrollment flow (shared `TotpEnrollmentFlow` — the same UI Settings
 * renders), so the user enrolls without leaving the dashboard.
 *
 * Visibility: only when the dismissal flag is unset AND the signed-in
 * user has no enrolled factors. Once enrollment completes the banner
 * hides for good (the dismissal flag is set — there is nothing left
 * to suggest).
 */

import { useEffect, useState } from 'react';
import { ShieldCheck, X } from '@/shared/components/animated-icons';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { isDevMockMode } from '@/shared/lib/dev-config';
import { Trans, useLingui } from '@lingui/react/macro';
import { motion, AnimatePresence } from 'framer-motion';
import { hasEnrolledFactors } from '@/shared/hooks/require-mfa-enrollment';
import {
  dismissMfaEnrollInvite,
  isMfaEnrollInviteDismissed,
} from '@/shared/lib/mfa-enroll-dismissal';
import { TotpEnrollmentFlow } from '@/modules/common/auth/components/totp-enrollment-flow';
import { useAuthStore } from '@/shared/stores/auth-store';

type BannerFrame = 'hidden' | 'invite' | 'enrolling' | 'enrolled';

export function MfaSuggestionBanner() {
  const { t } = useLingui();
  const email = useAuthStore((s) => s.user?.email);
  const [frame, setFrame] = useState<BannerFrame>('hidden');

  useEffect(() => {
    // Local demo override: no Firebase in mock mode — never suggest 2FA.
    if (isDevMockMode() || isMfaEnrollInviteDismissed()) return;
    let cancelled = false;
    hasEnrolledFactors().then((enrolled) => {
      if (!cancelled && !enrolled) setFrame('invite');
    });
    return () => { cancelled = true; };
  }, []);

  if (isDevMockMode()) return null;

  const handleDismiss = () => {
    dismissMfaEnrollInvite();
    setFrame('hidden');
  };

  if (frame === 'hidden') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Card className="bg-warning/10 border-warning/20 border rounded-xl">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full p-2 bg-warning/10 border border-warning/20 shrink-0">
              <ShieldCheck className="h-5 w-5 text-warning" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait" initial={false}>
                {frame === 'invite' && (
                  <motion.div
                    key="invite"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  >
                    <p className="text-sm font-medium text-foreground">
                      <Trans>Protect your account with 2FA</Trans>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <Trans>
                        Añade una capa extra de seguridad a tu cuenta. Solo
                        necesitas una app de autenticator en tu celular — toma
                        dos minutos.
                      </Trans>
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={() => setFrame('enrolling')}
                      >
                        <Trans>Set up now</Trans>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDismiss}
                      >
                        <Trans>Saltar por ahora</Trans>
                      </Button>
                    </div>
                  </motion.div>
                )}

                {frame === 'enrolling' && (
                  <motion.div
                    key="enrolling"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="pt-1"
                  >
                    <p className="mb-3 text-sm font-medium text-foreground">
                      <Trans>Configura tu 2FA</Trans>
                    </p>
                    <TotpEnrollmentFlow
                      accountEmail={email}
                      onEnrolled={() => {
                        dismissMfaEnrollInvite();
                        setFrame('enrolled');
                      }}
                    />
                  </motion.div>
                )}

                {frame === 'enrolled' && (
                  <motion.div
                    key="enrolled"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  >
                    <p className="text-sm font-medium text-foreground">
                      <Trans>2FA activada correctamente</Trans>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <Trans>
                        Tu cuenta quedó protegida con autenticación de dos factores.
                      </Trans>
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setFrame('hidden')}
                    >
                      <Trans>Listo</Trans>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {frame !== 'enrolled' && (
              <button
                type="button"
                onClick={handleDismiss}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={t`Dismiss`}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
