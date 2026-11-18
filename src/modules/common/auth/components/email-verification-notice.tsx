import { Mail } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Trans } from '@lingui/react/macro';

interface EmailVerificationNoticeProps {
  email?: string | null;
  isSending?: boolean;
  onResend?: () => void;
  status?: 'sent' | 'failed';
}

export function EmailVerificationNotice({
  email,
  isSending = false,
  onResend,
  status = 'sent',
}: EmailVerificationNoticeProps) {
  return (
    <div className="space-y-4 py-2 flex flex-col items-center text-center">
      <div className="rounded-full bg-muted p-4">
        <Mail className="w-8 h-8 text-muted-foreground" />
      </div>

      <p className="text-sm text-muted-foreground max-w-sm">
        {status === 'failed' ? (
          <Trans>
            We created your account, but we couldn&apos;t send the verification email automatically.
            Try resending it below, then come back here after you verify your email.
          </Trans>
        ) : (
          <Trans>
            We sent a verification link to your inbox. Click the link to confirm your email,
            then come back here to continue.
          </Trans>
        )}
      </p>

      {email && (
        <p className="text-sm text-muted-foreground">
          {status === 'failed' ? (
            <>
              <Trans>We&apos;ll send the next verification link to</Trans>{' '}
              <span className="font-medium text-foreground break-all">{email}</span>
            </>
          ) : (
            <>
              <Trans>Verification link sent to</Trans>{' '}
              <span className="font-medium text-foreground break-all">{email}</span>
            </>
          )}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        <Trans>Didn&apos;t receive the email? Check your spam folder or resend below.</Trans>
      </p>

      {onResend && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onResend}
          disabled={isSending}
        >
          {isSending ? <Trans>Sending...</Trans> : <Trans>Resend verification email</Trans>}
        </Button>
      )}
    </div>
  );
}
