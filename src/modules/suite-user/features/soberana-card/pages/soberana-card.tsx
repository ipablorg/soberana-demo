/**
 * SoberanaCard — application page for the Soberana digital card.
 *
 * Header + back button around `SoberanaCardView` (shared with the
 * dock's inline section in SuiteShell). Reachable at
 * `/suite/soberana-card`.
 */

import { useNavigate } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';

import { ArrowLeft } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { SoberanaCardView } from '@/modules/suite-user/features/soberana-card/components/soberana-card-view';

export default function SoberanaCard() {
  const { t } = useLingui();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/suite/dashboard')}
            className="h-9 w-9"
            aria-label={t`Volver`}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            {t`Soberana Card`}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <SoberanaCardView />
      </div>
    </div>
  );
}
