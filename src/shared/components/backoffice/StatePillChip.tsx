/**
 * StatePillChip - Refactored to use Loopay Design System Badge
 *
 * Now uses the semantic Badge component with proper variants.
 * Maintains backward compatibility while using scalable design tokens.
 */

import { Badge, type BadgeProps } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';

interface StatePillChipProps {
  status: string;
  variant?: 'company' | 'documentation' | 'payin' | 'payout' | 'readiness';
  /**
   * Opt-in override of the Badge variant derived from `variant` + `status`.
   * Lets a single screen emphasise a status without changing the shared map.
   */
  badgeVariant?: BadgeProps['variant'];
  /** Opt-in text override, for screens whose domain names a status differently. */
  label?: string;
  className?: string;
}

/**
 * Maps status strings to Badge component variants
 */
const statusToBadgeVariant: Record<
  string,
  Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'processing'
  >
> = {
  company: {
    active: 'success',
    initial: 'processing',
    debt: 'warning',
    invalid: 'destructive',
    penalized: 'destructive',
  },
  documentation: {
    approved: 'success',
    missInfo: 'warning',
    pending: 'processing',
    rejected: 'destructive',
  },
  payin: {
    accepted: 'success',
    confirmed: 'success',
    completed: 'success',
    unconfirmed: 'secondary',
    pending: 'processing',
    rejected: 'destructive',
    cancelled: 'destructive',
    canceled: 'destructive',
    abandoned: 'secondary',
    initial: 'default',
  },
  readiness: {
    ready: 'success',
    incomplete: 'warning',
    blocked: 'destructive',
  },
  payout: {
    delivered: 'success',
    received: 'default',
    onhold: 'secondary',
    scheduled: 'warning',
    rejected: 'destructive',
    cancelled: 'destructive',
    canceled: 'destructive',
  },
};

/**
 * Spanish labels for the raw status strings ops sees across queues.
 * Keyed by the uppercased status so it is case-insensitive. Statuses not
 * listed here fall back to the raw string so no information is lost.
 */
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  COMPLETED: 'Completado',
  REJECTED: 'Rechazado',
  PROCESSING: 'En proceso',
  FAILED: 'Fallido',
  ADDITIONAL_INFO_REQUIRED: 'Info adicional',
  APPROVED: 'Aprobado',
  VERIFIED: 'Verificado',
  UNVERIFIED: 'No verificado',
  CANCELLED: 'Cancelado',
  CANCELED: 'Cancelado',
  ABANDONED: 'Abandonado',
  UNCONFIRMED: 'Sin confirmar',
  CONFIRMED: 'Confirmado',
  ACCEPTED: 'Aceptado',
  DELIVERED: 'Entregado',
  RECEIVED: 'Recibido',
  ONHOLD: 'En espera',
  SCHEDULED: 'Programado',
  ACTIVE: 'Activo',
  INITIAL: 'Inicial',
  PENALIZED: 'Penalizado',
  READY: 'Listo',
  INCOMPLETE: 'Incompleto',
  BLOCKED: 'Bloqueado',
  SUSPENDED: 'Suspendido',
  FROZEN: 'Congelado',
  OFFBOARDED: 'Dado de baja',
  REVOKED: 'Revocado',
  INACTIVE: 'Inactivo',
  CLOSED: 'Cerrado',
  EXPIRED: 'Vencido',
  REQUESTED: 'Solicitado',
  NOT_INITIATED: 'Sin iniciar',
  INITIATED: 'Iniciado',
  PENDING_REVIEW: 'Pendiente de revisión',
  LINKED: 'Vinculado',
  MANUAL: 'Manual',
};

export function StatePillChipStatusLabel(status: string): string {
  return STATUS_LABELS[status.toUpperCase()] ?? status;
}

export default function StatePillChip({
  status,
  variant = 'payin',
  badgeVariant: badgeVariantOverride,
  label,
  className,
}: StatePillChipProps) {
  const statusLower = status?.toLowerCase() || '';

  // Get the badge variant from the mapping, unless the caller overrides it
  const badgeVariant =
    badgeVariantOverride ?? (statusToBadgeVariant[variant]?.[statusLower] || 'secondary');

  return (
    <Badge variant={badgeVariant} className={cn('font-semibold', className)}>
      {label ?? StatePillChipStatusLabel(status)}
    </Badge>
  );
}

export { StatePillChip };
