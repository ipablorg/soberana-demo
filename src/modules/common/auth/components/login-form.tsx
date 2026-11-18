import { useState, useEffect, useMemo } from 'react';
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
import { Checkbox } from '@/shared/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
} from '@/shared/components/animated-icons';
import { Trans, useLingui } from '@lingui/react/macro';
import { useSignIn } from '../api/use-sign-in';
import { useToast } from '@/shared/components/ui/use-toast';
import { useAuth } from '@/shared/hooks/use-auth';
import { mapError } from '@/shared/lib/error-mapper';
import { getHomeRoute, SUITE_HOME_ROUTE } from '@/shared/lib/tenant-roles';
import { TotpAuthHelp } from './totp-auth-help';
import { TotpEnrollmentPanel } from './totp-enrollment-panel';
import { EmailVerificationNotice } from './email-verification-notice';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
  onBack?: () => void;
}

export function LoginForm({ onSwitchToRegister, onBack }: LoginFormProps) {
  const navigate = useNavigate();
  const { t } = useLingui();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [verificationCode, setVerificationCode] = useState('');

  const {
    signIn,
    resolve2FA,
    enroll2FA,
    clearMfaState,
    resendVerificationEmail,
    requires2FA,
    requires2FAEnrollment,
    requiresEmailVerification,
    pendingVerificationEmail,
    totpSecret,
    isLoading: isSigningIn,
  } = useSignIn({
    onSuccess: (user) => {
      toast({
        title: t`Welcome back!`,
        description: t`You have successfully signed in.`,
      });
      // Staff -> /backoffice, tenant admin -> /tenant (replacing /login), anyone else -> dashboard.
      // auth_me fields are snake_case: `staff_roles`, `roles`.
      const home = getHomeRoute({ roles: user.roles, staff_roles: user.staff_roles });
      if (home === SUITE_HOME_ROUTE) {
        navigate(home);
      } else {
        navigate(home, { replace: true });
      }
    },
    onRegistrationRequired: (data) => {
      toast({
        title: t`Finish your registration`,
        description: t`We need a few more details to set up your account.`,
      });
      navigate('/complete-registration', { state: data });
    },
    onError: (error) => {
      const mapped = mapError(error);
      toast({
        variant: 'destructive',
        title: mapped.category === 'NETWORK' ? t`Connection error` : t`Could not sign in`,
        description: mapped.message,
      });
    },
  });

  useEffect(() => {
    // We only want to trigger the redirect if we are authenticated and not currently in the middle of signing in
    // and if there are no ongoing MFA checks.
    if (
      isAuthenticated &&
      user &&
      !isLoading &&
      !isSigningIn &&
      !requires2FA &&
      !requires2FAEnrollment &&
      !requiresEmailVerification
    ) {
      navigate(getHomeRoute({ roles: user.roles, staff_roles: user.staff_roles }), {
        replace: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAuthenticated,
    user,
    isLoading,
    navigate,
    isSigningIn,
    requires2FA,
    requires2FAEnrollment,
    requiresEmailVerification,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requires2FAEnrollment) {
      enroll2FA(verificationCode);
    } else if (requires2FA) {
      resolve2FA(verificationCode);
    } else if (requiresEmailVerification) {
      // Re-attempt sign-in with the cached credentials; if the user has now
      // verified their email, the flow proceeds into MFA enrollment.
      signIn({ email: formData.email, password: formData.password });
    } else {
      signIn({ email: formData.email, password: formData.password });
    }
  };

  const otpauthUrl = useMemo(() => {
    if (!totpSecret) return null;
    return totpSecret.generateQrCodeUrl(formData.email, 'Soberana');
  }, [totpSecret, formData.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <Card className="shadow-sm flex flex-col max-h-[calc(100dvh-10rem)] overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (requires2FA || requires2FAEnrollment || requiresEmailVerification) {
                clearMfaState();
              } else {
                onBack ? onBack() : navigate('/');
              }
            }}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <Trans>Back</Trans>
          </Button>
        </div>
        <CardTitle className="text-2xl">
          {requiresEmailVerification ? (
            <Trans>Verify your email</Trans>
          ) : requires2FAEnrollment ? (
            <Trans>Secure your account</Trans>
          ) : requires2FA ? (
            <Trans>Two-step verification</Trans>
          ) : (
            <Trans>Login to Your Account</Trans>
          )}
        </CardTitle>
        <CardDescription>
          {requiresEmailVerification ? (
            <Trans>
              We sent a verification link to your inbox. Click the link to confirm your email, then
              come back here to continue.
            </Trans>
          ) : requires2FAEnrollment ? (
            <Trans>
              Scan the QR code with an authenticator app on your phone. You will need this app every
              time you sign in.
            </Trans>
          ) : requires2FA ? (
            <Trans>
              Open the authenticator app on your phone and enter the 6-digit code for Soberana.
            </Trans>
          ) : (
            <Trans>Enter your email and password to access your account</Trans>
          )}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <CardContent className="space-y-4 flex-1 min-h-0 overflow-y-auto">
          {requiresEmailVerification ? (
            <EmailVerificationNotice
              email={pendingVerificationEmail}
              isSending={isSigningIn}
              onResend={() => resendVerificationEmail()}
            />
          ) : requires2FAEnrollment ? (
            <div className="space-y-4 py-2 flex flex-col items-center">
              <TotpAuthHelp mode="enroll" />
              {otpauthUrl ? (
                <TotpEnrollmentPanel
                  otpauthUrl={otpauthUrl}
                  accountEmail={formData.email}
                  manualKey={totpSecret?.secretKey}
                />
              ) : null}
              <div className="w-full space-y-2">
                <Label htmlFor="verification-code-enroll">
                  <Trans>Verification code</Trans>
                </Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="verification-code-enroll"
                    name="verificationCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="\d{6}"
                    maxLength={6}
                    placeholder="123456"
                    className="pl-9 font-mono tracking-widest text-center"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>
            </div>
          ) : requires2FA ? (
            <div className="space-y-4 py-2 flex flex-col">
              <div className="space-y-2">
                <Label htmlFor="verification-code">
                  <Trans>Verification code</Trans>
                </Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="verification-code"
                    name="verificationCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="pl-10 text-center tracking-widest text-lg font-mono"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <TotpAuthHelp mode="verify" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="login-email">
                  <Trans>Email</Trans>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder={t`you@example.com`}
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">
                    <Trans>Password</Trans>
                  </Label>
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={() => navigate('/forgot-password')}
                  >
                    <Trans>Forgot password?</Trans>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t`••••••••`}
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? t`Hide password` : t`Show password`}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="login-rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, rememberMe: checked as boolean }))
                  }
                />
                <label
                  htmlFor="login-rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <Trans>Remember me</Trans>
                </label>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4 shrink-0">
          <Button variant="gradient" type="submit" className="w-full h-11" disabled={isSigningIn}>
            {isSigningIn
              ? requires2FA || requires2FAEnrollment
                ? t`Verifying...`
                : t`Signing in...`
              : requiresEmailVerification
                ? t`I've verified, try again`
                : requires2FAEnrollment
                  ? t`Continue`
                  : requires2FA
                    ? t`Verify`
                    : t`Sign In`}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <Trans>Don&apos;t have an account?</Trans>{' '}
            <button
              type="button"
              onClick={onSwitchToRegister ?? (() => navigate('/register'))}
              className="text-primary font-medium hover:underline"
            >
              <Trans>Sign up</Trans>
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
