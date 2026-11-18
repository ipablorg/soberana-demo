import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';
import { AuthLayout } from '@/shared/layouts';
import { ArrowLeft, CheckCircle2, Lock, Mail } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { getAuth } from '@/shared/lib/loopayx/firebase-client';
import { resolveResetPasswordAction, isInvalidActionCodeError, isFirebaseConfigError, readFirebaseErrorCode } from './firebase-public-auth-flow';

type ResetPasswordViewState =
  | 'validating-link'
  | 'invalid-link'
  | 'verify-email-processing'
  | 'verify-email-success'
  | 'reset-password-ready'
  | 'resetting-password'
  | 'reset-password-success'
  | 'unsupported-action'
  | 'unavailable';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLingui();
  const translateRef = useRef(t);
  const [viewState, setViewState] = useState<ResetPasswordViewState>('validating-link');
  const [actionCode, setActionCode] = useState<string | null>(null);
  const [resolvedEmail, setResolvedEmail] = useState<string | null>(null);
  const [unsupportedMode, setUnsupportedMode] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  translateRef.current = t;

  useEffect(() => {
    let isActive = true;

    async function resolveActionLink() {
      setViewState('validating-link');
      setActionCode(null);
      setResolvedEmail(null);
      setUnsupportedMode(null);
      setPageError(null);
      setPassword('');
      setConfirmPassword('');
      setFormError(null);

      try {
        const result = await resolveResetPasswordAction({
          href: window.location.href,
          search: location.search,
          getAuth,
          loadFirebaseAuth: () => import('firebase/auth'),
          onVerifyEmailProcessing: () => {
            if (isActive) {
              setViewState('verify-email-processing');
            }
          },
        });

        if (!isActive) {
          return;
        }

        if (result.status === 'verify-email-success') {
          setViewState('verify-email-success');
          return;
        }

        if (result.status === 'reset-password-ready') {
          setActionCode(result.actionCode);
          setResolvedEmail(result.resolvedEmail);
          setViewState('reset-password-ready');
          return;
        }

        if (result.status === 'unsupported-action') {
          setUnsupportedMode(result.mode);
          setViewState('unsupported-action');
          return;
        }

        if (result.reason === 'unavailable') {
          setViewState('unavailable');
          setPageError(translateRef.current`This email action is unavailable right now. Please try again later.`);
          return;
        }

        if (result.reason === 'invalid-link') {
          setViewState('invalid-link');
          setPageError(translateRef.current`This link is invalid or has already expired.`);
          return;
        }

        setViewState('invalid-link');
        setPageError(translateRef.current`We couldn't validate this email action. Please request a new link and try again.`);
      } catch {
        if (!isActive) {
          return;
        }

        setViewState('invalid-link');
        setPageError(translateRef.current`We couldn't validate this email action. Please request a new link and try again.`);
      }
    }

    void resolveActionLink();

    return () => {
      isActive = false;
    };
  }, [location.search]);

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!actionCode) {
      setViewState('invalid-link');
      setPageError(t`This link is invalid or has already expired.`);
      return;
    }

    if (password !== confirmPassword) {
      setFormError(t`Passwords do not match.`);
      return;
    }

    setFormError(null);
    setViewState('resetting-password');

    try {
      const auth = await getAuth();
      const { confirmPasswordReset } = await import('firebase/auth');

      await confirmPasswordReset(auth, actionCode, password);
      setViewState('reset-password-success');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (isFirebaseConfigError(error)) {
        setViewState('unavailable');
        setPageError(t`This email action is unavailable right now. Please try again later.`);
        return;
      }

      if (isInvalidActionCodeError(error)) {
        setViewState('invalid-link');
        setPageError(t`This link is invalid or has already expired.`);
        return;
      }

      if (readFirebaseErrorCode(error) === 'auth/weak-password') {
        setViewState('reset-password-ready');
        setFormError(t`Choose a stronger password and try again.`);
        return;
      }

      setViewState('reset-password-ready');
      setFormError(t`We couldn't reset your password right now. Please try again.`);
    }
  };

  const renderPrimaryContent = () => {
    if (viewState === 'validating-link' || viewState === 'verify-email-processing') {
      return (
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center text-center space-y-4 py-6">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      );
    }

    if (viewState === 'reset-password-ready' || viewState === 'resetting-password') {
      return (
        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-4">
            {resolvedEmail ? (
              <p className="text-sm text-muted-foreground">
                <Trans>
                  Create a new password for <strong>{resolvedEmail}</strong>.
                </Trans>
              </p>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="reset-password-new-password">
                <Trans>New password</Trans>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="reset-password-new-password"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (formError) {
                      setFormError(null);
                    }
                  }}
                  placeholder={t`••••••••`}
                  className="pl-10"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-password-confirm-password">
                <Trans>Confirm password</Trans>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="reset-password-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    if (formError) {
                      setFormError(null);
                    }
                  }}
                  placeholder={t`••••••••`}
                  className="pl-10"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button variant="gradient" type="submit" className="w-full h-11" disabled={viewState === 'resetting-password'}>
              {viewState === 'resetting-password' ? t`Resetting password...` : t`Save new password`}
            </Button>

            <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/login')}>
              <Trans>Back to login</Trans>
            </Button>
          </CardFooter>
        </form>
      );
    }

    if (viewState === 'verify-email-success') {
      return (
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              <Trans>Your email has been verified. You can now sign in safely.</Trans>
            </p>
          </div>
          <Button variant="gradient" className="w-full" onClick={() => navigate('/login')}>
            <Trans>Continue to sign in</Trans>
          </Button>
        </CardContent>
      );
    }

    if (viewState === 'reset-password-success') {
      return (
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              <Trans>Your password has been updated. You can sign in with your new password now.</Trans>
            </p>
          </div>
          <div className="space-y-3">
            <Button variant="gradient" className="w-full" onClick={() => navigate('/login')}>
              <Trans>Continue to sign in</Trans>
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/forgot-password')}>
              <Trans>Request another link</Trans>
            </Button>
          </div>
        </CardContent>
      );
    }

    return (
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Mail className="w-8 h-8 text-muted-foreground" />
          </div>
          {pageError ? <p className="text-muted-foreground">{pageError}</p> : null}
          {viewState === 'unsupported-action' && unsupportedMode ? (
            <p className="text-sm text-muted-foreground">
              <Trans>Unsupported action mode: {unsupportedMode}</Trans>
            </p>
          ) : null}
          {viewState === 'unsupported-action' ? (
            <p className="text-sm text-muted-foreground">
              <Trans>For your security, this action is not handled on this page yet. Please contact support if you need help.</Trans>
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          <Button
            variant="gradient"
            className="w-full"
            onClick={() => navigate(viewState === 'invalid-link' ? '/forgot-password' : '/login')}
          >
            {viewState === 'invalid-link' ? t`Request a new link` : t`Back to login`}
          </Button>

          <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
            <Trans>Return to sign in</Trans>
          </Button>
        </div>
      </CardContent>
    );
  };

  const title = (() => {
    switch (viewState) {
      case 'validating-link':
        return t`Validating link`;
      case 'verify-email-processing':
        return t`Verifying your email`;
      case 'verify-email-success':
        return t`Email verified`;
      case 'reset-password-ready':
      case 'resetting-password':
        return t`Set a new password`;
      case 'reset-password-success':
        return t`Password updated`;
      case 'unsupported-action':
        return t`Unsupported email action`;
      case 'unavailable':
        return t`Action unavailable`;
      case 'invalid-link':
      default:
        return t`Invalid or expired link`;
    }
  })();

  const description = (() => {
    switch (viewState) {
      case 'validating-link':
        return t`We are checking your email action link now.`;
      case 'verify-email-processing':
        return t`Please wait while we confirm your email address.`;
      case 'verify-email-success':
        return t`Your email action has been completed successfully.`;
      case 'reset-password-ready':
        return t`Choose a new password to secure your account.`;
      case 'resetting-password':
        return t`Please wait while we update your password.`;
      case 'reset-password-success':
        return t`Your account is ready for you to sign in again.`;
      case 'unsupported-action':
        return t`This email action is not supported in this flow yet.`;
      case 'unavailable':
        return t`This action cannot be completed right now.`;
      case 'invalid-link':
      default:
        return t`Request a fresh email action link and try again.`;
    }
  })();

  return (
    <AuthLayout centered>
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <Trans>Back</Trans>
            </Button>
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        {renderPrimaryContent()}
      </Card>
    </AuthLayout>
  );
}
