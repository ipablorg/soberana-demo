import type { UseFormReturn } from 'react-hook-form';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { CheckCircle, ExternalLink, Loader2 } from '@/shared/components/animated-icons';
import { getTaxIdTypeLabel } from '../../lib/tax-id-type-options';
import { getDocumentTypeOption } from '../../lib/document-type-options';
import { getCountryLabel } from '@/shared/constants/country-labels';
import {
  getBusinessTypeLabel,
  getBusinessIndustryLabel,
  getExpectedAnnualRevenueLabel,
  getExpectedMonthlyPaymentLabel,
  getHighRiskActivityLabel,
  getBusinessSourceOfFundsLabel,
  getBusinessAccountPurposeLabel,
} from '../../lib/kyc-questionnaire-options';
import type { VerifyIdentityValues, UboValues } from '../../lib/verify-identity.schema';
import { getStepReviewState } from './step-review-state';

interface StepReviewProps {
  form: UseFormReturn<VerifyIdentityValues>;
  submitted: boolean;
  tosLink: string | null;
  isResumeState: boolean;
  requiresTosAction: boolean;
  isOpeningTos: boolean;
  onOpenTos: () => void;
  hasUnsupportedProviderFallback: boolean;
  unsupportedProviderMessage: string | null;
  isProcessing?: boolean;
}

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h4>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground sm:text-right">{value || '—'}</span>
    </div>
  );
}

