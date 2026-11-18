import { useState, useCallback } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { mapError } from '@/shared/lib/error-mapper';
import { useBeneficiaries, useDeleteBeneficiary } from '@/shared/hooks/use-beneficiaries';
import { type BeneficiaryResponse } from '@/shared/lib/beneficiaries-api';
import { BeneficiaryDetailDialog } from './BeneficiaryDetailDialog';
import { CreateBeneficiaryDialog } from './CreateBeneficiaryDialog';
import { ReviewStatusBadge } from './review-status-badge';
import { DeleteBeneficiaryDialog } from './DeleteBeneficiaryDialog';
import { getBeneficiaryRenderingModel } from './beneficiary-rendering';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { PageHeader } from '@/shared/components/common/PageHeader';
import {
  useIsViewingAs,
  ViewAsReadOnlyNote,
} from '@/shared/components/common/view-as-read-only-note';
import { Plus, Trash2, Users, Building2, AlertCircle } from '@/shared/components/animated-icons';

const VIEW_AS_NOTE_ID = 'beneficiaries-view-as-read-only';

/**
 * BeneficiariesView — embeddable beneficiaries surface for `SuiteShell`.
 *
 * Extracted from the legacy `/suite/beneficiaries` page body so the
 * shell can switch sections without a route change. The outer
 * `PageTransition` and viewport padding live in the shell, not here.
 */
export function BeneficiariesView() {
  const { t } = useLingui();
  const { beneficiaries, isLoading, error } = useBeneficiaries();
  const deleteMutation = useDeleteBeneficiary();
  // View as customer (#415): read-only, the back refuses every write.
  const isViewingAs = useIsViewingAs();
  const addDescribedBy = isViewingAs ? VIEW_AS_NOTE_ID : undefined;

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [detailBeneficiary, setDetailBeneficiary] = useState<BeneficiaryResponse | null>(null);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: (result) => {
        const providerMessage =
          result.provider_external_deleted && result.provider_code
            ? t`We also removed it from ${result.provider_code}.`
            : t`Removed from your beneficiary list.`;

        toast.success(`${t`Deleted ${name}.`} ${providerMessage}`);
        setDeleteTarget(null);
        setDetailBeneficiary((current) => (current?.id === deleteTarget.id ? null : current));
      },
      onError: (err) => {
        toast.error(mapError(err).message);
      },
    });
  }, [deleteTarget, deleteMutation, t]);

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <PageHeader
          title={t`Beneficiarios`}
          subtitle={t`Las personas y cuentas a las que envías dinero.`}
        />
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <CardTitle className="text-base">
                  <Trans>No pudimos cargar tus beneficiarios.</Trans>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{mapError(error).message}</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader
          title={t`Beneficiarios`}
          subtitle={t`Las personas y cuentas a las que envías dinero.`}
        />
        <Button
          variant="gradient"
          onClick={() => setCreateOpen(true)}
          disabled={isViewingAs}
          aria-describedby={addDescribedBy}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          <Trans>Agregar beneficiario</Trans>
        </Button>
      </div>

      <ViewAsReadOnlyNote id={VIEW_AS_NOTE_ID} action="add-beneficiary" />

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} variant="gradient-thin">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-md" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && beneficiaries.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="rounded-full bg-muted p-6 mb-4">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-heading font-semibold mb-2">
            <Trans>Todavía no has guardado a nadie.</Trans>
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            <Trans>Agrega el primer beneficiario para enviar dinero.</Trans>
          </p>
          <Button
            variant="gradient"
            onClick={() => setCreateOpen(true)}
            disabled={isViewingAs}
            aria-describedby={addDescribedBy}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            <Trans>Agregar beneficiario</Trans>
          </Button>
        </motion.div>
      )}

      {!isLoading && beneficiaries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(beneficiaries as BeneficiaryResponse[]).map((b, index) => {
            const rendering = getBeneficiaryRenderingModel(b);

            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2, ease: 'easeOut' }}
              >
                <Card
                  variant="gradient-thin"
                  className="cursor-pointer hover:bg-card/80"
                  onClick={() => setDetailBeneficiary(b)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{b.beneficiary_name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {rendering.isBrebKey ? (
                              <Trans>Llave Bre-B</Trans>
                            ) : (
                              (b.bank_name ?? b.rail?.name ?? '—')
                            )}
                          </p>
                        </div>
                      </div>
                      <ReviewStatusBadge beneficiary={b} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {rendering.railCode && (
                          <Badge variant="outline">{rendering.railCode}</Badge>
                        )}
                        <span className="text-sm text-muted-foreground font-mono tabular-nums">
                          {rendering.accountPreview}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({ id: b.id, name: b.beneficiary_name });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <BeneficiaryDetailDialog
        open={!!detailBeneficiary}
        beneficiary={detailBeneficiary}
        onClose={() => setDetailBeneficiary(null)}
      />

      <CreateBeneficiaryDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      <DeleteBeneficiaryDialog
        open={!!deleteTarget}
        beneficiaryName={deleteTarget?.name || null}
        isDeleting={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
