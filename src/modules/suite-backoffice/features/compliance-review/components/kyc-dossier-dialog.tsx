/**
 * Read-only KYC dossier for one customer.
 *
 * Fetches `adminLoopay_getCustomerKycData` only while it is open, and resolves
 * a document's presigned URL on click because the backend only keeps that URL
 * valid for 15 minutes.
 */

import { Trans, useLingui } from '@lingui/react/macro';

import type { AdminKycQueueItem } from '@/graphql/types/admin-loopay';
import {
  StatePillChip,
  StatePillChipStatusLabel,
} from '@/shared/components/backoffice/StatePillChip';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

import {
  useCustomerKycData,
  useKycDocumentDownload,
} from '../hooks/use-kyc-review';
import {
  documentCategoryLabel,
  parseAddressDetails,
  parseKycData,
  parseProviderProfile,
  type DossierField,
} from '../lib/kyc-dossier-fields';
import {
  EMPTY_CELL,
  formatCustomerName,
  formatOpsDateTime,
  formatOpsText,
} from '../../ops-review/lib/ops-formatting';

interface KycDossierDialogProps {
  customer: AdminKycQueueItem | null;
  onClose: () => void;
}

export function KycDossierDialog({ customer, onClose }: KycDossierDialogProps) {
  const { t } = useLingui();
  const { data, isLoading } = useCustomerKycData(customer?.id ?? null);
  const openDocument = useKycDocumentDownload();

  const detail = data?.adminLoopay_getCustomerKycData;
  const addressSection = parseAddressDetails(detail?.customer.address_details);
  const kycSection = parseKycData(
    detail?.kyc_data,
    customer?.customer_type ?? 'individual',
  );
  const providerProfileSection = parseProviderProfile(detail?.provider_profile);

  return (
    <Dialog open={customer !== null} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[720px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customer
              ? formatCustomerName(
                  customer.first_name,
                  customer.last_name,
                  customer.email,
                )
              : EMPTY_CELL}
          </DialogTitle>
          <DialogDescription>
            <Trans>Expediente de verificación del cliente.</Trans>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            <Trans>Cargando expediente...</Trans>
          </p>
        ) : null}

        {detail ? (
          <div className="space-y-6">
            <section className="grid grid-cols-2 gap-4 text-sm">
              <DossierField
                label={t`Correo`}
                value={formatOpsText(detail.customer.email)}
              />
              <DossierField
                label={t`País`}
                value={formatOpsText(detail.customer.country)}
              />
              <DossierField
                label={t`Identificación tributaria`}
                value={formatOpsText(detail.customer.tax_id)}
              />
              <DossierField
                label={t`Tipo de identificación`}
                value={formatOpsText(detail.customer.tax_id_type)}
              />
              <DossierField
                label={t`Última revisión`}
                value={formatOpsDateTime(detail.customer.kyc_reviewed_at)}
              />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  <Trans>Estado KYC</Trans>
                </p>
                <StatePillChip
                  status={detail.customer.kyc_status}
                  variant="documentation"
                />
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">
                <Trans>Documentos</Trans>
              </h3>
              {detail.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  <Trans>El cliente no ha cargado documentos.</Trans>
                </p>
              ) : (
                <ul className="space-y-2">
                  {detail.documents.map((document) => (
                    <li
                      key={document.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {documentCategoryLabel(document.category)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {document.mime_type} ·{' '}
                          {formatOpsDateTime(document.created_at)}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void openDocument(document.id)}
                      >
                        <Trans>Descargar</Trans>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {detail.endorsements.length > 0 ? (
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">
                  <Trans>Endosos</Trans>
                </h3>
                <ul className="space-y-1 text-sm">
                  {detail.endorsements.map((endorsement) => (
                    <li key={endorsement.id}>
                      {endorsement.rail_code} — {StatePillChipStatusLabel(endorsement.status)}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {detail.wallets.length > 0 ? (
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">
                  <Trans>Billeteras</Trans>
                </h3>
                <ul className="space-y-1 text-sm">
                  {detail.wallets.map((wallet) => (
                    <li key={wallet.id}>
                      {wallet.currency} · {formatOpsText(wallet.chain)} ·{' '}
                      {StatePillChipStatusLabel(wallet.status)}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {addressSection.fields.length > 0 ? (
              <DossierFieldsSection
                title={t`Dirección`}
                fields={addressSection.fields}
                leftover={addressSection.leftover}
              />
            ) : null}

            {kycSection.fields.length > 0 ? (
              <DossierFieldsSection
                title={t`Datos del formulario KYC`}
                fields={kycSection.fields}
                leftover={kycSection.leftover}
              />
            ) : null}

            {providerProfileSection.fields.length > 0 ? (
              <DossierFieldsSection
                title={t`Datos para los proveedores`}
                fields={providerProfileSection.fields}
                leftover={providerProfileSection.leftover}
              />
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function DossierField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium break-all">{value}</p>
    </div>
  );
}

function DossierFieldsSection({
  title,
  fields,
  leftover,
}: {
  title: string;
  fields: DossierField[];
  leftover: string | null;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        {fields.map((field) => (
          <div key={field.label} className="space-y-0.5">
            <dt className="text-xs text-muted-foreground">{field.label}</dt>
            <dd className="break-all font-medium">{field.value}</dd>
          </div>
        ))}
      </dl>
      {leftover ? (
        <details className="rounded-md border p-2">
          <summary className="cursor-pointer text-xs text-muted-foreground">
            <Trans>Campos adicionales (JSON)</Trans>
          </summary>
          <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-muted p-2 text-xs">
            {leftover}
          </pre>
        </details>
      ) : null}
    </section>
  );
}