export function StepReview({
  form,
  submitted,
  tosLink,
  isResumeState,
  requiresTosAction,
  isOpeningTos,
  onOpenTos,
  hasUnsupportedProviderFallback,
  unsupportedProviderMessage,
  isProcessing,
}: StepReviewProps) {
  const { t } = useLingui();

  if (isProcessing) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-warning/20 bg-warning/10 p-6 text-sm text-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-warning" />
        <Trans>Verifying your identity...</Trans>
      </div>
    );
  }
  const values = form.getValues() as any;
  const isBusiness = 'business_legal_name' in values;
  const taxIdTypeLabel = !isBusiness ? getTaxIdTypeLabel(values.nationality, values.tax_id_type) : '';
  const documentTypeLabel = !isBusiness ? (getDocumentTypeOption(values.issuing_country, values.type)?.label ?? values.type) : '';
  const reviewState = getStepReviewState({
    submitted,
    tosLink,
    isResumeState,
    requiresTosAction,
    hasUnsupportedProviderFallback,
  });
  const showSummary = reviewState.kind === 'editing' ||
    ((reviewState.kind === 'terms' || reviewState.kind === 'terms-recovery') && !reviewState.resume);

  return (
    <div className="space-y-5">
      {showSummary && !isBusiness && (
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
          <SummarySection title={t`Datos personales`}>
            <SummaryRow label={t`Date of birth`} value={values.birth_date} />
            <SummaryRow label={t`Nationality`} value={getCountryLabel(values.nationality, t)} />
            <SummaryRow label={t`ID fiscal`} value={`${values.tax_id} (${taxIdTypeLabel})`} />
          </SummarySection>

          <Separator />

          <SummarySection title={t`Address`}>
            <SummaryRow
              label={t`Location`}
              value={[values.address_line_1, values.city, values.state, getCountryLabel(values.country, t)]
                .filter(Boolean)
                .join(', ')}
            />
            {values.postal_code && (
              <SummaryRow label={t`Postal code`} value={values.postal_code} />
            )}
          </SummarySection>

          <Separator />

          <SummarySection title={t`Document`}>
            <SummaryRow label={t`Type`} value={documentTypeLabel} />
            <SummaryRow label={t`Issuing country`} value={getCountryLabel(values.issuing_country, t)} />
            {values.number && <SummaryRow label={t`Number`} value={values.number} />}
            <div className="flex items-center gap-2 pt-1 text-sm text-success">
              <CheckCircle className="h-3.5 w-3.5" />
              <Trans>Photos captured</Trans>
            </div>
          </SummarySection>
        </div>
      )}

      {showSummary && isBusiness && (
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
          <SummarySection title={t`Business Info`}>
            <SummaryRow label={t`Legal name`} value={values.business_legal_name} />
            {values.business_type && (
              <SummaryRow label={t`Type`} value={getBusinessTypeLabel(values.business_type)} />
            )}
            {values.business_industry && (
              <SummaryRow label={t`Industry`} value={getBusinessIndustryLabel(values.business_industry)} />
            )}
            <SummaryRow label={t`Incorporation date`} value={values.incorporation_date} />
            {values.registration_number && (
              <SummaryRow label={t`Número de registro de la empresa`} value={values.registration_number} />
            )}
            {values.number_of_employees && (
              <SummaryRow label={t`Número de empleados`} value={values.number_of_employees} />
            )}
            {typeof values.is_financial_institution === 'boolean' && (
              <SummaryRow
                label={t`¿Es una institución financiera?`}
                value={values.is_financial_institution ? t`Sí` : t`No`}
              />
            )}
            {values.primary_website ? (
              <SummaryRow label={t`Sitio web`} value={values.primary_website} />
            ) : values.website_absence_reason ? (
              <SummaryRow label={t`Motivo por el que no tiene sitio web`} value={values.website_absence_reason} />
            ) : null}
            {values.business_description && (
              <SummaryRow label={t`Description`} value={values.business_description} />
            )}
            {values.is_dao && (
              <SummaryRow label={t`DAO`} value={t`Sí`} />
            )}
          </SummarySection>

          <Separator />

          <SummarySection title={t`Registered Address`}>
            <SummaryRow
              label={t`Address`}
              value={[
                values.registered_address_line_1,
                values.registered_address_city,
                values.registered_address_state,
                getCountryLabel(values.registered_address_country, t),
              ].filter(Boolean).join(', ')}
            />
            {values.registered_address_postal_code && (
              <SummaryRow label={t`Postal code`} value={values.registered_address_postal_code} />
            )}
          </SummarySection>

          <Separator />

          <SummarySection title={t`Physical Address`}>
            <SummaryRow
              label={t`Address`}
              value={[
                values.physical_address_line_1,
                values.physical_address_city,
                values.physical_address_state,
                getCountryLabel(values.physical_address_country, t),
              ].filter(Boolean).join(', ')}
            />
            {values.physical_address_postal_code && (
              <SummaryRow label={t`Postal code`} value={values.physical_address_postal_code} />
            )}
          </SummarySection>

          <Separator />

          <SummarySection title={t`Compliance`}>
            {/* Only what the user answered: never a hardcoded default. */}
            {values.source_of_funds && (
              <SummaryRow label={t`Source of funds`} value={getBusinessSourceOfFundsLabel(values.source_of_funds)} />
            )}
            {values.account_purpose && (
              <SummaryRow label={t`Account purpose`} value={getBusinessAccountPurposeLabel(values.account_purpose)} />
            )}
            {values.estimated_annual_revenue_usd && (
              <SummaryRow label={t`Ingresos anuales esperados`} value={getExpectedAnnualRevenueLabel(values.estimated_annual_revenue_usd)} />
            )}
            {values.expected_monthly_payments_usd && (
              <SummaryRow label={t`Pagos mensuales esperados`} value={getExpectedMonthlyPaymentLabel(values.expected_monthly_payments_usd)} />
            )}
            {values.source_of_funds_description && (
              <SummaryRow label={t`SOF description`} value={values.source_of_funds_description} />
            )}
            {values.high_risk_activities && values.high_risk_activities.length > 0 && !values.high_risk_activities.includes('none_of_the_above') && (
              <SummaryRow label={t`High risk activities`} value={values.high_risk_activities.map(getHighRiskActivityLabel).join(', ')} />
            )}
            {values.high_risk_activities_explanation && (
              <SummaryRow label={t`High risk explanation`} value={values.high_risk_activities_explanation} />
            )}
            <SummaryRow label={t`Operates in prohibited countries`} value={values.operates_in_prohibited_countries ? t`Sí` : t`No`} />
            <SummaryRow label={t`Conducts money services`} value={values.conducts_money_services ? t`Sí` : t`No`} />
            <SummaryRow label={t`Transmits customer funds`} value={values.transmits_customer_funds ? t`Sí` : t`No`} />
            {values.compliance_screening_explanation && (
              <SummaryRow label={t`Compliance explanation`} value={values.compliance_screening_explanation} />
            )}
          </SummarySection>

          <Separator />

          <SummarySection title={t`Business Documents`}>
            {values.proof_of_address_document && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-3.5 w-3.5 text-success" />
                <Trans>Proof of address uploaded</Trans>
              </div>
            )}
            {values.business_formation_document && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-3.5 w-3.5 text-success" />
                <Trans>Business formation document uploaded</Trans>
              </div>
            )}
            {!values.proof_of_address_document && !values.business_formation_document && (
              <SummaryRow label={t`Documents`} value={t`Ninguno cargado`} />
            )}
          </SummarySection>

          <Separator />

          <SummarySection title={t`Beneficiarios finales`}>
            {values.ubos && values.ubos.length > 0 ? (
              values.ubos.map((ubo: UboValues, index: number) => (
                <div key={index} className="rounded-lg border border-border/60 bg-card/50 p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    <Trans>Owner {index + 1}</Trans>
                  </p>
                  <SummaryRow label={t`Name`} value={`${ubo.first_name} ${ubo.last_name}`} />
                  <SummaryRow label={t`Email`} value={ubo.email} />
                  <SummaryRow label={t`Date of birth`} value={ubo.birth_date} />
                  <SummaryRow label={t`Nationality`} value={getCountryLabel(ubo.nationality, t)} />
                  <SummaryRow
                    label={t`Residential address`}
                    value={[
                      ubo.residential_address_line_1,
                      ubo.residential_address_city,
                      ubo.residential_address_subdivision,
                      getCountryLabel(ubo.residential_address_country, t),
                    ].filter(Boolean).join(', ')}
                  />
                  {ubo.has_ownership && (
                    <SummaryRow label={t`Ownership`} value={`${ubo.ownership_percentage}%`} />
                  )}
                  {ubo.has_control && (
                    <SummaryRow label={t`Control`} value={t`Sí`} />
                  )}
                  {ubo.is_signer && (
                    <SummaryRow label={t`Firmante`} value={t`Sí`} />
                  )}
                  {ubo.is_director && (
                    <SummaryRow label={t`Director`} value={t`Sí`} />
                  )}
                  {ubo.title && (
                    <SummaryRow label={t`Cargo`} value={ubo.title} />
                  )}
                </div>
              ))
            ) : (
              <SummaryRow label={t`Beneficiarios finales`} value={t`Ninguno agregado`} />
            )}
          </SummarySection>
        </div>
      )}

      {reviewState.kind === 'unsupported-provider' && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-foreground space-y-2">
          <p className="font-medium">
            <Trans>In-app verification is not available in this environment.</Trans>
          </p>
          <p className="text-muted-foreground">
            {unsupportedProviderMessage ?? t`Please contact support or try again later.`}
          </p>
        </div>
      )}

      {(reviewState.kind === 'terms' || reviewState.kind === 'terms-recovery') && (
        <div className="space-y-3 rounded-xl border border-border p-4">
          {reviewState.resume && (
            <p className="text-sm text-muted-foreground">
              <Trans>Your information was already submitted. Continue with the Terms of Service to finish onboarding.</Trans>
            </p>
          )}
          {reviewState.kind === 'terms' ? (
            <a
              href={reviewState.tosLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              <Trans>Read the Terms of Service</Trans>
            </a>
          ) : (
            <Button
              type="button"
              variant="gradient"
              size="sm"
              className="gap-2"
              onClick={onOpenTos}
              disabled={isOpeningTos}
            >
              {isOpeningTos && <Loader2 className="h-4 w-4 animate-spin" />}
              <Trans>Generate Terms link</Trans>
            </Button>
          )}
          <p className="text-sm text-muted-foreground">
            <Trans>After you accept the Terms of Service, we will unlock the final step automatically when the provider confirms the progress.</Trans>
          </p>
        </div>
      )}

      {reviewState.kind === 'submitted' && (
        <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success">
          <CheckCircle className="h-4 w-4" />
          <Trans>Your information was submitted. We are verifying your identity.</Trans>
        </div>
      )}
    </div>
  );
}
