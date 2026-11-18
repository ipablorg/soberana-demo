import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from '@/shared/components/animated-icons';
import { Trans, useLingui } from '@lingui/react/macro';
import { useSignUp } from '../api/use-sign-up';
import { useFormSubmissionGuard } from '../hooks/use-form-submission-guard';
import { useToast } from '@/shared/components/ui/use-toast';
import { mapError } from '@/shared/lib/error-mapper';
import { motion, AnimatePresence } from 'framer-motion';
import { PersonalInfoStep } from './register/PersonalInfoStep';
import { SecurityStep } from './register/SecurityStep';
import type { RegisterFormData, PasswordValidation } from './register/constants';
import { EmailVerificationNotice } from './email-verification-notice';

export type { RegisterFormData, PasswordValidation } from './register/constants';

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
  onBack?: () => void;
}

export function RegisterForm({ onSwitchToLogin, onBack }: RegisterFormProps) {
  const navigate = useNavigate();
  const { t } = useLingui();
  const { toast } = useToast();
  const { guardSubmission, isSubmitting: isFormSubmitting } = useFormSubmissionGuard({
    cooldownMs: 3000, // 3 second cooldown to prevent rapid resubmissions
    onBlocked: () => {
      toast({
        variant: 'destructive',
        title: t`Submission in progress`,
        description: t`Please wait while we process your registration.`,
      });
    },
  });
  const [step, setStep] = useState<1 | 2>(1);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const {
    signUp,
    resendVerificationEmail,
    pendingVerificationEmail,
    verificationEmailStatus,
    isLoading: isSigningUp,
  } = useSignUp({
    onSuccess: (data) => {
      setRegisteredEmail(data.email);
    },
    onError: (error) => {
      const mapped = mapError(error);
      toast({
        variant: 'destructive',
        title: mapped.category === 'NETWORK'
          ? t`Connection error`
          : mapped.category === 'VALIDATION'
            ? t`Validation error`
            : t`We couldn't create your account`,
        description: mapped.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({ variant: 'destructive', title: t`Passwords don't match`, description: t`Make sure both passwords are the same.` });
      return;
    }
    if (!formData.acceptTerms) {
      toast({ variant: 'destructive', title: t`Terms needed`, description: t`Accept the terms and conditions to continue.` });
      return;
    }

    // Guard the submission to prevent duplicates
    void guardSubmission(async () => {
      signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        policy: formData.acceptTerms,
      });
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));

    if (name === 'password') {
      setPasswordValidation({
        minLength: value.length >= 8,
        hasUpperCase: /[A-Z]/.test(value),
        hasLowerCase: /[a-z]/.test(value),
        hasNumber: /\d/.test(value),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }
  };

  const handleFieldChange = (field: keyof RegisterFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isPasswordValid = Object.values(passwordValidation).every((v) => v);

  const isStep1Valid =
    formData.firstName.trim() !== '' &&
    formData.lastName.trim() !== '' &&
    formData.email.trim() !== '';

  const handleNextStep = () => {
    if (!isStep1Valid) {
      toast({ variant: 'destructive', title: t`Complete all fields`, description: t`Fill in all fields before continuing.` });
      return;
    }
    setStep(2);
  };

  const stepVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -80 : 80, opacity: 0 }),
  };

  const switchToLogin = onSwitchToLogin ?? (() => navigate('/login'));

  if (registeredEmail) {
    return (
      <Card className="shadow-sm flex flex-col">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl">
            <Trans>Verify your email</Trans>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            <Trans>
              Before entering the suite, confirm your email address and then sign in to continue your onboarding.
            </Trans>
          </p>
        </CardHeader>

        <div className="px-6 pb-2">
          <EmailVerificationNotice
            email={pendingVerificationEmail ?? registeredEmail}
            isSending={isSigningUp}
            onResend={() => resendVerificationEmail()}
            status={verificationEmailStatus === 'failed' ? 'failed' : 'sent'}
          />
        </div>

        <div className="px-6 pb-6 flex flex-col gap-3">
          <Button variant="gradient" className="w-full" onClick={switchToLogin}>
            <Trans>Go to sign in</Trans>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm flex flex-col max-h-[calc(100dvh-10rem)] overflow-hidden">
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={step === 2 ? () => setStep(1) : (onBack ?? (() => navigate('/')))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl">
              <Trans>Create Account</Trans>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {step === 1
                ? t`Step 1 of 2 — Your information`
                : t`Step 2 of 2 — Secure your account`}
            </p>
          </div>
        </div>
        <div className="flex gap-1.5 mt-3">
          <div className={`h-1 flex-1 rounded-full transition-colors duration-200 ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-1 flex-1 rounded-full transition-colors duration-200 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait" custom={step === 1 ? -1 : 1}>
            {step === 1 && (
              <motion.div
                key="step-1"
                custom={1}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="flex-1 min-h-0 flex flex-col"
              >
                <PersonalInfoStep
                  formData={formData}
                  onChange={handleChange}
                  onFieldChange={handleFieldChange}
                  onNext={handleNextStep}
                  onSwitchToLogin={switchToLogin}
                  isValid={isStep1Valid}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                custom={1}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="flex-1 min-h-0 flex flex-col"
              >
                <SecurityStep
                  formData={formData}
                  passwordValidation={passwordValidation}
                  onChange={handleChange}
                  onFieldChange={handleFieldChange}
                  onSwitchToLogin={switchToLogin}
                  isSubmitting={isSigningUp || isFormSubmitting}
                  isPasswordValid={isPasswordValid}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </Card>
  );
}
