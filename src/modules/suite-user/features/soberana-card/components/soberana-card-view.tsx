/**
 * SoberanaCardView — embeddable Soberana Card surface for `SuiteShell`.
 *
 * Content body shared with the `/suite/soberana-card` page: card
 * preview, application leyenda, and the apply CTA with its states.
 * The shell and the page both mount this; only the page adds the
 * header with back button.
 */

import { Trans, useLingui } from '@lingui/react/macro';

import { CheckCircle2 } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { useAuthStore } from '@/shared/stores/auth-store';
import { SoberanaCardPreview } from './soberana-card-preview';
import { useCardApplication } from '../hooks/use-card-application';

export function SoberanaCardView() {
  const { t } = useLingui();
  const user = useAuthStore((s) => s.user);
  const { apply, isPending, isSuccess, error } = useCardApplication();

  const handleApply = () => {
    void apply({
      user_id: user?.id ?? '',
      email: user?.email ?? '',
      name: user?.name ?? '',
    });
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-10 flex flex-col items-center gap-8">
      <div className="w-full max-w-sm">
        <SoberanaCardPreview />
      </div>

      <p className="text-sm text-muted-foreground text-center max-w-sm">
        <Trans>
          Para obtener tu Soberana Card digital, primero debés aplicar.
        </Trans>
      </p>

      {isSuccess ? (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
        >
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
          <Trans>¡Aplicación enviada! Te contactaremos.</Trans>
        </div>
      ) : (
        <Button
          onClick={handleApply}
          disabled={isPending}
          size="lg"
          className="w-full max-w-sm"
        >
          {isPending && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {t`Quiero aplicar`}
        </Button>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive text-center">
          {error.message}
        </p>
      )}
    </div>
  );
}
