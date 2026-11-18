/**
 * StatusBadge Component
 * 
 * Displays transaction status with appropriate colors using the Loopay Design System.
 * Now uses semantic Badge variants instead of hardcoded colors.
 */

import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

type PayOutStatus =
  | "received"
  | "scheduled"
  | "onHold"
  | "delivered"
  | "rejected"
  | "pending"
  | "processing";

type PayInStatus =
  | "initial"
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "abandoned";

type TransactionStatus = PayOutStatus | PayInStatus;

interface StatusBadgeProps {
  status: TransactionStatus;
  className?: string;
}

/**
 * Maps transaction statuses to Badge component variants (semantic colors)
 */
type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "processing";

const statusVariantMap: Record<
  TransactionStatus,
  { label: string; variant: BadgeVariant }
> = {
  received: { label: "Recibido", variant: "default" },
  scheduled: { label: "Programado", variant: "warning" },
  onHold: { label: "En Espera", variant: "secondary" },
  delivered: { label: "Entregado", variant: "success" },
  rejected: { label: "Rechazado", variant: "destructive" },
  pending: { label: "Pendiente", variant: "warning" },
  processing: { label: "Procesando", variant: "processing" },
  initial: { label: "Inicial", variant: "secondary" },
  accepted: { label: "Aceptado", variant: "success" },
  cancelled: { label: "Cancelado", variant: "destructive" },
  abandoned: { label: "Abandonado", variant: "secondary" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusVariantMap[status] || {
    label: status,
    variant: "secondary" as const,
  };

  return (
    <Badge
      variant={config.variant}
      className={cn("font-medium", className)}
    >
      {config.label}
    </Badge>
  );
}

