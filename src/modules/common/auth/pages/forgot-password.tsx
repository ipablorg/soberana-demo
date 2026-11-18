import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';
import { ArrowLeft, CheckCircle2, Mail } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import loopayLogoDark from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png';
import loopayLogoLight from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png';
import { mapError } from '@/shared/lib/error-mapper';

import { useForgotPassword } from '../api/use-forgot-password';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useLingui();
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [requestError, setRequestError] = useState<string | null>(null);

  const { sendResetEmail, isLoading } = useForgotPassword({
    onSuccess: (sentEmail) => {
      setSubmittedEmail(sentEmail);
      setEmailSent(true);
      setRequestError(null);
    },
    onError: (error) => {
      setRequestError(mapError(error).message);
    },
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRequestError(null);
    sendResetEmail(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="hidden lg:flex flex-col justify-between h-[600px] rounded-xl bg-muted p-8"
        >
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-left"
            aria-label={t`Back to home`}
          >
            <img src={loopayLogoLight} alt="Soberana" className="h-8 w-auto dark:hidden" />
            <img src={loopayLogoDark} alt="Soberana" className="h-8 w-auto hidden dark:block" />
          </button>
          <div className="space-y-4">
            <p className="text-xs font-heading uppercase tracking-widest text-muted-foreground">
              Soberana
            </p>
            <h1 className="text-4xl font-heading font-bold leading-tight text-foreground">
              <Trans>Move money globally</Trans>
            </h1>
            <p className="text-lg font-body font-light text-muted-foreground leading-relaxed">
              <Trans>Fast, secure, and compliant</Trans>
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="min-w-0"
        >
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <Trans>Back</Trans>
                </Button>
              </div>
              <CardTitle className="text-2xl">
                {emailSent ? <Trans>Check your email</Trans> : <Trans>Forgot your password?</Trans>}
              </CardTitle>
              <CardDescription>
                {emailSent ? (
                  <Trans>If an account exists for this email, you&apos;ll receive password reset instructions shortly.</Trans>
                ) : (
                  <Trans>Enter your email and we&apos;ll send you instructions to reset your password.</Trans>
                )}
              </CardDescription>
            </CardHeader>

            {!emailSent ? (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-password-email">
                      <Trans>Email</Trans>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="forgot-password-email"
                        name="email"
                        type="email"
                        placeholder={t`you@example.com`}
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          if (requestError) {
                            setRequestError(null);
                          }
                        }}
                        className="pl-10"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  {requestError ? (
                    <p className="text-sm text-destructive">
                      {requestError}
                    </p>
                  ) : null}
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                  <Button
                    variant="gradient"
                    type="submit"
                    className="w-full h-11"
                    disabled={isLoading}
                  >
                    {isLoading ? t`Sending...` : t`Send reset instructions`}
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    <Trans>Remember your password?</Trans>{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="text-primary font-medium hover:underline"
                    >
                      <Trans>Sign In</Trans>
                    </button>
                  </div>
                </CardFooter>
              </form>
            ) : (
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center text-center space-y-4 py-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>

                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      <Trans>
                        If an account exists for <strong>{submittedEmail}</strong>, you&apos;ll receive an email with reset instructions shortly.
                      </Trans>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <Trans>Didn&apos;t receive the email? Check your spam folder or</Trans>{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setEmailSent(false);
                          setRequestError(null);
                        }}
                        className="text-primary hover:underline"
                      >
                        <Trans>try again</Trans>
                      </button>
                    </p>
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
                  <Trans>Back to login</Trans>
                </Button>
              </CardContent>
            )}
          </Card>

          <div className="lg:hidden text-center mt-6">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <Trans>Back to Home</Trans>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
