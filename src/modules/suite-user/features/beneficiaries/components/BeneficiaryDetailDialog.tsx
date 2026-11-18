import { Trans, useLingui } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { type BeneficiaryResponse } from '@/shared/lib/beneficiaries-api';
import { fadeInUp } from '@/shared/lib/motion';
import { cn } from '@/shared/lib/utils';
import { getCountryLabel } from '@/shared/constants/country-labels';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Separator } from '@/shared/components/ui/separator';
import {
  Building2,
  Copy,
  Globe,
  Hash,
  Landmark,
  Star,
  User,
  Clock,
} from '@/shared/components/animated-icons';
import { useReviewHint } from '../hooks/use-review-hint';
import { getBeneficiaryRenderingModel } from './beneficiary-rendering';
import { ReviewStatusBadge } from './review-status-badge';

interface BeneficiaryDetailDialogProps {
  open: boolean;
  beneficiary: BeneficiaryResponse | null;
  onClose: () => void;
}

function DetailRow({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  const { t } = useLingui();
  if (!value) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success(t`Copiado al portapapeles`);
  };

  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <div className="flex items-center gap-1.5 min-w-0">
        <span className={cn('text-sm text-foreground text-right truncate', mono && 'font-mono tabular-nums')}>
          {value}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
          aria-label={t`Copiar ${label}`}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <h3 className="text-sm font-medium text-foreground">{children}</h3>
    </div>
  );
}

function formatDate(dateStr: string | null | undefined, locale: string) {
  if (!dateStr) return null;
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function formatBankDetailValue(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  if (value == null) return null;

  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

export function BeneficiaryDetailDialog({
  open,
  beneficiary,
  onClose,
}: BeneficiaryDetailDialogProps) {
  const { t, i18n } = useLingui();
  const reviewHint = useReviewHint(beneficiary ?? {});

  if (!beneficiary) return null;

  const b = beneficiary;

  const getRelationshipLabel = (r: string | null) => {
    switch (r?.toUpperCase()) {
      case 'SELF': return t`Propia`;
      case 'FAMILY': return t`Familiar`;
      case 'FRIEND': return t`Amigo`;
      case 'EMPLOYEE': return t`Empleado`;
      case 'BUSINESS': return t`Negocio`;
      case 'THIRD_PARTY': return t`Tercero`;
      case 'OTHER': return t`Otro`;
      default: return r;
    }
  };

  const getHolderTypeLabel = (h: string | null) => {
    switch (h?.toUpperCase()) {
      case 'INDIVIDUAL': return t`Persona`;
      case 'BUSINESS': return t`Empresa`;
      default: return h;
    }
  };

  const rendering = getBeneficiaryRenderingModel(b);
  const brebKeyDetailValue = rendering.isBrebKey
    ? rendering.brebKey ?? t`No disponible`
    : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden rounded-xl border border-border bg-card flex flex-col p-0">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 pt-6 pb-4">
          <DialogHeader className="pb-0">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg truncate">
                  {b.beneficiary_name}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1.5">
                  <ReviewStatusBadge beneficiary={b} />
                  {b.is_favorite && (
                    <Star className="h-4 w-4 text-warning fill-warning" />
                  )}
                </div>
                {b.alias && (
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    {b.alias}
                  </p>
                )}
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable content */}
        <motion.div {...fadeInUp} className="overflow-y-auto px-6 pb-6 flex-1">

          <div className="space-y-4 pt-2">
            {reviewHint && (
              <p role="status" className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                {reviewHint}
              </p>
            )}
            {/* Identity */}
            <div>
              <SectionHeader icon={User}>
                <Trans>Identidad</Trans>
              </SectionHeader>
              <div className="pl-6">
                <DetailRow label={t`Nombre`} value={b.beneficiary_name} />
                <DetailRow label={t`Tax ID`} value={b.tax_id} mono />
                <DetailRow label={t`Tipo titular`} value={getHolderTypeLabel(b.holder_type)} />
                <DetailRow label={t`Relación`} value={getRelationshipLabel(b.relationship)} />
              </div>
            </div>

            <Separator />

            {/* Location & Rail */}
            <div>
              <SectionHeader icon={Globe}>
                <Trans>País y rail de pago</Trans>
              </SectionHeader>
              <div className="pl-6">
                <DetailRow label={t`País`} value={getCountryLabel(b.country, t)} />
                <DetailRow label={t`Rail`} value={b.rail?.name ?? b.payment_rail} />
                <DetailRow label={t`Moneda`} value={b.currency ?? b.rail?.currency} />
              </div>
            </div>

            {rendering.isBrebKey && (
              <>
                <Separator />
                <div>
                  <SectionHeader icon={Hash}>
                    <Trans>Llave Bre-B</Trans>
                  </SectionHeader>
                  <div className="pl-6">
                    <DetailRow label={t`Llave Bre-B`} value={brebKeyDetailValue} mono />
                  </div>
                </div>
              </>
            )}

            {rendering.showAccountDetails && (
              <>
                <Separator />

                {/* Account Details */}
                <div>
                  <SectionHeader icon={Landmark}>
                    <Trans>Datos bancarios</Trans>
                  </SectionHeader>
                  <div className="pl-6">
                    <DetailRow label={t`Banco`} value={b.bank_name} />
                    <DetailRow label={t`Código banco`} value={b.bank_code} mono />
                    <DetailRow label={t`Cuenta`} value={b.account_number} mono />
                    <DetailRow label={t`Routing number`} value={b.routing_number} mono />
                    <DetailRow label="IBAN" value={b.iban} mono />
                    <DetailRow label="CLABE" value={b.clabe} mono />
                    <DetailRow label="PIX" value={b.pix_key} mono />
                    <DetailRow label="BIC / SWIFT" value={b.bic} mono />
                    {b.masked_account_number && (
                      <DetailRow label={t`Cuenta enmascarada`} value={b.masked_account_number} mono />
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Bank details (extra fields from API) */}
            {rendering.additionalBankDetails.length > 0 && (
              <>
                <Separator />
                <div>
                  <SectionHeader icon={Hash}>
                    <Trans>Detalles adicionales</Trans>
                  </SectionHeader>
                  <div className="pl-6">
                    {rendering.additionalBankDetails.map(([key, val]) => (
                      <DetailRow key={key} label={key} value={formatBankDetailValue(val)} mono />
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Metadata */}
            <div>
              <SectionHeader icon={Clock}>
                <Trans>Fechas</Trans>
              </SectionHeader>
              <div className="pl-6">
                <DetailRow
                  label={t`Creado`}
                  value={formatDate(b.created_at, i18n.locale)}
                />
                <DetailRow
                  label={t`Actualizado`}
                  value={formatDate(b.updated_at, i18n.locale)}
                />
                <DetailRow label="ID" value={b.id} mono />
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
