import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { mapError } from '@/shared/lib/error-mapper';
import { queryClient } from '@/shared/lib/query-client';
import { useViewAsStore } from '@/shared/stores/view-as-store';

interface ViewAsCustomerButtonProps {
  customerId: string;
  customerLabel: string;
}

/**
 * Opens the client app as this customer, read-only (Loopay2/SOBERANA#415;
 * LOOPAY_ADMIN and, since epic 2026-11 S5, OPS_COMMERCIAL). The caller decides
 * visibility with `canViewAsCustomer`. Starting it ends any act-as session.
 */
export function ViewAsCustomerButton({ customerId, customerLabel }: ViewAsCustomerButtonProps) {
  const { t } = useLingui();
  const navigate = useNavigate();
  const start = useViewAsStore((state) => state.start);
  const [isStarting, setIsStarting] = useState(false);

  const handleClick = async () => {
    setIsStarting(true);
    try {
      await start(customerId, customerLabel);
      queryClient.clear();
      navigate('/suite/dashboard');
    } catch (error) {
      toast.error(t`No se pudo abrir la vista del cliente`, {
        description: mapError(error).message,
      });
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-border">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">
          <Trans>Ver como cliente</Trans>
        </h3>
        <p className="text-xs text-muted-foreground">
          <Trans>Abre la app del cliente en modo solo lectura. Queda auditado.</Trans>
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="h-7"
        disabled={isStarting}
        onClick={() => void handleClick()}
      >
        <Trans>Ver como cliente</Trans>
      </Button>
    </div>
  );
}
