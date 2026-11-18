/**
 * TransactionGuard
 *
 * Wraps transactional pages (receive, send, transactions, beneficiaries)
 * and shows appropriate state if user cannot transact.
 */

import { useCanTransact, type CanTransactReason } from '@/shared/hooks/use-can-transact';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ShieldCheck } from '@/shared/components/animated-icons';
import { useNavigate } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import type { ReactNode } from 'react';

interface TransactionGuardProps {
  children: ReactNode;
}

export function TransactionGuard({ children }: TransactionGuardProps) {
  const { canTransact, reason, isLoading } = useCanTransact();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="max-w-md w-full space-y-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (canTransact) {
    return <>{children}</>;
  }

  return <BlockedState reason={reason} onNavigate={navigate} />;
}

function BlockedState({
  reason,
  onNavigate,
}: {
  reason: CanTransactReason;
  onNavigate: (path: string) => void;
}) {
  const { t } = useLingui();

  const messages: Record<CanTransactReason, { title: string; description: string }> = {
    no_kyc: {
      title: t`Verificación requerida`,
      description: t`Necesitas completar la verificación de identidad antes de operar.`,
    },
    kyc_pending: {
      title: t`Verificación en proceso`,
      description: t`Tu verificación de identidad está en proceso. Te notificaremos cuando esté lista.`,
    },
    kyc_rejected: {
      title: t`Verificación rechazada`,
      description: t`Tu verificación fue rechazada. Contacta soporte para más información.`,
    },
    kyc_review_required: {
      title: t`Revisión requerida`,
      description: t`Your KYC is blocked by a pending provider workflow. Refresh the verification status or resume the verification flow to see the next actionable step.`,
    },
    customer_inactive: {
      title: t`Cuenta no habilitada`,
      description: t`Tu cuenta no está habilitada para operar. Contacta soporte para más información.`,
    },
    wallet_pending: {
      title: t`Configurando tu cuenta`,
      description: t`Tu wallet está siendo habilitada por nuestro equipo. Te avisaremos cuando esté lista.`,
    },
    ready: { title: '', description: '' },
  };

  const msg = messages[reason];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <Card className="rounded-xl border border-border bg-card max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          <ShieldCheck className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-foreground font-medium">{msg.title}</p>
          <p className="text-sm text-muted-foreground">{msg.description}</p>
          {reason === 'kyc_review_required' ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button variant="gradient" onClick={() => onNavigate('/suite/verify-identity')}>
                {t`Open verification`}
              </Button>
              <Button variant="outline" onClick={() => onNavigate('/suite/dashboard')}>
                {t`Back to dashboard`}
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => onNavigate('/suite/dashboard')}>
              {t`Volver al inicio`}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
