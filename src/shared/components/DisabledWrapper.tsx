/**
 * DisabledWrapper Component
 * 
 * Wraps features that require KYC approval with visual and functional blocking.
 * Provides clear user feedback about why features are disabled.
 * 
 * Usage:
 * ```tsx
 * <DisabledWrapper feature="transfers">
 *   <Button onClick={handleTransfer}>Send Money</Button>
 * </DisabledWrapper>
 * ```
 */

import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Lock } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { Card } from '@/shared/components/ui/card';
import { useCanTransact } from '@/shared/hooks/use-can-transact';
import { Trans, useLingui } from '@lingui/react/macro';

interface DisabledWrapperProps {
  children: ReactNode;
  feature?: string;
  message?: string;
  showOverlay?: boolean;
}

export function DisabledWrapper({
  children,
  feature,
  message,
  showOverlay = false,
}: DisabledWrapperProps) {
  const navigate = useNavigate();
  const { canTransact, isLoading } = useCanTransact();
  const { t } = useLingui();

  const FEATURE_NAMES: Record<string, string> = {
    transfers: t`transferencias`,
    payouts: t`pagos`,
    'fx-conversion': t`conversiones de moneda`,
    'bridge-conversion': t`conversiones crypto`,
    'bank-accounts': t`cuentas bancarias`,
    'api-keys': t`claves API`,
    webhooks: 'webhooks',
    integrations: t`integraciones`,
    developers: t`herramientas de desarrollo`,
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (canTransact) {
    return <>{children}</>;
  }

  const featureName = feature ? FEATURE_NAMES[feature] || feature : t`esta funcionalidad`;
  const defaultMessage = t`Completa tu verificación para desbloquear ${featureName}`;

  if (showOverlay) {
    return <OverlayBlock message={message || defaultMessage} onAction={() => navigate('/suite/dashboard')} />;
  }

  return (
    <TooltipWrapper message={message || defaultMessage}>
      <div className="pointer-events-none opacity-50 select-none">
        {children}
      </div>
    </TooltipWrapper>
  );
}

function LoadingState() {
  return (
    <div className="opacity-50 animate-pulse">
      <div className="h-full w-full" />
    </div>
  );
}

function TooltipWrapper({ children, message }: { children: ReactNode; message: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="flex items-start gap-2">
            <Lock className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="text-sm">{message}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function OverlayBlock({ message, onAction }: { message: string; onAction: () => void }) {
  return (
    <div className="relative min-h-[400px]">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
        <Card className="max-w-md p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-warning mb-4" />
          <h3 className="font-semibold text-lg mb-2">
            <Trans>Verificación KYC requerida</Trans>
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {message}
          </p>
          <Button onClick={onAction} className="w-full">
            <Trans>Completar verificación</Trans>
          </Button>
        </Card>
      </div>
    </div>
  );
}
