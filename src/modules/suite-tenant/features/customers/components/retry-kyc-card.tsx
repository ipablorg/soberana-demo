import { useState, type FormEvent } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import type { TenantRetryKycInput } from '@/graphql/types/tenant';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { NativeSelect } from '@/modules/suite-tenant/components/atoms/native-select';
import { FormField } from '@/modules/suite-tenant/components/molecules/form-field';

/** Endorsements the back accepts for a kyc_link regeneration (`RetryKycDto`). */
const ENDORSEMENTS = ['ach_wire', 'sepa', 'spei', 'faster_payments', 'pix'] as const;

interface RetryKycCardProps {
  pending: boolean;
  onRetry: (input: TenantRetryKycInput) => void;
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

/** Restart KYC (after a rejection) or regenerate the verification link. */
export function RetryKycCard({ pending, onRetry }: RetryKycCardProps) {
  const { t } = useLingui();
  const [endorsement, setEndorsement] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [error, setError] = useState<string | undefined>();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const uri = redirectUri.trim();
    if (uri && !isValidUrl(uri)) {
      setError(t`Enter a valid URL.`);
      return;
    }
    setError(undefined);
    const input: TenantRetryKycInput = {};
    if (endorsement) input.endorsement = endorsement as TenantRetryKycInput['endorsement'];
    if (uri) input.redirect_uri = uri;
    onRetry(input);
  };

  return (
    <Card className="rounded-xl shadow-none">
      <CardHeader>
        <CardTitle className="text-lg">
          <Trans>Retry KYC</Trans>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4" noValidate data-testid="retry-kyc-form">
          <p className="text-sm text-muted-foreground">
            <Trans>Resubmit after a rejection, or get a fresh verification link.</Trans>
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="retry-endorsement" label={t`Rail (optional)`}>
              <NativeSelect
                id="retry-endorsement"
                value={endorsement}
                placeholder={t`Any`}
                options={ENDORSEMENTS.map((value) => ({ value, label: value }))}
                onChange={(event) => setEndorsement(event.target.value)}
              />
            </FormField>
            <FormField id="retry-redirect" label={t`Return URL (optional)`} error={error}>
              <Input
                id="retry-redirect"
                type="url"
                value={redirectUri}
                onChange={(event) => setRedirectUri(event.target.value)}
              />
            </FormField>
          </div>
          <Button type="submit" variant="outline" disabled={pending}>
            {pending ? <Trans>Restarting…</Trans> : <Trans>Retry KYC</Trans>}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
