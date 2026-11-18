/**
 * "Documentos requeridos" state of the dashboard banner (S21): what the VA
 * provider still needs from the customer, by its Spanish name, with the
 * reason when Comercial sent an upload back, and the CTA to the upload dialog.
 */

import { useLingui } from '@lingui/react/macro';
import { motion } from 'framer-motion';

import type { ProviderRequirement } from '@/graphql/types/provider-requirements';
import { FileText } from '@/shared/components/animated-icons';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { providerFieldLabel } from '@/shared/lib/provider-field-labels';

interface ProviderRequirementsNoticeProps {
  requirements: readonly ProviderRequirement[];
  onOpen: () => void;
}

export function ProviderRequirementsNotice({
  requirements,
  onOpen,
}: ProviderRequirementsNoticeProps) {
  const { t } = useLingui();
  const rejected = requirements.some((requirement) => requirement.status === 'REJECTED');

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Card className="rounded-xl border border-warning/20 bg-warning/10">
        <CardContent className="pt-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row">
            <div className="rounded-full border border-warning/20 bg-warning/10 p-3">
              <FileText className="h-6 w-6 text-warning" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold">{t`Documentos requeridos`}</h3>
                <Badge variant={rejected ? 'destructive' : 'warning'}>
                  {rejected ? t`Revisa lo rechazado` : t`Acción requerida`}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {t`Para abrir tu cuenta virtual, nuestro proveedor bancario necesita lo siguiente.`}
              </p>
              <ul className="space-y-1.5 rounded-lg bg-card/70 p-3 text-sm">
                {requirements.map((requirement) => (
                  <li key={requirement.id} className="space-y-0.5">
                    <p className="font-medium text-foreground">
                      {providerFieldLabel(requirement.key, (d) => t(d))}
                    </p>
                    {requirement.status === 'REJECTED' && requirement.rejectReason ? (
                      <p className="break-words text-xs text-destructive">
                        {t`Rechazado: ${requirement.rejectReason}`}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
              <div className="pt-1">
                <Button variant="gradient" size="sm" onClick={onOpen}>
                  {t`Subir documentos`}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
